import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Send, MailCheck, Leaf } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function ForgotPasswordPage() {
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const { forgotPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm({ defaultValues: { email: '' } });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/user-not-found') setAuthError('No account found with this email.');
      else if (code === 'auth/invalid-email') setAuthError('Invalid email address.');
      else setAuthError('Failed to send reset link. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-primary">TFMS</span>
        </div>

        {/* Card */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-8">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-2xl mb-6">
                  <MailCheck className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Check Your Email</h2>
                <p className="text-text-secondary mb-2">
                  We've sent a password reset link to
                </p>
                <p className="font-medium text-text-primary mb-6">{getValues('email')}</p>
                <p className="text-sm text-text-secondary mb-8">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md"
                >
                  <ArrowLeft size={18} />
                  Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Back Link */}
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
                >
                  <ArrowLeft size={16} />
                  Back to Login
                </Link>

                <h2 className="text-2xl font-bold text-text-primary mb-2">Forgot Password?</h2>
                <p className="text-text-secondary mb-8">
                  Enter your email to receive a reset link
                </p>

                {authError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger"
                  >
                    {authError}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">Email</label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type="email"
                        placeholder="you@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-danger focus:ring-danger/30 focus:border-danger'
                            : 'border-border focus:ring-primary/30 focus:border-primary'
                        }`}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' },
                        })}
                      />
                    </div>
                    {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md active:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Sending...
                      </span>
                    ) : (
                      <>
                        <Send size={18} />
                        Send Reset Link
                      </>
                    )}
                  </button>
                </form>

                <p className="text-center text-sm text-text-secondary mt-8">
                  Remember your password?{' '}
                  <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                    Back to Login
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;
