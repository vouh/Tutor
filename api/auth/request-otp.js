import { applyCors } from '../_core/cors.js';
import { badRequest, methodNotAllowed, serverError } from '../_core/response.js';
import { createOtpToken, generateOtpCode, sendOtpEmail } from './_otp.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
	if (req.method === 'OPTIONS') {
		applyCors(res);
		return res.status(200).end();
	}

	applyCors(res);

	if (req.method !== 'POST') {
		return methodNotAllowed(res);
	}

	try {
		const email = String(req.body?.email || '').trim().toLowerCase();
		const name = String(req.body?.name || '').trim() || 'Learner';

		if (!EMAIL_REGEX.test(email)) {
			return badRequest(res, 'Enter a valid email address.');
		}

		const otp = generateOtpCode();
		const { token, expiresAt } = createOtpToken({ email, otp });
		await sendOtpEmail({
			toEmail: email,
			toName: name,
			otpCode: otp,
		});

		return res.status(200).json({
			success: true,
			message: 'Verification code sent.',
			verificationToken: token,
			expiresAt,
		});
	} catch (error) {
		console.error('OTP request error:', error);
		return serverError(res, error instanceof Error ? error.message : 'Unable to send verification code');
	}
}
