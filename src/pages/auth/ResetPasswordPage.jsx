import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle, Leaf, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: '', color: '' };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: 'bg-danger', textColor: 'text-danger' };
  if (score <= 3) return { score, label: 'Medium', color: 'bg-warning', textColor: 'text-warning' };
  return { score, label: 'Strong', color: 'bg-success', textColor: 'text-success' };
}

function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [authError, setAuthError] = useState('');
  const [searchParams] = useSearchParams();
  const { resetPassword } = useAuth();

  const oobCode = searchParams.get('oobCode') || '';

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const passwordValue = watch('password');
  const strength = getPasswordStrength(passwordValue);

  const onSubmit = async (data) => {
    setAuthError('');
    if (!oobCode) {
      setAuthError('Invalid or expired reset link. Please request a new one.');
      return;
    }
    try {
      await resetPassword(oobCode, data.password);
      setSuccess(true);
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/invalid-action-code') setAuthError('Invalid or expired reset link. Please request a new one.');
      else if (code === 'auth/weak-password') setAuthError('Password is too weak. Please choose a stronger password.');
      else setAuthError('Failed to reset password. Please try again.');
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
        <div className="bg-card rounded-2xl shadow-lg p-8">
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
                  <CheckCircle className="w-8 h-8 text-success" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Password Reset Successful</h2>
                <p className="text-text-secondary mb-8">
                  Your password has been updated. You can now sign in with your new password.
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md"
                >
                  <ArrowLeft size={18} />
                  Go to Login
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

                <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-2xl mb-4">
                  <ShieldCheck className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Reset Password</h2>
                <p className="text-text-secondary mb-8">Enter your new password</p>

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
                  {/* New Password */}
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">New Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter new password"
                        className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.password
                            ? 'border-danger focus:ring-danger/30 focus:border-danger'
                            : 'border-border focus:ring-primary/30 focus:border-primary'
                        }`}
                        {...register('password', {
                          required: 'Password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' },
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}

                    {/* Strength Indicator */}
                    {passwordValue && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <div className="flex gap-1.5 mb-1.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                                i <= strength.score ? strength.color : 'bg-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <p className={`text-xs font-medium ${strength.textColor}`}>
                          {strength.label}
                        </p>
                      </motion.div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="text-sm font-medium text-text-primary mb-1.5 block">Confirm Password</label>
                    <div className="relative">
                      <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        placeholder="Confirm new password"
                        className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                          errors.confirmPassword
                            ? 'border-danger focus:ring-danger/30 focus:border-danger'
                            : 'border-border focus:ring-primary/30 focus:border-primary'
                        }`}
                        {...register('confirmPassword', {
                          required: 'Please confirm your password',
                          validate: (value) => value === passwordValue || 'Passwords do not match',
                        })}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                      >
                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>
                    )}
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
                        Resetting...
                      </span>
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;
