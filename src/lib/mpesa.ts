// M-Pesa STK Push Service
// Uses the Vercel serverless API endpoints

const API_BASE = '/api';

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

    const result = await response.json();
    return result;
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

    const result = await response.json();
    return result;
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
