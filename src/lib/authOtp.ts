const DEFAULT_LOCAL_API_ORIGIN = 'https://tu-tor.vercel.app';

const configuredApiOrigin =
  typeof import.meta !== 'undefined' && typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_BASE_URL
    ? String(import.meta.env.VITE_API_BASE_URL).replace(/\/+$/, '')
    : '';

const API_ORIGIN = configuredApiOrigin ||
  (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)
    ? DEFAULT_LOCAL_API_ORIGIN
    : '');

const API_BASE = `${API_ORIGIN}/api/auth`;
const OTP_FALLBACK_STORAGE_KEY = 'signup_otp_fallback';

type RequestOtpResponse = {
  success: boolean;
  message?: string;
  verificationToken: string;
  expiresAt: number;
};

type VerifyOtpResponse = {
  success: boolean;
  message?: string;
};

type LocalOtpPayload = {
  email: string;
  otp: string;
  expiresAt: number;
};

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  const text = await response.text();
  throw new Error(text || `Request failed (${response.status})`);
}

function generateLocalOtpCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

async function sendOtpViaEmailJs(serviceId: string, templateId: string, publicKey: string, params: Record<string, string>) {
  const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      service_id: serviceId,
      template_id: templateId,
      user_id: publicKey,
      template_params: params,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Unable to send verification code.');
  }
}

export async function requestSignupOtp(email: string, name: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim() || 'Learner';

  const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID;
  const templateId = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID;
  const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

  if (!serviceId || !templateId || !publicKey) {
    throw new Error('Unable to send verification code.');
  }

  const otp = generateLocalOtpCode();
  const expiresAt = Date.now() + 90_000;
  const payload: LocalOtpPayload = { email: normalizedEmail, otp, expiresAt };
  sessionStorage.setItem(OTP_FALLBACK_STORAGE_KEY, JSON.stringify(payload));

  await sendOtpViaEmailJs(serviceId, templateId, publicKey, {
    to_email: normalizedEmail,
    recipient_email: normalizedEmail,
    email: normalizedEmail,
    user_email: normalizedEmail,
    reply_to: normalizedEmail,
    to_name: normalizedName,
    recipient_name: normalizedName,
    name: normalizedName,
    passcode: otp,
    otp_code: otp,
    time: new Date(expiresAt).toLocaleString('en-KE', { hour12: true }),
    expires_in: '1 minute 30 seconds',
    website_link: window.location.origin,
    company_name: 'TutorKE',
    from_name: 'TutorKE',
  });

  return {
    success: true,
    message: 'Verification code sent.',
    verificationToken: `local:${btoa(JSON.stringify(payload))}`,
    expiresAt,
  };
}

export async function verifySignupOtp(email: string, otp: string, verificationToken: string) {
  if (verificationToken.startsWith('local:')) {
    const encoded = verificationToken.slice('local:'.length);
    const payload = JSON.parse(atob(encoded)) as LocalOtpPayload;
    const normalizedEmail = email.trim().toLowerCase();

    if (payload.email !== normalizedEmail) {
      throw new Error('This code was issued for a different email address.');
    }

    if (Date.now() > payload.expiresAt) {
      throw new Error('This code has expired. Request a new one.');
    }

    if (payload.otp !== otp.trim()) {
      throw new Error('Incorrect verification code.');
    }

    return { success: true, message: 'Code verified successfully.' };
  }

  const response = await fetch(`${API_BASE}/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, otp, verificationToken }),
  });

  const result = await parseResponse<VerifyOtpResponse & { message?: string }>(response);
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Verification failed.');
  }
  return result;
}
