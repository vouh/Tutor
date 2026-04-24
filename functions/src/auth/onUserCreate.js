/**
 * Auth Controller - User Authentication & Onboarding
 * Handles Firebase Auth triggers and user document creation
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const auth = admin.auth();

/**
 * Trigger: When user signs up with email/password or Google Sign-In
 * Creates a Firestore /users/{userId} document with initial data
 * 
 * @param {Object} user - Firebase Auth user object
 * @returns {Promise<void>}
 */
const onUserCreate = async (user) => {
  try {
    const { uid, email, displayName, photoURL, providerData } = user;

    // Detect sign-up provider
    const provider = providerData && providerData.length > 0 
      ? providerData[0].providerId 
      : 'password';

    // Check if user already exists (prevent duplicates)
    const userRef = db.collection('users').doc(uid);
    const userSnap = await userRef.get();

    if (userSnap.exists) {
      console.log(`User ${uid} already exists in Firestore`);
      return;
    }

    // Create user document
    const userData = {
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      photoURL: photoURL || null,
      role: 'student', // New users are always students
      provider,
      enrolledCourses: [],
      totalCoursesPurchased: 0,
      totalSpent: 0,
      isEmailVerified: user.emailVerified || false,
      isActive: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
      preferences: {
        newsletter: true,
        notifications: true,
      },
      metadata: {
        signUpCountry: null,
        deviceType: null,
      },
    };

    // Write to Firestore
    await userRef.set(userData);

    // Create empty progress document
    await db.collection('progress').doc(uid).set({
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      totalCoursesEnrolled: 0,
    });

    console.log(`User document created for ${uid}`);

    // Optional: Send welcome email via SendGrid
    // const emailHelper = require('../email/sendgridHelper');
    // await emailHelper.sendWelcomeEmail(email, displayName);

  } catch (error) {
    console.error(`Error creating user on sign-up: ${error.message}`);
    throw error;
  }
};

/**
 * Update user profile
 * 
 * @param {Object} data - { displayName?, photoURL? }
 * @param {Object} context - Firebase Functions context with auth
 * @returns {Promise<Object>} Updated user data
 */
const updateUserProfile = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { uid } = context.auth;
    const { displayName, photoURL } = data;

    const updateData = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (displayName) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    const userRef = db.collection('users').doc(uid);
    await userRef.update(updateData);

    // Also update Firebase Auth profile
    const authUpdateData = {};
    if (displayName) authUpdateData.displayName = displayName;
    if (photoURL !== undefined) authUpdateData.photoURL = photoURL;

    if (Object.keys(authUpdateData).length > 0) {
      await auth.updateUser(uid, authUpdateData);
    }

    const updatedUser = await userRef.get();
    return {
      success: true,
      data: updatedUser.data(),
    };
  } catch (error) {
    console.error(`Error updating user profile: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user profile
 * 
 * @param {Object} data - { userId? } (optional, defaults to current user)
 * @param {Object} context - Firebase Functions context with auth
 * @returns {Promise<Object>} User profile data
 */
const getUserProfile = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const userId = data?.userId || context.auth.uid;
    
    // Users can only see their own profile unless admin
    const isAdmin = context.auth.token.admin === true;
    if (userId !== context.auth.uid && !isAdmin) {
      throw new Error('Unauthorized');
    }

    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    return {
      success: true,
      data: userDoc.data(),
    };
  } catch (error) {
    console.error(`Error fetching user profile: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Change user password
 * 
 * @param {Object} data - { currentPassword, newPassword }
 * @param {Object} context - Firebase Functions context with auth
 * @returns {Promise<Object>} Success/failure
 */
const changePassword = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { uid } = context.auth;
    const { newPassword } = data;

    // Password must be at least 6 characters
    if (!newPassword || newPassword.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
      };
    }

    // Update password in Firebase Auth
    await auth.updateUser(uid, { password: newPassword });

    return {
      success: true,
      message: 'Password changed successfully',
    };
  } catch (error) {
    console.error(`Error changing password: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user stats (for profile)
 * 
 * @param {Object} data - {}
 * @param {Object} context - Firebase Functions context with auth
 * @returns {Promise<Object>} User stats
 */
const getUserStats = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { uid } = context.auth;
    const userRef = db.collection('users').doc(uid);
    const progressRef = db.collection('progress').doc(uid);

    const [userDoc, progressDoc] = await Promise.all([
      userRef.get(),
      progressRef.get(),
    ]);

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const userData = userDoc.data();
    const progressData = progressDoc.data() || {};

    return {
      success: true,
      data: {
        totalCoursesPurchased: userData.totalCoursesPurchased || 0,
        totalSpent: userData.totalSpent || 0,
        totalCoursesEnrolled: progressData.totalCoursesEnrolled || 0,
        enrolledCourses: userData.enrolledCourses || [],
      },
    };
  } catch (error) {
    console.error(`Error fetching user stats: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  onUserCreate,
  updateUserProfile,
  getUserProfile,
  changePassword,
  getUserStats,
};
