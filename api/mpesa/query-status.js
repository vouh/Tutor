import axios from 'axios';
import { getAccessToken, getTimeStamp, corsHeaders } from './_utils.js';
import { readEnv } from '../_core/env.js';
import { badRequest, methodNotAllowed, serverError } from '../_core/response.js';

export default async function handler(req, res) {
	Object.entries(corsHeaders()).forEach(([key, value]) => {
		res.setHeader(key, value);
	});

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'POST') {
		return methodNotAllowed(res);
	}

	try {
		const { checkoutRequestId } = req.body;

		if (!checkoutRequestId) {
			return badRequest(res, 'checkoutRequestId is required');
		}

		const access_token = await getAccessToken();
		const timestamp = getTimeStamp();

		const BusinessShortCode = readEnv('BusinessShortCode');
		const MPESA_PASSKEY = readEnv('MPESA_PASSKEY');

		const password = Buffer.from(`${BusinessShortCode}${MPESA_PASSKEY}${timestamp}`).toString('base64');

		const queryPayload = {
			BusinessShortCode: BusinessShortCode,
			Password: password,
			Timestamp: timestamp,
			CheckoutRequestID: checkoutRequestId,
		};

		const response = await axios.post(
			'https://api.safaricom.co.ke/mpesa/stkpushquery/v1/query',
			queryPayload,
			{
				headers: {
					Authorization: `Bearer ${access_token}`,
					'Content-Type': 'application/json',
				},
			}
		);

		const queryResult = response.data;
		console.log('Query Result:', queryResult);

		const resultCode = String(queryResult.ResultCode);

		let status = 'pending';
		let message = queryResult.ResultDesc;

		if (resultCode === '0') {
			status = 'success';
			message = 'Payment completed successfully';
		} else if (resultCode === '1032') {
			status = 'cancelled';
			message = 'Payment was cancelled by user';
		} else if (resultCode === '1') {
			status = 'failed';
			message = 'Insufficient balance';
		} else if (resultCode === '1037') {
			status = 'timeout';
			message = 'Payment request timed out';
		} else if (resultCode !== '0') {
			status = 'failed';
		}

		return res.status(200).json({
			success: status === 'success',
			status,
			message,
			resultCode,
			checkoutRequestId,
		});
	} catch (error) {
		console.error('Query Error:', error.response?.data || error.message);

		if (error.response?.data?.errorCode === '500.001.1001') {
			return res.status(200).json({
				success: false,
				status: 'pending',
				message: 'Transaction is being processed',
			});
		}

		const message =
			error?.code === 'MISSING_ENV'
				? 'Server configuration error'
				: error.response?.data?.errorMessage || 'Failed to query transaction status';
		return serverError(res, message);
	}
}
