import React, { useEffect, useState } from 'react';
import { X, Mail, Lock, User, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { requestSignupOtp, verifySignupOtp } from '@/lib/authOtp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'login', onSuccess }) => {
  const { login, loginWithGoogle, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [otpStep, setOtpStep] = useState<'credentials' | 'verify'>('credentials');
  const [timeLeftMs, setTimeLeftMs] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
      setErrorMessage('');
      setOtpCode('');
      setVerificationToken('');
      setOtpExpiresAt(0);
      setOtpStep('credentials');
      setTimeLeftMs(0);
    }
  }, [defaultTab, isOpen]);

  useEffect(() => {
    if (otpStep !== 'verify' || !otpExpiresAt) {
      setTimeLeftMs(0);
      return;
    }

    const updateCountdown = () => {
      setTimeLeftMs(Math.max(otpExpiresAt - Date.now(), 0));
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [otpExpiresAt, otpStep]);

  const getAuthErrorMessage = (error: unknown) => {
    const code = typeof error === 'object' && error && 'code' in error ? String((error as { code?: string }).code || '') : '';

    switch (code) {
      case 'auth/email-already-in-use':
        return 'That email is already in use.';
      case 'auth/invalid-email':
        return 'Enter a valid email address.';
      case 'auth/weak-password':
        return 'Use a stronger password with at least 6 characters.';
      case 'auth/invalid-credential':
      case 'auth/wrong-password':
      case 'auth/user-not-found':
        return 'Invalid email or password.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Try again later.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was closed before it finished.';
      case 'auth/popup-blocked':
        return 'Your browser blocked the Google sign-in popup.';
      default:
        return error instanceof Error ? error.message : 'Unable to sign in right now.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 'signup') {
      if (otpStep === 'verify') {
        await handleVerifyAndCreateAccount();
        return;
      }
      await handleSignupRequestOtp();
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(formData.email, formData.password);
      toast.success('Signed in successfully');
      onClose();
      onSuccess?.();
      setFormData({ name: '', email: '', phone: '', password: '' });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupRequestOtp = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      await signup(formData);
      const result = await requestSignupOtp(formData.email.trim(), formData.name.trim());
      setVerificationToken(result.verificationToken);
      setOtpExpiresAt(Number(result.expiresAt || 0));
      setOtpCode('');
      setOtpStep('verify');
      toast.success('Account created. Check your email for the code.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to send verification code.';
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyAndCreateAccount = async () => {
    setIsOtpLoading(true);
    setErrorMessage('');

    try {
      await verifySignupOtp(formData.email.trim(), otpCode.trim(), verificationToken);
      toast.success('Account verified successfully');
      onClose();
      onSuccess?.();
      setFormData({ name: '', email: '', phone: '', password: '' });
      setOtpCode('');
      setOtpStep('credentials');
      setVerificationToken('');
      setOtpExpiresAt(0);
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsOtpLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (timeLeftMs > 0) return;
    await handleSignupRequestOtp();
  };

  const formatCountdown = () => {
    const seconds = Math.ceil(timeLeftMs / 1000);
    const minutesPart = Math.floor(seconds / 60);
    const secondsPart = seconds % 60;
    return `${minutesPart}:${String(secondsPart).padStart(2, '0')}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await loginWithGoogle();
      toast.success('Signed in with Google');
      onClose();
      onSuccess?.();
      setFormData({ name: '', email: '', phone: '', password: '' });
    } catch (error) {
      const message = getAuthErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors z-10"
          >
            <X size={20} className="text-gray-500" />
          </button>

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-accent p-6 pb-12 text-white text-center">
            <h2 className="text-2xl font-bold font-montserrat">
              {activeTab === 'login' ? 'Welcome Back!' : 'Join TutorKE'}
            </h2>
            <p className="text-white/80 text-sm mt-1">
              {activeTab === 'login' 
                ? 'Sign in to access your courses' 
                : 'Start your learning journey today'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-slate-800 mx-6 -mt-6 rounded-xl p-1 relative z-10">
            <button
              onClick={() => {
                setActiveTab('login');
                setOtpStep('credentials');
                setOtpCode('');
                setVerificationToken('');
                setOtpExpiresAt(0);
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'login'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => {
                setActiveTab('signup');
                setOtpStep('credentials');
                setOtpCode('');
                setVerificationToken('');
                setOtpExpiresAt(0);
                setErrorMessage('');
              }}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-300 ${
                activeTab === 'signup'
                  ? 'bg-white dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <AnimatePresence mode="wait">
              {activeTab === 'signup' && otpStep === 'credentials' && (
                <motion.div
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4"
                >
                  {/* Name Field */}
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      required={activeTab === 'signup'}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                  </div>

                  {/* Phone Field */}
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Phone (M-Pesa)"
                      required={activeTab === 'signup'}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email Field */}
            <div className="relative">
              <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email Address"
                required
                disabled={activeTab === 'signup' && otpStep === 'verify'}
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                required
                disabled={activeTab === 'signup' && otpStep === 'verify'}
                className="w-full pl-12 pr-12 py-3.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {activeTab === 'signup' && otpStep === 'verify' && (
              <div className="space-y-3 rounded-xl border border-primary/25 bg-primary/5 p-4">
                <p className="text-sm text-slate-700 dark:text-slate-200">
                  Enter the 5-digit code sent to <strong>{formData.email.trim()}</strong>.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={5}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  placeholder="12345"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-lg tracking-[0.5em] outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/40 dark:border-slate-700 dark:bg-slate-800"
                />
                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{timeLeftMs > 0 ? `Code expires in ${formatCountdown()}` : 'Code expired. Request a new one.'}</span>
                  <button
                    type="button"
                    onClick={() => void handleResendCode()}
                    disabled={isLoading || timeLeftMs > 0}
                    className="font-medium text-primary disabled:opacity-50"
                  >
                    Request new code
                  </button>
                </div>
              </div>
            )}

            {errorMessage ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            {activeTab === 'login' && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            {activeTab === 'signup' && otpStep === 'verify' ? (
              <button
                type="button"
                onClick={() => void handleVerifyAndCreateAccount()}
                disabled={isOtpLoading || otpCode.length !== 5 || timeLeftMs <= 0}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isOtpLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Verifying code...</span>
                  </>
                ) : (
                  <span>Verify Code & Create Account</span>
                )}
              </button>
            ) : (
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-accent text-white py-3.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>{activeTab === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                  </>
                ) : (
                  <span>{activeTab === 'login' ? 'Sign In' : 'Sign Up'}</span>
                )}
              </button>
            )}

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white dark:bg-slate-900 text-gray-500">or continue with</span>
              </div>
            </div>

            {/* Social Buttons */}
            <div>
              <button
                type="button"
                onClick={() => void handleGoogleSignIn()}
                disabled={isLoading || (activeTab === 'signup' && otpStep === 'verify')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 font-medium transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-sm">Continue with Google</span>
              </button>
            </div>

            {/* Terms */}
            {activeTab === 'signup' && (
              <p className="text-xs text-center text-gray-500 mt-4">
                By signing up, you agree to our{' '}
                <a href="/terms" className="text-primary hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</a>
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AuthModal;
