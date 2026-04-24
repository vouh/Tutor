/**
 * Enrollment Controller - User Course Enrollment & Access
 * Handles enrollment creation, cancellation, and enrollment status
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const emailHelper = require('../email/sendgridHelper');

/**
 * Enroll user in a course
 * Called after M-Pesa payment confirmation
 * 
 * @param {Object} data - { userId, courseId, mpesaTransactionId, paymentId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Enrollment confirmation
 */
const enrollUser = async (data, context) => {
  try {
    const { userId, courseId, mpesaTransactionId, paymentId } = data;

    if (!userId || !courseId || !mpesaTransactionId) {
      throw new Error('Missing required fields: userId, courseId, mpesaTransactionId');
    }

    // Verify user exists
    const userDoc = await db.collection('users').doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }

    // Verify course exists
    const courseDoc = await db.collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      throw new Error('Course not found');
    }

    const courseData = courseDoc.data();
    const userData = userDoc.data();

    // Check if already enrolled
    const enrollmentId = `${userId}_${courseId}`;
    const existingEnrollment = await db.collection('enrollments').doc(enrollmentId).get();

    if (existingEnrollment.exists && existingEnrollment.data().status === 'active') {
      return {
        success: false,
        error: 'User already enrolled in this course',
      };
    }

    // Create/update enrollment document
    const enrollmentData = {
      userId,
      courseId,
      mpesaTransactionId,
      paymentId: paymentId || null,
      status: 'active',
      enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt: null, // Lifetime access
      completedLessons: [],
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const batch = db.batch();

    // Save enrollment
    batch.set(db.collection('enrollments').doc(enrollmentId), enrollmentData);

    // Update user's enrolledCourses array
    const updatedEnrolledCourses = userData.enrolledCourses || [];
    if (!updatedEnrolledCourses.includes(courseId)) {
      updatedEnrolledCourses.push(courseId);
    }

    batch.update(db.collection('users').doc(userId), {
      enrolledCourses: updatedEnrolledCourses,
      totalCoursesPurchased: (userData.totalCoursesPurchased || 0) + 1,
      totalSpent: (userData.totalSpent || 0) + courseData.price,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Initialize progress tracking for this course
    batch.set(
      db.collection('progress').doc(userId).collection('courses').doc(courseId),
      {
        courseId,
        completedLessons: [],
        lastLessonId: null,
        percentComplete: 0,
        startedAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      }
    );

    // Update course enrollment count
    batch.update(db.collection('courses').doc(courseId), {
      enrollmentCount: (courseData.enrollmentCount || 0) + 1,
    });

    await batch.commit();

    // Send confirmation email
    try {
      await emailHelper.sendEnrollmentConfirmation(
        userData.email,
        userData.displayName,
        courseData.title,
        courseId
      );
    } catch (emailError) {
      console.warn(`Failed to send enrollment email: ${emailError.message}`);
      // Don't fail the enrollment if email fails
    }

    return {
      success: true,
      data: {
        enrollmentId,
        ...enrollmentData,
      },
      message: `Successfully enrolled in ${courseData.title}`,
    };
  } catch (error) {
    console.error(`Error enrolling user: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's enrollments
 * 
 * @param {Object} data - { userId? }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Array of enrollments
 */
const getUserEnrollments = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const userId = data?.userId || context.auth.uid;

    // Users can only see their own unless admin
    const isAdmin = context.auth.token.admin === true;
    if (userId !== context.auth.uid && !isAdmin) {
      throw new Error('Unauthorized');
    }

    const enrollmentSnapshot = await db.collection('enrollments')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    const enrollments = [];

    for (const doc of enrollmentSnapshot.docs) {
      const enrollmentData = doc.data();
      
      // Fetch course details
      const courseDoc = await db.collection('courses').doc(enrollmentData.courseId).get();

      enrollments.push({
        enrollmentId: doc.id,
        ...enrollmentData,
        courseName: courseDoc.data()?.title || 'Unknown',
        coursePrice: courseDoc.data()?.price || 0,
      });
    }

    return {
      success: true,
      data: enrollments,
      count: enrollments.length,
    };
  } catch (error) {
    console.error(`Error fetching enrollments: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Cancel enrollment (refund)
 * 
 * @param {Object} data - { enrollmentId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Cancellation confirmation
 */
const cancelEnrollment = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { enrollmentId } = data;

    if (!enrollmentId) {
      throw new Error('enrollmentId is required');
    }

    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();

    if (!enrollmentDoc.exists) {
      return {
        success: false,
        error: 'Enrollment not found',
      };
    }

    const enrollmentData = enrollmentDoc.data();
    const [userId, courseId] = enrollmentId.split('_');

    // Verify user owns this enrollment
    if (userId !== context.auth.uid && context.auth.token.admin !== true) {
      throw new Error('Unauthorized');
    }

    const batch = db.batch();

    // Update enrollment status to cancelled
    batch.update(db.collection('enrollments').doc(enrollmentId), {
      status: 'cancelled',
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Remove course from user's enrolledCourses
    const userDoc = await db.collection('users').doc(userId).get();
    const enrolledCourses = userDoc.data().enrolledCourses || [];
    const updatedCourses = enrolledCourses.filter(id => id !== courseId);

    batch.update(db.collection('users').doc(userId), {
      enrolledCourses: updatedCourses,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update course enrollment count
    const courseDoc = await db.collection('courses').doc(courseId).get();
    const enrollmentCount = Math.max(0, (courseDoc.data().enrollmentCount || 1) - 1);

    batch.update(db.collection('courses').doc(courseId), {
      enrollmentCount,
    });

    await batch.commit();

    return {
      success: true,
      message: 'Enrollment cancelled successfully',
    };
  } catch (error) {
    console.error(`Error cancelling enrollment: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Check if user is enrolled in a course
 * 
 * @param {Object} data - { courseId, userId? }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Enrollment status
 */
const checkEnrollment = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const userId = data?.userId || context.auth.uid;
    const { courseId } = data;

    if (!courseId) {
      throw new Error('courseId is required');
    }

    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();

    if (!enrollmentDoc.exists) {
      return {
        success: true,
        isEnrolled: false,
      };
    }

    const enrollmentData = enrollmentDoc.data();

    return {
      success: true,
      isEnrolled: enrollmentData.status === 'active',
      enrollment: enrollmentData,
    };
  } catch (error) {
    console.error(`Error checking enrollment: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Clean up pending enrollments (scheduled task)
 * Removes enrollments pending payment for more than 24 hours
 * 
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Cleanup summary
 */
const cleanupPendingEnrollments = async (context) => {
  try {
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const pendingSnapshot = await db.collection('enrollments')
      .where('status', '==', 'pending')
      .get();

    const batch = db.batch();
    let deletedCount = 0;

    pendingSnapshot.forEach(doc => {
      const createdAt = doc.data().enrolledAt.toMillis();

      if (createdAt < oneDayAgo) {
        batch.delete(doc.ref);
        deletedCount++;
      }
    });

    await batch.commit();

    console.log(`Cleaned up ${deletedCount} pending enrollments`);

    return {
      success: true,
      message: `Cleaned up ${deletedCount} pending enrollments`,
    };
  } catch (error) {
    console.error(`Error cleaning up enrollments: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  enrollUser,
  getUserEnrollments,
  cancelEnrollment,
  checkEnrollment,
  cleanupPendingEnrollments,
};
