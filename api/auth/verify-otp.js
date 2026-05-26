import { applyCors } from '../_core/cors.js';
import { badRequest, methodNotAllowed, serverError } from '../_core/response.js';
import { signValue, verifyOtpToken } from './_otp.js';
import { readEnv } from '../_core/env.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_REGEX = /^\d{6}$/;

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
		const otp = String(req.body?.otp || '').trim();
		const verificationToken = String(req.body?.verificationToken || '').trim();

		if (!EMAIL_REGEX.test(email)) {
			return badRequest(res, 'Enter a valid email address.');
		}

		if (!OTP_REGEX.test(otp)) {
			return badRequest(res, 'Enter the 6-digit verification code.');
		}

		if (!verificationToken) {
			return badRequest(res, 'Missing verification token. Please request a new code.');
		}

		const payload = verifyOtpToken(verificationToken);
		if (payload.email !== email) {
			return badRequest(res, 'This code was issued for a different email address.');
		}

		if (Date.now() > Number(payload.expiresAt)) {
			return badRequest(res, 'This code has expired. Request a new one.');
		}

		const otpSecret = readEnv('OTP_SIGNING_SECRET');
		const expectedDigest = signValue(`${email}:${otp}:${payload.nonce}`, otpSecret);
		if (expectedDigest !== payload.otpDigest) {
			return badRequest(res, 'Incorrect verification code.');
		}

		return res.status(200).json({
			success: true,
			message: 'Code verified successfully.',
		});
	} catch (error) {
		console.error('OTP verification error:', error);
		return serverError(res, 'Unable to verify code. Please request a new one.');
	}
}
