import crypto from 'crypto';
import { readEnv } from '../_core/env.js';

const OTP_LENGTH = 6;
export const OTP_TTL_MS = 90 * 1000;

function base64UrlEncode(value) {
	return Buffer.from(value)
		.toString('base64')
		.replace(/=/g, '')
		.replace(/\+/g, '-')
		.replace(/\//g, '_');
}

function base64UrlDecode(value) {
	const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
	const padded = normalized + '='.repeat((4 - (normalized.length % 4)) % 4);
	return Buffer.from(padded, 'base64').toString('utf8');
}

export function generateOtpCode() {
	const random = crypto.randomInt(0, 10 ** OTP_LENGTH);
	return String(random).padStart(OTP_LENGTH, '0');
}

export function signValue(value, secret) {
	return crypto.createHmac('sha256', secret).update(value).digest('hex');
}

export function createOtpToken({ email, otp, ttlMs = OTP_TTL_MS }) {
	const otpSecret = readEnv('OTP_SIGNING_SECRET');
	const nonce = crypto.randomBytes(16).toString('hex');
	const expiresAt = Date.now() + ttlMs;
	const otpDigest = signValue(`${email}:${otp}:${nonce}`, otpSecret);
	const payload = JSON.stringify({ email, nonce, expiresAt, otpDigest });
	const payloadPart = base64UrlEncode(payload);
	const signature = signValue(payloadPart, otpSecret);
	return {
		token: `${payloadPart}.${signature}`,
		expiresAt,
	};
}

export function verifyOtpToken(token) {
	const otpSecret = readEnv('OTP_SIGNING_SECRET');
	const parts = String(token || '').split('.');
	if (parts.length !== 2) {
		throw new Error('Invalid verification token');
	}
	const [payloadPart, signature] = parts;
	const expectedSignature = signValue(payloadPart, otpSecret);
	if (expectedSignature !== signature) {
		throw new Error('Invalid verification token');
	}

	const payload = JSON.parse(base64UrlDecode(payloadPart));
	if (!payload?.email || !payload?.nonce || !payload?.expiresAt || !payload?.otpDigest) {
		throw new Error('Invalid verification token payload');
	}
	return payload;
}

export async function sendOtpEmail({ toEmail, toName, otpCode }) {
	const serviceId = readEnv('EMAILJS_SERVICE_ID');
	const templateId = readEnv('EMAILJS_OTP_TEMPLATE_ID');
	const publicKey = readEnv('EMAILJS_PUBLIC_KEY');
	const privateKey = readEnv('EMAILJS_PRIVATE_KEY');
	const fromName = readEnv('EMAILJS_FROM_NAME', { required: false }) || 'TutorKE';
	const expiresAt = new Date(Date.now() + OTP_TTL_MS).toLocaleString('en-KE', { hour12: true });

	const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			service_id: serviceId,
			template_id: templateId,
			user_id: publicKey,
			accessToken: privateKey,
			template_params: {
				to_email: toEmail,
				to_name: toName,
				passcode: otpCode,
				otp_code: otpCode,
				time: expiresAt,
				expires_in: '1 minute 30 seconds',
				website_link: readEnv('APP_URL', { required: false }) || readEnv('DOMAIN', { required: false }) || 'https://tu-tor.vercel.app',
				company_name: 'TutorKE',
				from_name: fromName,
			},
		}),
	});

	if (!response.ok) {
		const details = await response.text();
		throw new Error(details || 'Failed to send OTP email');
	}
}
