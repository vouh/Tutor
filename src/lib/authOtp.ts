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

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json() as Promise<T>;
  }
  const text = await response.text();
  throw new Error(text || `Request failed (${response.status})`);
}

export async function requestSignupOtp(email: string, name: string) {
  const response = await fetch(`${API_BASE}/request-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name }),
  });

  const result = await parseResponse<RequestOtpResponse & { message?: string }>(response);
  if (!response.ok || !result.success) {
    throw new Error(result.message || 'Unable to send verification code.');
  }
  return result;
}

export async function verifySignupOtp(email: string, otp: string, verificationToken: string) {
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
