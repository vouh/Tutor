/**
 * M-Pesa Payment Callback Handler
 * Receives payment confirmations from Safaricom M-Pesa
 * Updates payment status and automatically enrolls user
 */

const admin = require('firebase-admin');
const db = admin.firestore();
const crypto = require('crypto');
const enrollmentController = require('../enrollments/enrollmentController');
const emailHelper = require('../email/sendgridHelper');

/**
 * Verify M-Pesa callback signature
 * 
 * @param {string} token - The token from the callback
 * @param {string} timestamp - The timestamp from the callback
 * @param {string} signature - The signature from the callback
 * @returns {boolean} Valid or not
 */
const verifySignature = (token, timestamp, signature) => {
  try {
    const secretKey = process.env.MPESA_SECURITY_TOKEN || 'your-security-token';
    const message = token + timestamp;
    const expectedSignature = crypto
      .createHash('sha256')
      .update(message + secretKey)
      .digest('hex');

    return signature === expectedSignature;
  } catch (error) {
    console.error(`Signature verification failed: ${error.message}`);
    return false;
  }
};

/**
 * M-Pesa Callback HTTP Handler
 * Safaricom sends POST request with payment confirmation
 * 
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 */
const mpesaCallback = async (req, res) => {
  try {
    console.log('M-Pesa callback received:', req.body);

    const { Body } = req.body;

    if (!Body || !Body.stkCallback) {
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: 'Invalid callback format',
      });
    }

    const stkCallback = Body.stkCallback;
    const { ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    // Result code 0 = success
    if (ResultCode !== 0) {
      console.warn(`M-Pesa payment failed: ${ResultDesc}`);
      
      // Try to find and update the payment record
      if (CallbackMetadata) {
        const metadata = extractMetadata(CallbackMetadata);
        if (metadata.CheckoutRequestID) {
          await updatePaymentStatus(metadata.CheckoutRequestID, 'failed', ResultDesc);
        }
      }

      return res.json({
        ResultCode: 0,
        ResultDesc: 'Callback received',
      });
    }

    // Extract payment details from metadata
    const metadata = extractMetadata(CallbackMetadata);

    const {
      Amount,
      MpesaReceiptNumber,
      TransactionDate,
      PhoneNumber,
      CheckoutRequestID,
    } = metadata;

    if (!Amount || !MpesaReceiptNumber || !CheckoutRequestID) {
      console.error('Missing required metadata fields');
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Callback received',
      });
    }

    // Find payment record by CheckoutRequestID
    const paymentSnapshot = await db.collection('payments')
      .where('checkoutRequestId', '==', CheckoutRequestID)
      .limit(1)
      .get();

    if (paymentSnapshot.empty) {
      console.warn(`No payment found for CheckoutRequestID: ${CheckoutRequestID}`);
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Callback received',
      });
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();
    const paymentId = paymentDoc.id;

    // Verify amount matches
    if (parseFloat(paymentData.amount) !== parseFloat(Amount)) {
      console.error(`Amount mismatch: expected ${paymentData.amount}, got ${Amount}`);
      
      await updatePaymentStatus(paymentId, 'failed', 'Amount mismatch');
      return res.json({
        ResultCode: 0,
        ResultDesc: 'Callback received',
      });
    }

    // Update payment record to confirmed
    const batch = db.batch();

    const updateData = {
      status: 'confirmed',
      mpesaRef: MpesaReceiptNumber,
      mpesaTransactionDate: TransactionDate,
      phoneNumber: PhoneNumber,
      confirmedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    batch.update(db.collection('payments').doc(paymentId), updateData);

    // Enroll user automatically
    const enrollmentResult = await enrollmentController.enrollUser(
      {
        userId: paymentData.userId,
        courseId: paymentData.courseId,
        mpesaTransactionId: MpesaReceiptNumber,
        paymentId,
      },
      { auth: { uid: paymentData.userId } }
    );

    if (enrollmentResult.success) {
      batch.update(db.collection('payments').doc(paymentId), {
        enrollmentId: enrollmentResult.data.enrollmentId || null,
      });
    } else {
      console.error(`Enrollment failed: ${enrollmentResult.error}`);
    }

    await batch.commit();

    console.log(`Payment ${paymentId} confirmed and user enrolled`);

    return res.json({
      ResultCode: 0,
      ResultDesc: 'Callback received',
    });
  } catch (error) {
    console.error(`Error processing M-Pesa callback: ${error.message}`);
    return res.status(500).json({
      ResultCode: 1,
      ResultDesc: 'Internal server error',
    });
  }
};

