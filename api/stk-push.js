import axios from 'axios';
import { getAccessToken, getTimeStamp, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Set CORS headers
  Object.entries(corsHeaders()).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phoneNumber, amount = '1', courseId, courseName } = req.body;

    if (!phoneNumber) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Format phone number
    const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/^0/, '').replace(/^\+254/, '');
    const formattedPhone = `254${cleanNumber}`;

    // Validate phone number
    if (!/^254[17]\d{8}$/.test(formattedPhone)) {
      return res.status(400).json({ error: 'Invalid phone number format. Use format: 07XXXXXXXX or 01XXXXXXXX' });
    }

    // Get access token
    const access_token = await getAccessToken();
    const timestamp = getTimeStamp();

    // Environment variables
    const BusinessShortCode = String(process.env.BusinessShortCode || '').trim();
    const MPESA_PASSKEY = String(process.env.MPESA_PASSKEY || '').trim();
    const TILL_NUMBER = String(process.env.TILL_NUMBER || '').trim();

    if (!BusinessShortCode || !MPESA_PASSKEY || !TILL_NUMBER) {
      console.error('Missing env vars:', { BusinessShortCode: !!BusinessShortCode, MPESA_PASSKEY: !!MPESA_PASSKEY, TILL_NUMBER: !!TILL_NUMBER });
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Generate password
    const password = Buffer.from(`${BusinessShortCode}${MPESA_PASSKEY}${timestamp}`).toString('base64');

    // Callback URL - use Vercel URL
    const domain = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : process.env.DOMAIN || 'https://tu-tor.vercel.app';

    const accountReference = courseName ? courseName.substring(0, 20) : 'TutorKE Course';
    const transactionDesc = `Pay for ${courseName || 'course'}`.substring(0, 30);

    const stkPayload = {
      BusinessShortCode: BusinessShortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerBuyGoodsOnline',
      Amount: String(amount),
      PartyA: formattedPhone,
      PartyB: TILL_NUMBER,
      PhoneNumber: formattedPhone,
      CallBackURL: `${domain}/api/callback`,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };

    console.log('STK Push Request:', { ...stkPayload, Password: '[HIDDEN]' });

    const response = await axios.post(
      'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
      stkPayload,
      {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const stkResponse = response.data;
    console.log('STK Push Response:', stkResponse);

    if (stkResponse.ResponseCode === '0') {
      return res.status(200).json({
        success: true,
        message: 'STK Push sent successfully. Please check your phone.',
        checkoutRequestId: stkResponse.CheckoutRequestID,
        merchantRequestId: stkResponse.MerchantRequestID
      });
    } else {
      return res.status(400).json({
        success: false,
        message: stkResponse.ResponseDescription || 'Failed to initiate payment',
        errorCode: stkResponse.ResponseCode
      });
    }

  } catch (error) {
    console.error('STK Push Error:', error.response?.data || error.message);

    const errorMessage =
      error.response?.data?.errorMessage ||
      error.response?.data?.error ||
      error.message ||
      'Payment request failed';

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: errorMessage
    });
  }
}
