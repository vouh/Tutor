import { corsHeaders } from './_utils.js';

export default async function handler(req, res) {
	Object.entries(corsHeaders()).forEach(([key, value]) => {
		res.setHeader(key, value);
	});

	if (req.method === 'OPTIONS') {
		return res.status(200).end();
	}

	if (req.method !== 'POST') {
		return res.status(405).json({ error: 'Method not allowed' });
	}

	try {
		const result = req.body;

		console.log('=== M-Pesa Callback Received ===');
		console.log(JSON.stringify(result, null, 2));

		const stkCallback = result?.Body?.stkCallback;

		if (!stkCallback) {
			console.log('Invalid callback format');
			return res.status(200).json({
				ResultCode: 0,
				ResultDesc: 'Accepted',
			});
		}

		const resultCode = stkCallback.ResultCode;
		const resultDesc = stkCallback.ResultDesc;
		const merchantRequestId = stkCallback.MerchantRequestID;
		const checkoutRequestId = stkCallback.CheckoutRequestID;

		console.log('Callback Details:', {
			resultCode,
			resultDesc,
			merchantRequestId,
			checkoutRequestId,
		});

		if (resultCode === 0) {
			const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

			const paymentDetails = {};
			callbackMetadata.forEach((item) => {
				paymentDetails[item.Name] = item.Value;
			});

			console.log('Payment Successful:', paymentDetails);
		} else {
			console.log('Payment Failed:', resultDesc);
		}

		return res.status(200).json({
			ResultCode: 0,
			ResultDesc: 'Callback received successfully',
		});
	} catch (error) {
		console.error('Callback Error:', error);

		return res.status(200).json({
			ResultCode: 0,
			ResultDesc: 'Accepted',
		});
	}
}
