import React, { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Phone, X, XCircle } from 'lucide-react';
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { initiateSTKPush, isValidKenyanPhone, queryPaymentStatus } from './mpesa';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  price: number;
  requestId?: string;
  requestTitle?: string;
  requestMessage?: string;
  allowedPercentages?: number[];
  paidAmount?: number;
  remainingAmount?: number;
  onSuccess?: (result: { phoneNumber: string }) => void;
  onFailure?: (result: { phoneNumber: string; reason: string }) => void;
}

type PaymentStep = 'input' | 'processing' | 'polling' | 'success' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  price,
  requestId,
  requestTitle,
  requestMessage,
  allowedPercentages,
  paidAmount = 0,
  remainingAmount,
  onSuccess,
  onFailure,
}) => {
  const { user, profile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<PaymentStep>('input');
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [paymentDocId, setPaymentDocId] = useState('');
  const [selectedPercentage, setSelectedPercentage] = useState(100);

  const percentageChoices = useMemo(() => (allowedPercentages && allowedPercentages.length > 0 ? allowedPercentages : [25, 50, 75, 100])
    .map((value) => Number(value))
    .filter((value, index, values) => Number.isFinite(value) && value > 0 && values.indexOf(value) === index)
    .sort((left, right) => left - right), [allowedPercentages]);
  const balanceAmount = Math.max(0, Number(remainingAmount ?? price ?? 0));
  const amountToPay = Math.max(1, Math.round((balanceAmount || Number(price || 0)) * (selectedPercentage / 100)));
  const accountEmail = profile?.email || user?.email || '';

  const paymentPayload = (status: 'pending' | 'completed' | 'failed', extra: Record<string, unknown> = {}) => ({
    userId: user?.uid || '',
    userEmail: accountEmail,
    courseId: courseId || 'payment-request',
    moduleId: '',
    amount: amountToPay,
    requestedAmount: Number(price || 0),
    mpesaReceiptNumber: status === 'pending' ? 'Pending STK confirmation' : '',
    status,
    paidAt: serverTimestamp(),
    checkoutRequestId,
    phoneNumber,
    requestId: requestId || '',
    requestTitle: requestTitle || courseName,
    paymentPercentage: selectedPercentage,
    remainingBalance: Math.max(0, balanceAmount - amountToPay),
    updatedAt: serverTimestamp(),
    ...extra,
  });

  const createPaymentRecord = async (status: 'pending' | 'completed' | 'failed', extra: Record<string, unknown> = {}) => {
    if (!user) return '';
    const paymentRef = await addDoc(collection(db, 'payments'), {
      ...paymentPayload(status, extra),
      createdAt: serverTimestamp(),
    });
    return paymentRef.id;
  };

  const updatePaymentRecord = async (status: 'pending' | 'completed' | 'failed', extra: Record<string, unknown> = {}) => {
    if (!paymentDocId) {
      const createdId = await createPaymentRecord(status, extra);
      setPaymentDocId(createdId);
      return;
    }

    await updateDoc(doc(db, 'payments', paymentDocId), paymentPayload(status, extra));
  };

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError('');
      setPhoneNumber('');
      setPaymentDocId('');
      setSelectedPercentage(percentageChoices.includes(100) ? 100 : percentageChoices[percentageChoices.length - 1] || 100);
    }
  }, [isOpen, percentageChoices]);

  useEffect(() => {
    if (step !== 'polling' || !checkoutRequestId) return;

    const pollInterval = setInterval(async () => {
      const result = await queryPaymentStatus(checkoutRequestId);

      if (result.status === 'success') {
        void updatePaymentRecord('completed', {
          mpesaReceiptNumber: checkoutRequestId,
          resultCode: result.resultCode || '0',
          failureReason: '',
        }).catch((err) => console.error('Failed to save completed payment:', err));
        setStep('success');
        clearInterval(pollInterval);
      } else if (result.status === 'cancelled' || result.status === 'failed' || result.status === 'timeout') {
        const reason = result.message || 'Payment failed';
        void updatePaymentRecord('failed', {
          failureReason: reason,
          resultCode: result.resultCode || '',
        }).catch((err) => console.error('Failed to save failed payment:', err));
        setStep('failed');
        setError(reason);
        onFailure?.({ phoneNumber, reason });
        clearInterval(pollInterval);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (step === 'polling') {
        const reason = 'Payment verification timed out';
        void updatePaymentRecord('failed', {
          failureReason: reason,
          resultCode: 'timeout',
        }).catch((err) => console.error('Failed to save timed out payment:', err));
        setStep('failed');
        setError(reason);
        onFailure?.({ phoneNumber, reason });
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [step, checkoutRequestId, paymentDocId, phoneNumber]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidKenyanPhone(phoneNumber)) {
      setError('Please enter a valid Safaricom number (07XX or 01XX)');
      return;
    }

    if (!user) {
      setError('Please sign in first');
      return;
    }

    setStep('processing');

    const result = await initiateSTKPush({
      phoneNumber,
      amount: amountToPay,
      courseId,
      courseName,
      requestId,
      requestTitle: requestTitle || courseName,
      requestedAmount: Number(price || 0),
      paymentPercentage: selectedPercentage,
    });

    if (result.success && result.checkoutRequestId) {
      setCheckoutRequestId(result.checkoutRequestId);
      createPaymentRecord('pending', {
        checkoutRequestId: result.checkoutRequestId,
        merchantRequestId: result.merchantRequestId || '',
      })
        .then((createdId) => setPaymentDocId(createdId))
        .catch((err) => console.error('Failed to save pending payment:', err));
      setStep('polling');
    } else {
      const reason = result.message || 'Failed to initiate payment';
      void createPaymentRecord('failed', {
        failureReason: reason,
        resultCode: result.error || '',
      }).catch((err) => console.error('Failed to save failed payment:', err));
      setStep('failed');
      setError(reason);
      onFailure?.({ phoneNumber, reason });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <div
          onClick={step === 'input' || step === 'failed' ? onClose : undefined}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-slate-900"
        >
          <div className="bg-green-600 p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold">M-Pesa payment</h2>
                  <p className="text-xs text-white/80">{accountEmail || 'Signed-in account'}</p>
                </div>
              </div>
              {(step === 'input' || step === 'failed' || step === 'success') && (
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{requestTitle || courseName}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedPercentage}% of KES {balanceAmount.toLocaleString()}
                  </p>
                </div>
                <p className="shrink-0 text-lg font-bold text-green-600">KES {amountToPay.toLocaleString()}</p>
              </div>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div className="h-full rounded-full bg-green-600" style={{ width: `${Math.min(100, selectedPercentage)}%` }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Paid KES {Number(paidAmount || 0).toLocaleString()}</span>
                <span>Balance KES {balanceAmount.toLocaleString()}</span>
              </div>
            </div>

              {step === 'input' && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-3"
                >
                  <div>
                    <div className="grid grid-cols-4 gap-2">
                      {percentageChoices.map((percentage) => {
                        const nextAmount = Math.max(1, Math.round((balanceAmount || Number(price || 0)) * (percentage / 100)));
                        const isSelected = selectedPercentage === percentage;

                        return (
                          <button
                            key={percentage}
                            type="button"
                            onClick={() => setSelectedPercentage(percentage)}
                            className={`rounded-lg border px-2 py-2 text-center text-xs font-semibold transition ${isSelected ? 'border-green-500 bg-green-50 text-green-700 shadow-sm dark:bg-green-900/20 dark:text-green-200' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-green-300 hover:bg-green-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}
                          >
                            <span className="block">{percentage}%</span>
                            <span className="block text-[10px] font-medium text-slate-500 dark:text-slate-400">{nextAmount.toLocaleString()}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
                      M-Pesa phone number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        autoFocus
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712 345 678"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-12 pr-4 focus:border-transparent focus:ring-2 focus:ring-green-500 dark:border-slate-700 dark:bg-slate-800"
                        required
                      />
                    </div>
                    {error && (
                      <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {error}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-xl bg-green-600 py-3.5 font-semibold text-white transition hover:bg-green-700"
                  >
                    Pay KES {amountToPay.toLocaleString()}
                  </button>
                </form>
              )}

              {step === 'processing' && (
                <div
                  className="py-8 text-center"
                >
                  <Loader2 size={38} className="mx-auto mb-4 animate-spin text-green-500" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Sending STK push</h3>
                </div>
              )}

              {step === 'polling' && (
                <div
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <Phone size={32} className="text-green-600 animate-pulse" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">Check your phone</h3>
                  <p className="mt-2 text-sm text-slate-500">Enter your M-Pesa PIN</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400">
                    <Loader2 size={14} className="animate-spin" />
                    Waiting for confirmation
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                    <CheckCircle size={34} className="text-green-600" />
                  </div>
                  <h3 className="text-lg font-bold text-green-600">Payment successful</h3>
                  <p className="mt-2 text-sm text-slate-500">Saved to {accountEmail || 'your account'}.</p>
                  <button
                    onClick={() => {
                      onSuccess?.({ phoneNumber });
                      onClose();
                    }}
                    className="mt-6 rounded-xl bg-green-600 px-8 py-3 font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Done
                  </button>
                </div>
              )}

              {step === 'failed' && (
                <div
                  className="py-8 text-center"
                >
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                    <XCircle size={34} className="text-red-600" />
                  </div>
                  <h3 className="text-lg font-bold text-red-600">Payment failed</h3>
                  <p className="mt-2 text-sm text-slate-500">{error || 'Payment was not completed'}</p>
                  <button
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                    className="mt-6 rounded-xl bg-slate-900 px-8 py-3 font-semibold text-white transition-colors hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                  >
                    Try Again
                  </button>
                </div>
              )}
          </div>
        </div>
      </div>
  );
};

export default PaymentModal;
