import React, { useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, Loader2, Phone, X, XCircle } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { initiateSTKPush, isValidKenyanPhone, queryPaymentStatus } from './mpesa';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  price: number;
  onSuccess?: () => void;
}

type PaymentStep = 'input' | 'processing' | 'polling' | 'success' | 'failed';

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  courseId,
  courseName,
  price,
  onSuccess,
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<PaymentStep>('input');
  const [error, setError] = useState('');
  const [checkoutRequestId, setCheckoutRequestId] = useState('');
  const [pollCount, setPollCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setError('');
      setPhoneNumber('');
      setPollCount(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (step !== 'polling' || !checkoutRequestId) return;

    const pollInterval = setInterval(async () => {
      setPollCount((prev) => prev + 1);

      const result = await queryPaymentStatus(checkoutRequestId);

      if (result.status === 'success') {
        setStep('success');
        clearInterval(pollInterval);
        onSuccess?.();
      } else if (result.status === 'cancelled' || result.status === 'failed' || result.status === 'timeout') {
        setStep('failed');
        setError(result.message);
        clearInterval(pollInterval);
      }
    }, 5000);

    const timeout = setTimeout(() => {
      clearInterval(pollInterval);
      if (step === 'polling') {
        setStep('failed');
        setError('Payment verification timed out. If you completed the payment, please contact support.');
      }
    }, 120000);

    return () => {
      clearInterval(pollInterval);
      clearTimeout(timeout);
    };
  }, [step, checkoutRequestId, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isValidKenyanPhone(phoneNumber)) {
      setError('Please enter a valid Safaricom number (07XX or 01XX)');
      return;
    }

    setStep('processing');

    const result = await initiateSTKPush({
      phoneNumber,
      amount: price,
      courseId,
      courseName,
    });

    if (result.success && result.checkoutRequestId) {
      setCheckoutRequestId(result.checkoutRequestId);
      setStep('polling');
    } else {
      setStep('failed');
      setError(result.message || 'Failed to initiate payment');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={step === 'input' || step === 'failed' ? onClose : undefined}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <img
                    src="/STK PUSH/public/images/mpesa.png"
                    alt="M-Pesa"
                    className="w-8 h-8 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">M-Pesa Payment</h2>
                  <p className="text-white/80 text-sm">Lipa na M-Pesa</p>
                </div>
              </div>
              {(step === 'input' || step === 'failed' || step === 'success') && (
                <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                  <X size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-6">
              <p className="text-sm text-slate-500 dark:text-slate-400">Paying for:</p>
              <p className="font-semibold text-slate-900 dark:text-white">{courseName}</p>
              <p className="text-2xl font-bold text-green-600 mt-2">KES {price.toLocaleString()}</p>
            </div>

            <AnimatePresence mode="wait">
              {step === 'input' && (
                <motion.form
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      M-Pesa Phone Number
                    </label>
                    <div className="relative">
                      <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="0712 345 678"
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Pay KES {price.toLocaleString()}
                  </button>

                  <p className="text-xs text-center text-slate-500">
                    You'll receive an STK push on your phone. Enter your M-Pesa PIN to complete payment.
                  </p>
                </motion.form>
              )}

              {step === 'processing' && (
                <motion.div
                  key="processing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <Loader2 size={48} className="animate-spin text-green-500 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Sending Payment Request...</h3>
                  <p className="text-slate-500 text-sm mt-2">Please wait</p>
                </motion.div>
              )}

              {step === 'polling' && (
                <motion.div
                  key="polling"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone size={32} className="text-green-600 animate-pulse" />
                  </div>
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Check Your Phone</h3>
                  <p className="text-slate-500 text-sm mt-2">Enter your M-Pesa PIN to complete payment</p>
                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Loader2 size={14} className="animate-spin" />
                    Waiting for confirmation...
                  </div>
                </motion.div>
              )}

              {step === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={40} className="text-green-600" />
                  </div>
                  <h3 className="font-bold text-xl text-green-600">Payment Successful!</h3>
                  <p className="text-slate-500 text-sm mt-2">You now have access to {courseName}</p>
                  <button
                    onClick={onClose}
                    className="mt-6 bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    Start Learning
                  </button>
                </motion.div>
              )}

              {step === 'failed' && (
                <motion.div
                  key="failed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle size={40} className="text-red-600" />
                  </div>
                  <h3 className="font-bold text-xl text-red-600">Payment Failed</h3>
                  <p className="text-slate-500 text-sm mt-2">{error}</p>
                  <button
                    onClick={() => {
                      setStep('input');
                      setError('');
                    }}
                    className="mt-6 bg-slate-900 dark:bg-white dark:text-slate-900 text-white px-8 py-3 rounded-xl font-semibold hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors"
                  >
                    Try Again
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentModal;
