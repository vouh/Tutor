import axios from 'axios';
import { getAccessToken, getTimeStamp, corsHeaders } from './_utils.js';
import { getBaseUrl, readEnv } from '../_core/env.js';
import { badRequest, methodNotAllowed, serverError } from '../_core/response.js';

export default async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		res.setHeader('Access-Control-Allow-Origin', '*');
		res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
		res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
		return res.status(200).end();
	}

	Object.entries(corsHeaders()).forEach(([key, value]) => {
		res.setHeader(key, value);
	});

	if (req.method !== 'POST') {
		return methodNotAllowed(res);
	}

	try {
		const { phoneNumber, amount = '1', courseId, courseName } = req.body;

		if (!phoneNumber) {
			return badRequest(res, 'Phone number is required');
		}

		const cleanNumber = phoneNumber.replace(/\s+/g, '').replace(/^0/, '').replace(/^\+254/, '');
		const formattedPhone = `254${cleanNumber}`;

		if (!/^254[17]\d{8}$/.test(formattedPhone)) {
			return badRequest(res, 'Invalid phone number format. Use format: 07XXXXXXXX or 01XXXXXXXX');
		}

		const access_token = await getAccessToken();
		const timestamp = getTimeStamp();

		const BusinessShortCode = readEnv('BusinessShortCode');
		const MPESA_PASSKEY = readEnv('MPESA_PASSKEY');
		const TILL_NUMBER = readEnv('TILL_NUMBER');

		const password = Buffer.from(`${BusinessShortCode}${MPESA_PASSKEY}${timestamp}`).toString('base64');

		const domain = getBaseUrl(req);

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
			TransactionDesc: transactionDesc,
		};

		console.log('STK Push Request:', { ...stkPayload, Password: '[HIDDEN]', courseId });

		const response = await axios.post(
			'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest',
			stkPayload,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const stkResponse = response.data;
		console.log('STK Push Response:', stkResponse);

		if (stkResponse.ResponseCode === '0') {
			return res.status(200).json({
				success: true,
				message: 'STK Push sent successfully. Please check your phone.',
				checkoutRequestId: stkResponse.CheckoutRequestID,
				merchantRequestId: stkResponse.MerchantRequestID,
			});
		}

		return res.status(400).json({
			success: false,
			message: stkResponse.ResponseDescription || 'Failed to initiate payment',
			errorCode: stkResponse.ResponseCode,
		});
	} catch (error) {
		console.error('STK Push Error:', error.response?.data || error.message);

		const errorMessage =
			error?.code === 'MISSING_ENV'
				? 'Server configuration error'
				: error.response?.data?.errorMessage ||
					error.response?.data?.error ||
					error.message ||
					'Payment request failed';

		return serverError(res, errorMessage);
	}
}
