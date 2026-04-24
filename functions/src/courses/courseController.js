/**
 * Course Controller - Course, Module & Lesson Management
 * Admin-only CRUD operations for course content
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const storage = admin.storage().bucket();

/**
 * Validate admin role
 */
const assertAdmin = (context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new Error('Admin access required');
  }
};

/**
 * Create a new course
 * 
 * @param {Object} data - { title, description, price, category, level, instructorId, thumbnail? }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Created course with ID
 */
const createCourse = async (data, context) => {
  assertAdmin(context);

  try {
    const { title, description, price, category, level, instructorId, thumbnail } = data;

    // Validate required fields
    if (!title || !description || typeof price !== 'number' || !category || !level) {
      throw new Error('Missing required fields: title, description, price, category, level');
    }

    if (price < 0) {
      throw new Error('Price must be non-negative');
    }

    const courseData = {
      title,
      description,
      price,
      category,
      level,
      instructorId,
      thumbnail: thumbnail || null,
      isPublished: false,
      totalLessons: 0,
      totalDuration: 0, // in minutes
      enrollmentCount: 0,
      rating: 0,
      reviewCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      publishedAt: null,
    };

    const courseRef = await db.collection('courses').add(courseData);

    return {
      success: true,
      data: {
        courseId: courseRef.id,
        ...courseData,
      },
    };
  } catch (error) {
    console.error(`Error creating course: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update course details
 * 
 * @param {Object} data - { courseId, updates: {...} }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Updated course
 */
const updateCourse = async (data, context) => {
  assertAdmin(context);

  try {
    const { courseId, updates } = data;

    if (!courseId) {
      throw new Error('courseId is required');
    }

    // Prevent direct modification of certain fields
    const { createdAt, enrollmentCount, ...safeUpdates } = updates;

    const updateData = {
      ...safeUpdates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    // If publishing for the first time, set publishedAt
    if (updates.isPublished && !updates.publishedAt) {
      updateData.publishedAt = admin.firestore.FieldValue.serverTimestamp();
    }

    const courseRef = db.collection('courses').doc(courseId);
    await courseRef.update(updateData);

    const updated = await courseRef.get();

    return {
      success: true,
      data: updated.data(),
    };
  } catch (error) {
    console.error(`Error updating course: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete a course (soft delete - mark as archived)
 * 
 * @param {Object} data - { courseId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Success message
 */
const deleteCourse = async (data, context) => {
  assertAdmin(context);

  try {
    const { courseId } = data;

    if (!courseId) {
      throw new Error('courseId is required');
    }

    // Archive the course instead of deleting
    await db.collection('courses').doc(courseId).update({
      isPublished: false,
      archivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      success: true,
      message: `Course ${courseId} archived successfully`,
    };
  } catch (error) {
    console.error(`Error deleting course: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get all courses (with filter options)
 * 
 * @param {Object} data - { publishedOnly?: boolean, category?: string, limit?: number }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Array of courses
 */
const getAllCourses = async (data, context) => {
  // Admins see all, others see only published
  const isAdmin = context.auth && context.auth.token.admin === true;
  const { publishedOnly = !isAdmin, category, limit = 100 } = data || {};

  try {
    let query = db.collection('courses');

    if (publishedOnly) {
      query = query.where('isPublished', '==', true);
    }

    if (category) {
      query = query.where('category', '==', category);
    }

    query = query.orderBy('createdAt', 'desc').limit(limit);

    const snapshot = await query.get();
    const courses = [];

    snapshot.forEach(doc => {
      courses.push({
        courseId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: courses,
      count: courses.length,
    };
  } catch (error) {
    console.error(`Error fetching courses: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get single course with all modules and lessons
 * 
 * @param {Object} data - { courseId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Course with nested content
 */
const getCourseDetails = async (data, context) => {
  try {
    const { courseId } = data;

    if (!courseId) {
      throw new Error('courseId is required');
    }

    const courseDoc = await db.collection('courses').doc(courseId).get();

    if (!courseDoc.exists) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    const courseData = { courseId, ...courseDoc.data() };

    // Check publication access
    const isAdmin = context.auth && context.auth.token.admin === true;
    if (!courseData.isPublished && !isAdmin) {
      return {
        success: false,
        error: 'Course not found',
      };
    }

    // Fetch all modules
    const modulesSnapshot = await db.collection('modules')
      .where('courseId', '==', courseId)
      .orderBy('order', 'asc')
      .get();

    const modules = [];

    for (const moduleDoc of modulesSnapshot.docs) {
      const moduleData = { moduleId: moduleDoc.id, ...moduleDoc.data() };

      // Fetch lessons for this module
      const lessonsSnapshot = await db.collection('lessons')
        .where('moduleId', '==', moduleDoc.id)
        .orderBy('order', 'asc')
        .get();

      const lessons = [];
      lessonsSnapshot.forEach(lessonDoc => {
        lessons.push({
          lessonId: lessonDoc.id,
          ...lessonDoc.data(),
        });
      });

      moduleData.lessons = lessons;
      modules.push(moduleData);
    }

    courseData.modules = modules;

    return {
      success: true,
      data: courseData,
    };
  } catch (error) {
    console.error(`Error fetching course details: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create a module within a course
 * 
 * @param {Object} data - { courseId, title, order }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Created module
 */
const createModule = async (data, context) => {
  assertAdmin(context);

  try {
    const { courseId, title, order } = data;

    if (!courseId || !title || typeof order !== 'number') {
      throw new Error('Missing required fields: courseId, title, order');
    }

    const moduleData = {
      courseId,
      title,
      order,
      lessons: [],
      totalLessons: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const moduleRef = await db.collection('modules').add(moduleData);

    return {
      success: true,
      data: {
        moduleId: moduleRef.id,
        ...moduleData,
      },
    };
  } catch (error) {
    console.error(`Error creating module: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update module
 * 
 * @param {Object} data - { moduleId, updates: {...} }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Updated module
 */
const updateModule = async (data, context) => {
  assertAdmin(context);

  try {
    const { moduleId, updates } = data;

    if (!moduleId) {
      throw new Error('moduleId is required');
    }

    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const moduleRef = db.collection('modules').doc(moduleId);
    await moduleRef.update(updateData);

    const updated = await moduleRef.get();

    return {
      success: true,
      data: { moduleId, ...updated.data() },
    };
  } catch (error) {
    console.error(`Error updating module: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete module
 * 
 * @param {Object} data - { moduleId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Success message
 */
const deleteModule = async (data, context) => {
  assertAdmin(context);

  try {
    const { moduleId } = data;

    if (!moduleId) {
      throw new Error('moduleId is required');
    }

    // Delete all lessons in module
    const lessonsSnapshot = await db.collection('lessons')
      .where('moduleId', '==', moduleId)
      .get();

    const batch = db.batch();

    lessonsSnapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    batch.delete(db.collection('modules').doc(moduleId));
    await batch.commit();

    return {
      success: true,
      message: `Module and its lessons deleted`,
    };
  } catch (error) {
    console.error(`Error deleting module: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Create a lesson
 * 
 * @param {Object} data - { moduleId, courseId, title, type, contentUrl?, textContent?, duration, order }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Created lesson
 */
const createLesson = async (data, context) => {
  assertAdmin(context);

  try {
    const { moduleId, courseId, title, type, contentUrl, textContent, duration, order } = data;

    if (!moduleId || !courseId || !title || !type || typeof duration !== 'number' || typeof order !== 'number') {
      throw new Error('Missing required fields');
    }

    const lessonData = {
      moduleId,
      courseId,
      title,
      type, // 'video', 'text', or 'quiz'
      contentUrl: contentUrl || null,
      textContent: textContent || null,
      duration, // in minutes
      order,
      isPublished: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const lessonRef = await db.collection('lessons').add(lessonData);

    return {
      success: true,
      data: {
        lessonId: lessonRef.id,
        ...lessonData,
      },
    };
  } catch (error) {
    console.error(`Error creating lesson: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Update lesson
 * 
 * @param {Object} data - { lessonId, updates: {...} }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Updated lesson
 */
const updateLesson = async (data, context) => {
  assertAdmin(context);

  try {
    const { lessonId, updates } = data;

    if (!lessonId) {
      throw new Error('lessonId is required');
    }

    const updateData = {
      ...updates,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const lessonRef = db.collection('lessons').doc(lessonId);
    await lessonRef.update(updateData);

    const updated = await lessonRef.get();

    return {
      success: true,
      data: { lessonId, ...updated.data() },
    };
  } catch (error) {
    console.error(`Error updating lesson: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Delete lesson
 * 
 * @param {Object} data - { lessonId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Success message
 */
const deleteLesson = async (data, context) => {
  assertAdmin(context);

  try {
    const { lessonId } = data;

    if (!lessonId) {
      throw new Error('lessonId is required');
    }

    await db.collection('lessons').doc(lessonId).delete();

    return {
      success: true,
      message: 'Lesson deleted successfully',
    };
  } catch (error) {
    console.error(`Error deleting lesson: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get single lesson by ID
 * 
 * @param {Object} data - { lessonId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Lesson data
 */
const getLesson = async (data, context) => {
  try {
    const { lessonId } = data;

    if (!lessonId) {
      throw new Error('lessonId is required');
    }

    const lessonDoc = await db.collection('lessons').doc(lessonId).get();

    if (!lessonDoc.exists) {
      return {
        success: false,
        error: 'Lesson not found',
      };
    }

    return {
      success: true,
      data: { lessonId, ...lessonDoc.data() },
    };
  } catch (error) {
    console.error(`Error fetching lesson: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get signed URL for thumbnail upload
 * 
 * @param {Object} data - { courseId, fileName }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Signed upload URL
 */
const getThumbnailUploadUrl = async (data, context) => {
  assertAdmin(context);

  try {
    const { courseId, fileName } = data;

    if (!courseId || !fileName) {
      throw new Error('courseId and fileName required');
    }

    const filePath = `thumbnails/${courseId}/${Date.now()}_${fileName}`;
    const file = storage.file(filePath);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: 'image/*',
    });

    return {
      success: true,
      uploadUrl: url,
      filePath,
    };
  } catch (error) {
    console.error(`Error getting thumbnail upload URL: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get signed URL for video upload
 * 
 * @param {Object} data - { courseId, fileName }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Signed upload URL
 */
const getVideoUploadUrl = async (data, context) => {
  assertAdmin(context);

  try {
    const { courseId, fileName } = data;

    if (!courseId || !fileName) {
      throw new Error('courseId and fileName required');
    }

    const filePath = `videos/${courseId}/${Date.now()}_${fileName}`;
    const file = storage.file(filePath);

    const [url] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 60 * 60 * 1000, // 1 hour
      contentType: 'video/*',
    });

    return {
      success: true,
      uploadUrl: url,
      filePath,
    };
  } catch (error) {
    console.error(`Error getting video upload URL: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  createCourse,
  updateCourse,
  deleteCourse,
  getAllCourses,
  getCourseDetails,
  createModule,
  updateModule,
  deleteModule,
  createLesson,
  updateLesson,
  deleteLesson,
  getLesson,
  getThumbnailUploadUrl,
  getVideoUploadUrl,
};
