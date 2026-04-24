/**
 * Firebase Cloud Functions - Main Entry Point
 * Tutor Kenya E-Learning Platform Backend
 * 
 * Firebase Config:
 * - Project: tutor-ba90d
 * - Region: us-central1
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import all controllers
const authController = require('./src/auth/onUserCreate');
const courseController = require('./src/courses/courseController');
const enrollmentController = require('./src/enrollments/enrollmentController');
const paymentController = require('./src/payments/mpesaCallback');
const progressController = require('./src/progress/progressController');
const adminController = require('./src/admin/adminController');

// =====================================================
// AUTH TRIGGERS & FUNCTIONS
// =====================================================

// Trigger: Create user record when new auth user signs up
exports.onUserCreate = functions.auth.user().onCreate(authController.onUserCreate);

// Callable: Update user profile
exports.updateUserProfile = functions.https.onCall(authController.updateUserProfile);

// Callable: Get user profile
exports.getUserProfile = functions.https.onCall(authController.getUserProfile);

// Callable: Change password
exports.changePassword = functions.https.onCall(authController.changePassword);

// Callable: Get user statistics
exports.getUserStats = functions.https.onCall(authController.getUserStats);

// =====================================================
// COURSE MANAGEMENT (Admin Only)
// =====================================================

exports.createCourse = functions.https.onCall(courseController.createCourse);
exports.updateCourse = functions.https.onCall(courseController.updateCourse);
exports.deleteCourse = functions.https.onCall(courseController.deleteCourse);
exports.getAllCourses = functions.https.onCall(courseController.getAllCourses);
exports.getCourseDetails = functions.https.onCall(courseController.getCourseDetails);

// =====================================================
// MODULE & LESSON MANAGEMENT (Admin Only)
// =====================================================

exports.createModule = functions.https.onCall(courseController.createModule);
exports.updateModule = functions.https.onCall(courseController.updateModule);
exports.deleteModule = functions.https.onCall(courseController.deleteModule);

exports.createLesson = functions.https.onCall(courseController.createLesson);
exports.updateLesson = functions.https.onCall(courseController.updateLesson);
exports.deleteLesson = functions.https.onCall(courseController.deleteLesson);
exports.getLesson = functions.https.onCall(courseController.getLesson);

// =====================================================
// FILE UPLOADS (Admin Only)
// =====================================================

exports.getThumbnailUploadUrl = functions.https.onCall(courseController.getThumbnailUploadUrl);
exports.getVideoUploadUrl = functions.https.onCall(courseController.getVideoUploadUrl);

// =====================================================
// ENROLLMENT & ACCESS
// =====================================================

exports.enrollUser = functions.https.onCall(enrollmentController.enrollUser);
exports.getUserEnrollments = functions.https.onCall(enrollmentController.getUserEnrollments);
exports.cancelEnrollment = functions.https.onCall(enrollmentController.cancelEnrollment);
exports.checkEnrollment = functions.https.onCall(enrollmentController.checkEnrollment);

// Scheduled: Clean up pending enrollments (daily at 02:00 EAT)
exports.cleanupPendingEnrollments = functions
  .pubsub
  .schedule('0 2 * * *')
  .timeZone('Africa/Nairobi')
  .onRun(enrollmentController.cleanupPendingEnrollments);

// =====================================================
// PAYMENTS & M-PESA
// =====================================================

// HTTP: M-Pesa callback webhook
exports.mpesaCallback = functions.https.onRequest(paymentController.mpesaCallback);

// Callable: Check payment status
exports.checkPaymentStatus = functions.https.onCall(paymentController.checkPaymentStatus);

// Callable: Sync payment status with M-Pesa (admin only)
exports.syncPaymentStatus = functions.https.onCall(paymentController.syncPaymentStatus);

// =====================================================
// PROGRESS TRACKING
// =====================================================

exports.markLessonComplete = functions.https.onCall(progressController.markLessonComplete);
exports.getCourseProgress = functions.https.onCall(progressController.getCourseProgress);
exports.getUserProgress = functions.https.onCall(progressController.getUserProgress);
exports.getLessonProgress = functions.https.onCall(progressController.getLessonProgress);
exports.resetCourseProgress = functions.https.onCall(progressController.resetCourseProgress);

// =====================================================
// ADMIN DASHBOARD
// =====================================================

exports.getAllUsers = functions.https.onCall(adminController.getAllUsers);
exports.getUserDetails = functions.https.onCall(adminController.getUserDetails);
exports.setAdminRole = functions.https.onCall(adminController.setAdminRole);
exports.removeAdminRole = functions.https.onCall(adminController.removeAdminRole);
exports.getDashboardStats = functions.https.onCall(adminController.getDashboardStats);
exports.getRevenueAnalytics = functions.https.onCall(adminController.getRevenueAnalytics);
exports.logAdminAction = functions.https.onCall(adminController.logAdminAction);

// =====================================================
// SCHEDULED TASKS
// =====================================================

// Scheduled: Send course reminders (weekly on Sunday at 10:00 EAT)
exports.sendCourseReminders = functions
  .pubsub
  .schedule('0 10 * * 0')
  .timeZone('Africa/Nairobi')
  .onRun(async (context) => {
    try {
      const db = admin.firestore();
      const emailHelper = require('./src/email/sendgridHelper');

      // Get all active users
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();

        // Get user's enrolled courses
        const enrollmentSnapshot = await db.collection('enrollments')
          .where('userId', '==', userDoc.id)
          .where('status', '==', 'active')
          .get();

        if (enrollmentSnapshot.size > 0) {
          const courses = [];

          for (const enrollmentDoc of enrollmentSnapshot.docs) {
            const courseDoc = await db.collection('courses').doc(enrollmentDoc.data().courseId).get();
            const progressDoc = await db.collection('progress')
              .doc(userDoc.id)
              .collection('courses')
              .doc(enrollmentDoc.data().courseId)
              .get();

            if (courseDoc.exists) {
              courses.push({
                courseId: courseDoc.id,
                courseName: courseDoc.data().title,
                percentComplete: progressDoc.data()?.percentComplete || 0,
              });
            }
          }

          // Send reminder email
          if (courses.length > 0 && userData.preferences?.newsletter !== false) {
            await emailHelper.sendCourseReminder(
              userData.email,
              userData.displayName,
              courses
            );
          }
        }
      }

      console.log(`Course reminders sent to ${usersSnapshot.size} users`);
    } catch (error) {
      console.error(`Error in sendCourseReminders: ${error.message}`);
      throw error;
    }
  });

// =====================================================
// HEALTH CHECK & MONITORING
// =====================================================

exports.healthCheck = functions.https.onRequest((req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});
