/**
 * Progress Controller - Course Progress Tracking
 * Tracks completed lessons, calculates progress percentage, and issues certificates
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Mark a lesson as complete
 * Updates progress and checks if course is complete
 * 
 * @param {Object} data - { courseId, lessonId, duration }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Updated progress
 */
const markLessonComplete = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { courseId, lessonId, duration } = data;
    const userId = context.auth.uid;

    if (!courseId || !lessonId) {
      throw new Error('Missing required fields: courseId, lessonId');
    }

    // Verify user is enrolled
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();

    if (!enrollmentDoc.exists || enrollmentDoc.data().status !== 'active') {
      throw new Error('User not enrolled in this course');
    }

    // Get current progress
    const progressRef = db.collection('progress').doc(userId).collection('courses').doc(courseId);
    const progressDoc = await progressRef.get();

    if (!progressDoc.exists) {
      throw new Error('Progress record not found');
    }

    const progressData = progressDoc.data();
    const completedLessons = progressData.completedLessons || [];

    // Check if lesson already completed
    if (completedLessons.includes(lessonId)) {
      return {
        success: true,
        data: progressData,
        message: 'Lesson already marked as complete',
      };
    }

    // Add lesson to completed
    const updatedCompleted = [...completedLessons, lessonId];

    // Calculate total lessons in course
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', courseId)
      .get();

    let totalLessons = 0;

    for (const moduleDoc of modulesSnapshot.docs) {
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', moduleDoc.id)
        .get();
      totalLessons += lessonsSnapshot.size;
    }

    // Calculate progress percentage
    const percentComplete = totalLessons > 0 
      ? Math.round((updatedCompleted.length / totalLessons) * 100) 
      : 0;

    const batch = db.batch();

    // Update progress
    batch.update(progressRef, {
      completedLessons: updatedCompleted,
      lastLessonId: lessonId,
      percentComplete,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Update enrollment's last accessed time
    batch.update(db.collection('enrollments').doc(enrollmentId), {
      lastAccessedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedLessons: updatedCompleted,
    });

    // Check if course is completed (100%)
    if (percentComplete === 100) {
      // Award certificate
      const certificateId = `${userId}_${courseId}_${Date.now()}`;
      const courseDoc = await db.collection('courses').doc(courseId).get();
      const userDoc = await db.collection('users').doc(userId).get();

      batch.set(
        db.collection('certificates').doc(certificateId),
        {
          userId,
          courseId,
          courseName: courseDoc.data().title,
          userName: userDoc.data().displayName,
          userEmail: userDoc.data().email,
          issuedAt: admin.firestore.FieldValue.serverTimestamp(),
          certificateUrl: `/certificates/${certificateId}.pdf`,
        }
      );

      // Mark as completed
      batch.update(progressRef, {
        isCompleted: true,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        certificateId,
      });

      // Send certificate email
      try {
        const emailHelper = require('../email/sendgridHelper');
        await emailHelper.sendCertificateEmail(
          userDoc.data().email,
          userDoc.data().displayName,
          courseDoc.data().title,
          certificateId
        );
      } catch (emailError) {
        console.warn(`Failed to send certificate email: ${emailError.message}`);
      }
    }

    await batch.commit();

    return {
      success: true,
      data: {
        completedLessons: updatedCompleted,
        lastLessonId: lessonId,
        percentComplete,
        isCompleted: percentComplete === 100,
      },
      message: percentComplete === 100 
        ? 'Course completed! Certificate issued.'
        : `Progress updated: ${percentComplete}% complete`,
    };
  } catch (error) {
    console.error(`Error marking lesson complete: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get user's progress in a single course
 * 
 * @param {Object} data - { courseId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Course progress
 */
const getCourseProgress = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { courseId } = data;
    const userId = context.auth.uid;

    if (!courseId) {
      throw new Error('courseId is required');
    }

    // Verify user is enrolled
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();

    if (!enrollmentDoc.exists) {
      return {
        success: false,
        error: 'User not enrolled in this course',
      };
    }

    const progressDoc = await db.collection('progress')
      .doc(userId)
      .collection('courses')
      .doc(courseId)
      .get();

    if (!progressDoc.exists) {
      return {
        success: false,
        error: 'Progress record not found',
      };
    }

    const progressData = progressDoc.data();
    const courseDoc = await db.collection('courses').doc(courseId).get();

    return {
      success: true,
      data: {
        courseId,
        courseName: courseDoc.data().title,
        ...progressData,
      },
    };
  } catch (error) {
    console.error(`Error fetching course progress: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all user progress across enrolled courses
 * 
 * @param {Object} data - {}
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} All course progress
 */
const getUserProgress = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const userId = context.auth.uid;

    const coursesSnapshot = await db.collection('progress')
      .doc(userId)
      .collection('courses')
      .get();

    const progress = [];
    let totalPercentComplete = 0;

    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const course = await db.collection('courses').doc(courseDoc.id).get();

      progress.push({
        courseId: courseDoc.id,
        courseName: course.data().title,
        ...courseData,
      });

      totalPercentComplete += courseData.percentComplete || 0;
    }

    const averageProgress = progress.length > 0 
      ? Math.round(totalPercentComplete / progress.length) 
      : 0;

    return {
      success: true,
      data: progress,
      summary: {
        enrolledCourses: progress.length,
        completedCourses: progress.filter(p => p.isCompleted).length,
        averageProgress,
      },
    };
  } catch (error) {
    console.error(`Error fetching user progress: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get lesson details with completion status
 * 
 * @param {Object} data - { lessonId, courseId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Lesson with completion status
 */
const getLessonProgress = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { lessonId, courseId } = data;
    const userId = context.auth.uid;

    if (!lessonId || !courseId) {
      throw new Error('lessonId and courseId required');
    }

    const lessonDoc = await db.collection('lessons').doc(lessonId).get();
    if (!lessonDoc.exists) {
      return {
        success: false,
        error: 'Lesson not found',
      };
    }

    const progressDoc = await db.collection('progress')
      .doc(userId)
      .collection('courses')
      .doc(courseId)
      .get();

    const completedLessons = progressDoc.data()?.completedLessons || [];

    return {
      success: true,
      data: {
        lessonId,
        ...lessonDoc.data(),
        isCompleted: completedLessons.includes(lessonId),
      },
    };
  } catch (error) {
    console.error(`Error fetching lesson progress: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Reset user progress in a course (admin only)
 * 
 * @param {Object} data - { userId, courseId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Reset confirmation
 */
const resetCourseProgress = async (data, context) => {
  const isAdmin = context.auth && context.auth.token.admin === true;
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  try {
    const { userId, courseId } = data;

    if (!userId || !courseId) {
      throw new Error('userId and courseId required');
    }

    await db.collection('progress')
      .doc(userId)
      .collection('courses')
      .doc(courseId)
      .update({
        completedLessons: [],
        lastLessonId: null,
        percentComplete: 0,
        isCompleted: false,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

    return {
      success: true,
      message: `Progress reset for user ${userId} in course ${courseId}`,
    };
  } catch (error) {
    console.error(`Error resetting progress: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  markLessonComplete,
  getCourseProgress,
  getUserProgress,
  getLessonProgress,
  resetCourseProgress,
};