/**
 * Extract metadata from M-Pesa CallbackMetadata
 * 
 * @param {Object} metadata - The CallbackMetadata object
 * @returns {Object} Extracted key-value pairs
 */
const extractMetadata = (metadata) => {
  const result = {};

  if (metadata && metadata.Item && Array.isArray(metadata.Item)) {
    metadata.Item.forEach(item => {
      const { Name, Value } = item;
      result[Name] = Value;
    });
  }

  return result;
};

/**
 * Update payment status (helper)
 * 
 * @param {string} paymentId - Payment document ID
 * @param {string} status - New status (confirmed, failed, pending)
 * @param {string} errorMessage - Optional error message
 * @returns {Promise<void>}
 */
const updatePaymentStatus = async (paymentId, status, errorMessage = null) => {
  try {
    const updateData = {
      status,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    await db.collection('payments').doc(paymentId).update(updateData);
  } catch (error) {
    console.error(`Error updating payment status: ${error.message}`);
  }
};

/**
 * Check payment status by CheckoutRequestID
 * 
 * @param {Object} data - { checkoutRequestId }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Payment status
 */
const checkPaymentStatus = async (data, context) => {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  try {
    const { checkoutRequestId } = data;

    if (!checkoutRequestId) {
      throw new Error('checkoutRequestId is required');
    }

    const paymentSnapshot = await db.collection('payments')
      .where('checkoutRequestId', '==', checkoutRequestId)
      .limit(1)
      .get();

    if (paymentSnapshot.empty) {
      return {
        success: false,
        error: 'Payment not found',
      };
    }

    const paymentDoc = paymentSnapshot.docs[0];
    const paymentData = paymentDoc.data();

    return {
      success: true,
      data: {
        paymentId: paymentDoc.id,
        ...paymentData,
      },
    };
  } catch (error) {
    console.error(`Error checking payment status: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Sync payment status with M-Pesa API
 * Called manually to check on pending payments
 * 
 * @param {Object} data - { paymentId? }
 * @param {Object} context - Firebase Functions context
 * @returns {Promise<Object>} Sync result
 */
const syncPaymentStatus = async (data, context) => {
  const isAdmin = context.auth && context.auth.token.admin === true;
  if (!isAdmin) {
    throw new Error('Admin access required');
  }

  try {
    const { paymentId } = data || {};

    let query = db.collection('payments').where('status', '==', 'pending');

    if (paymentId) {
      const paymentDoc = await db.collection('payments').doc(paymentId).get();
      if (!paymentDoc.exists || paymentDoc.data().status !== 'pending') {
        throw new Error('Payment not found or not pending');
      }
      query = db.collection('payments').where(admin.firestore.FieldPath.documentId(), '==', paymentId);
    }

    const snapshot = await query.get();

    // In production, call Safaricom's QueryPaymentStatus API here
    // For now, just return the pending payments
    const pendingPayments = [];

    snapshot.forEach(doc => {
      pendingPayments.push({
        paymentId: doc.id,
        ...doc.data(),
      });
    });

    return {
      success: true,
      data: pendingPayments,
      message: `Found ${pendingPayments.length} pending payments`,
    };
  } catch (error) {
    console.error(`Error syncing payment status: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

module.exports = {
  mpesaCallback,
  checkPaymentStatus,
  syncPaymentStatus,
  verifySignature,
  updatePaymentStatus,
  extractMetadata,
};
