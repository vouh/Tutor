/**
 * Admin Controller - Dashboard & User Management
 * Admin-only functions for managing platform data and users
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Validate admin role
 */
const assertAdmin = (context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new Error('Admin access required');
  }
};

/**
 * Get all users with optional filtering
 * 
 * @param {Object} data - { role?: 'student'|'instructor'|'admin', limit?: number, offset?: number }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Array of users
 */
const getAllUsers = async (data, context) => {
  assertAdmin(context);

  try {
    const { role, limit = 50, offset = 0 } = data || {};

    let query = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit).offset(offset);

    const snapshot = await query.get();
    const users = [];

    snapshot.forEach(doc => {
      users.push({
        userId: doc.id,
        ...doc.data(),
        // Don't expose sensitive data in list view
        createdAt: doc.data().createdAt,
        displayName: doc.data().displayName,
        email: doc.data().email,
        role: doc.data().role,
        totalCoursesPurchased: doc.data().totalCoursesPurchased || 0,
        totalSpent: doc.data().totalSpent || 0,
      });
    });

    return {
      success: true,
      data: users,
      count: users.length,
      offset,
    };
  } catch (error) {
    console.error(`Error fetching users: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get detailed user profile (admin view)
 * 
 * @param {Object} data - { userId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Full user data
 */
const getUserDetails = async (data, context) => {
  assertAdmin(context);

  try {
    const { userId } = data;

    if (!userId) {
      throw new Error('userId is required');
    }

    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists) {
      return {
        success: false,
        error: 'User not found',
      };
    }

    const userData = { userId, ...userDoc.data() };

    // Fetch enrolled courses
    const enrollmentSnapshot = await db.collection('enrollments')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    const courses = [];

    for (const enrollmentDoc of enrollmentSnapshot.docs) {
      const enrollmentData = enrollmentDoc.data();
      const courseDoc = await db.collection('courses').doc(enrollmentData.courseId).get();

      if (courseDoc.exists) {
        courses.push({
          courseId: enrollmentData.courseId,
          courseName: courseDoc.data().title,
          enrolledAt: enrollmentData.enrolledAt,
        });
      }
    }

    userData.enrolledCourses = courses;

    // Fetch certificates
    const certificateSnapshot = await db.collection('certificates')
      .where('userId', '==', userId)
      .get();

    userData.certificatesCount = certificateSnapshot.size;

    return {
      success: true,
      data: userData,
    };
  } catch (error) {
    console.error(`Error fetching user details: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Set admin role for a user
 * 
 * @param {Object} data - { userId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Success confirmation
 */
const setAdminRole = async (data, context) => {
  assertAdmin(context);

  try {
    const { userId } = data;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(userId, { admin: true });

    // Update Firestore
    await db.collection('users').doc(userId).update({
      role: 'admin',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `User ${userId} granted admin role`,
    };
  } catch (error) {
    console.error(`Error setting admin role: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Remove admin role from a user
 * 
 * @param {Object} data - { userId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Success confirmation
 */
const removeAdminRole = async (data, context) => {
  assertAdmin(context);

  try {
    const { userId } = data;

    if (!userId) {
      throw new Error('userId is required');
    }

    // Remove custom claims
    await admin.auth().setCustomUserClaims(userId, { admin: false });

    // Update Firestore
    await db.collection('users').doc(userId).update({
      role: 'student',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `Admin role removed from user ${userId}`,
    };
  } catch (error) {
    console.error(`Error removing admin role: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get dashboard statistics
 * 
 * @param {Object} data - {}
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Dashboard stats
 */
const getDashboardStats = async (data, context) => {
  assertAdmin(context);

  try {
    // Total users
    const usersSnapshot = await db.collection('users').get();
    const totalUsers = usersSnapshot.size;

    // Admin count
    const adminsSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();
    const adminCount = adminsSnapshot.size;

    // Total courses
    const coursesSnapshot = await db.collection('courses').get();
    const totalCourses = coursesSnapshot.size;

    // Published courses
    const publishedSnapshot = await db.collection('courses')
      .where('isPublished', '==', true)
      .get();
    const publishedCourses = publishedSnapshot.size;

    // Total enrollments
    const enrollmentsSnapshot = await db.collection('enrollments')
      .where('status', '==', 'active')
      .get();
    const totalEnrollments = enrollmentsSnapshot.size;

    // Total completed
    const certificatesSnapshot = await db.collection('certificates').get();
    const completedCourses = certificatesSnapshot.size;

    // Total revenue
    let totalRevenue = 0;
    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'confirmed')
      .get();

    paymentsSnapshot.forEach(doc => {
      totalRevenue += doc.data().amount || 0;
    });

    return {
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: adminCount,
          students: totalUsers - adminCount,
        },
        courses: {
          total: totalCourses,
          published: publishedCourses,
          drafts: totalCourses - publishedCourses,
        },
        enrollments: {
          total: totalEnrollments,
          completed: completedCourses,
          active: totalEnrollments - completedCourses,
        },
        revenue: {
          total: totalRevenue,
          currency: 'KES',
        },
      },
    };
  } catch (error) {
    console.error(`Error fetching dashboard stats: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get revenue analytics (monthly/daily breakdown)
 * 
 * @param {Object} data - { period: 'daily'|'monthly', days?: 30 }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Revenue data by period
 */
const getRevenueAnalytics = async (data, context) => {
  assertAdmin(context);

  try {
    const { period = 'daily', days = 30 } = data || {};

    const paymentsSnapshot = await db.collection('payments')
      .where('status', '==', 'confirmed')
      .get();

    const analytics = {};
    const now = new Date();

    paymentsSnapshot.forEach(doc => {
      const paymentData = doc.data();
      const confirmedAt = paymentData.confirmedAt.toDate();

      // Only include payments from last N days
      const daysDiff = Math.floor((now - confirmedAt) / (1000 * 60 * 60 * 24));
      if (daysDiff > days) return;

      let key;

      if (period === 'daily') {
        key = confirmedAt.toISOString().split('T')[0]; // YYYY-MM-DD
      } else {
        key = confirmedAt.toISOString().slice(0, 7); // YYYY-MM
      }

      if (!analytics[key]) {
        analytics[key] = {
          revenue: 0,
          count: 0,
        };
      }

      analytics[key].revenue += paymentData.amount || 0;
      analytics[key].count += 1;
    });

    // Convert to sorted array
    const analyticsArray = Object.entries(analytics)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([period, data]) => ({
        period,
        ...data,
      }));

    return {
      success: true,
      data: analyticsArray,
      summary: {
        totalRevenue: analyticsArray.reduce((sum, item) => sum + item.revenue, 0),
        totalTransactions: analyticsArray.reduce((sum, item) => sum + item.count, 0),
        period,
        days,
      },
    };
  } catch (error) {
    console.error(`Error fetching revenue analytics: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Log admin action for audit trail
 * 
 * @param {Object} data - { action, targetId, targetType, details }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Log created
 */
const logAdminAction = async (data, context) => {
  assertAdmin(context);

  try {
    const { action, targetId, targetType, details } = data;

    if (!action || !targetId || !targetType) {
      throw new Error('Missing required fields: action, targetId, targetType');
    }

    const logData = {
      adminId: context.auth.uid,
      action,
      targetId,
      targetType,
      details: details || null,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      ipAddress: null, // Could extract from request in HTTP function
    };

    const logRef = await db.collection('adminLogs').add(logData);

    return {
      success: true,
      data: {
        logId: logRef.id,
        ...logData,
      },
    };
  } catch (error) {
    console.error(`Error logging admin action: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  getAllUsers,
  getUserDetails,
  setAdminRole,
  removeAdminRole,
  getDashboardStats,
  getRevenueAnalytics,
  logAdminAction,
};
