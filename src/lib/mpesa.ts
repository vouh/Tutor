// M-Pesa STK Push Service
// Default: calls same-origin `/api/*` (works on Vercel).
// Optional: set `VITE_API_BASE_URL` to point to another host (e.g. Render) and we will call `${VITE_API_BASE_URL}/api/*`.

const API_ORIGIN = (import.meta as any).env?.VITE_API_BASE_URL
  ? String((import.meta as any).env.VITE_API_BASE_URL).replace(/\/+$/, '')
  : '';

const API_BASE = `${API_ORIGIN}/api`;

async function parseResponse(response: Response) {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (isJson) {
    return response.json();
  }

  const text = await response.text();
  return { success: false, message: text || `Request failed (${response.status})` };
}

export interface STKPushRequest {
  phoneNumber: string;
  amount?: number;
  courseId?: string;
  courseName?: string;
}

export interface STKPushResponse {
  success: boolean;
  message: string;
  checkoutRequestId?: string;
  merchantRequestId?: string;
  error?: string;
}

export interface QueryStatusResponse {
  success: boolean;
  status: 'pending' | 'success' | 'cancelled' | 'failed' | 'timeout' | 'error';
  message: string;
  resultCode?: string;
}

// Initiate STK Push
export async function initiateSTKPush(data: STKPushRequest): Promise<STKPushResponse> {
  try {
    const response = await fetch(`${API_BASE}/stk-push`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result = await parseResponse(response);
    if (!response.ok) {
      return {
        success: false,
        message: result?.message || result?.error || `Failed to initiate payment (${response.status})`,
        error: result?.error || undefined,
      };
    }

    return result as STKPushResponse;
  } catch (error) {
    console.error('STK Push Error:', error);
    return {
      success: false,
      message: 'Failed to initiate payment. Please try again.',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Query payment status
export async function queryPaymentStatus(checkoutRequestId: string): Promise<QueryStatusResponse> {
  try {
    const response = await fetch(`${API_BASE}/query-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ checkoutRequestId }),
    });

    const result = await parseResponse(response);
    if (!response.ok) {
      return {
        success: false,
        status: 'error',
        message: result?.message || result?.error || `Failed to check payment status (${response.status})`,
      };
    }

    return result as QueryStatusResponse;
  } catch (error) {
    console.error('Query Status Error:', error);
    return {
      success: false,
      status: 'error',
      message: 'Failed to check payment status',
    };
  }
}

// Helper to format phone number
export function formatPhoneNumber(phone: string): string {
  // Remove spaces, dashes, and other characters
  let cleaned = phone.replace(/[\s\-\(\)]/g, '');
  
  // Remove leading +
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If starts with 254, keep as is
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // If starts with 0, replace with 254
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.substring(1);
  }
  
  // Otherwise, add 254 prefix
  return '254' + cleaned;
}

// Validate Kenyan phone number
export function isValidKenyanPhone(phone: string): boolean {
  const formatted = formatPhoneNumber(phone);
  // Safaricom: 254[17]XXXXXXXX
  return /^254[17]\d{8}$/.test(formatted);
}
