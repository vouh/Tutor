/**
 * Utilities & Validation Helpers
 * Shared functions for validation, error handling, and common operations
 */

const admin = require('firebase-admin');
const db = admin.firestore();

/**
 * Validate user authentication
 * 
 * @param {Object} context - Firebase Functions context
 * @throws {Error} If not authenticated
 */
const requireAuth = (context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }
};

/**
 * Validate admin role
 * 
 * @param {Object} context - Firebase Functions context
 * @throws {Error} If not admin
 */
const requireAdmin = (context) => {
  if (!context.auth || context.auth.token.admin !== true) {
    throw new Error('Admin access required');
  }
};

/**
 * Validate required fields in data object
 * 
 * @param {Object} data - Data to validate
 * @param {Array<string>} requiredFields - List of required field names
 * @throws {Error} If any required field is missing
 */
const validateRequired = (data, requiredFields = []) => {
  for (const field of requiredFields) {
    if (!data || !(field in data) || data[field] === null || data[field] === undefined) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
};

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} Valid email or not
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate MongoDB ObjectId format
 * 
 * @param {string} id - ID to validate
 * @returns {boolean} Valid ID or not
 */
const isValidId = (id) => {
  return typeof id === 'string' && id.length > 0 && id.length < 256;
};

/**
 * Sanitize user input to prevent XSS
 * 
 * @param {string} input - User input
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '')
    .trim()
    .substring(0, 1000); // Max 1000 chars
};

/**
 * Format error response
 * 
 * @param {Error} error - Error object
 * @param {string} defaultMessage - Default message if error has no message
 * @returns {Object} Formatted error response
 */
const formatErrorResponse = (error, defaultMessage = 'An error occurred') => {
  const message = error?.message || defaultMessage;

  return {
    success: false,
    error: message,
  };
};

/**
 * Format success response
 * 
 * @param {any} data - Response data
 * @param {string} message - Optional success message
 * @returns {Object} Formatted success response
 */
const formatSuccessResponse = (data = null, message = null) => {
  const response = {
    success: true,
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  if (message) {
    response.message = message;
  }

  return response;
};

/**
 * Check if user is enrolled in a course
 * 
 * @param {string} userId - User ID
 * @param {string} courseId - Course ID
 * @returns {Promise<boolean>} Enrolled or not
 */
const isUserEnrolled = async (userId, courseId) => {
  try {
    const enrollmentId = `${userId}_${courseId}`;
    const enrollmentDoc = await db.collection('enrollments').doc(enrollmentId).get();

    return enrollmentDoc.exists && enrollmentDoc.data().status === 'active';
  } catch (error) {
    console.error(`Error checking enrollment: ${error.message}`);
    return false;
  }
};

/**
 * Check if user is admin
 * 
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Is admin or not
 */
const isUserAdmin = async (userId) => {
  try {
    const userDoc = await db.collection('users').doc(userId).get();
    return userDoc.exists && userDoc.data().role === 'admin';
  } catch (error) {
    console.error(`Error checking admin role: ${error.message}`);
    return false;
  }
};

/**
 * Verify ownership (user owns the resource)
 * 
 * @param {Object} context - Firebase Functions context
 * @param {string} ownerId - ID of owner
 * @throws {Error} If user is not owner or admin
 */
const verifyOwnership = (context, ownerId) => {
  const isAdmin = context.auth && context.auth.token.admin === true;
  const isOwner = context.auth && context.auth.uid === ownerId;

  if (!isOwner && !isAdmin) {
    throw new Error('Unauthorized - you do not have access to this resource');
  }
};

/**
 * Paginate query results
 * 
 * @param {number} limit - Results per page
 * @param {number} offset - Skip this many results
 * @returns {Object} { limit, offset }
 */
const getPaginationParams = (limit = 20, offset = 0) => {
  const maxLimit = 100;
  const safeLimit = Math.min(Math.max(limit, 1), maxLimit);
  const safeOffset = Math.max(offset, 0);

  return {
    limit: safeLimit,
    offset: safeOffset,
  };
};

/**
 * Convert Firestore timestamp to ISO string
 * 
 * @param {Object} timestamp - Firestore timestamp
 * @returns {string} ISO string
 */
const timestampToIso = (timestamp) => {
  if (!timestamp) return null;
  if (timestamp.toDate) return timestamp.toDate().toISOString();
  return new Date(timestamp).toISOString();
};

/**
 * Generate a unique ID
 * 
 * @param {string} prefix - Optional prefix
 * @returns {string} Unique ID
 */
const generateId = (prefix = '') => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 9);
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`;
};

/**
 * Batch write helper
 * 
 * @param {Array<Object>} operations - Array of { type, ref, data }
 * @returns {Promise<void>}
 */
const batchWrite = async (operations) => {
  const batch = db.batch();

  for (const op of operations) {
    if (op.type === 'set') {
      batch.set(op.ref, op.data);
    } else if (op.type === 'update') {
      batch.update(op.ref, op.data);
    } else if (op.type === 'delete') {
      batch.delete(op.ref);
    }
  }

  await batch.commit();
};

module.exports = {
  requireAuth,
  requireAdmin,
  validateRequired,
  isValidEmail,
  isValidId,
  sanitizeInput,
  formatErrorResponse,
  formatSuccessResponse,
  isUserEnrolled,
  isUserAdmin,
  verifyOwnership,
  getPaginationParams,
  timestampToIso,
  generateId,
  batchWrite,
};
