import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, Phone, Leaf, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { ROLES, ROLE_LABELS, DEPARTMENTS } from '../../utils/constants';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([value]) => value !== ROLES.ADMIN)
  .map(([value, label]) => ({ value, label }));

const DEPARTMENT_OPTIONS = DEPARTMENTS.map((d) => ({ value: d, label: d }));

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm({
    defaultValues: {
      displayName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: '',
      department: '',
      phone: '',
    },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await registerUser(data.email, data.password, {
        displayName: data.displayName,
        role: data.role,
        department: data.department,
        phone: data.phone,
      });
      setSubmitted(true);
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/email-already-in-use') setAuthError('An account with this email already exists.');
      else if (code === 'auth/weak-password') setAuthError('Password is too weak. Use at least 6 characters.');
      else if (code === 'auth/invalid-email') setAuthError('Invalid email address.');
      else setAuthError(err?.message || 'Registration failed. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md text-center"
        >
          <div className="bg-white rounded-2xl border border-border p-10 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={32} className="text-success" />
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-3">Account Created!</h2>
            <p className="text-text-secondary mb-6 leading-relaxed">
              Your account has been submitted for review. An administrator will approve your access shortly.
              You will be able to sign in once your account is approved.
            </p>
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl mb-6">
              <p className="text-sm text-warning font-medium">Pending Admin Approval</p>
              <p className="text-xs text-text-secondary mt-1">This usually takes 1-2 business days.</p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary-dark transition-all"
            >
              <ArrowLeft size={16} />
              Back to Sign In
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Branding Panel */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <svg viewBox="0 0 120 160" fill="none" className="absolute top-10 left-10 w-32 h-40 text-white">
            <path d="M60 10C30 10 10 40 10 80C10 120 30 150 60 150C90 150 110 120 110 80C110 40 90 10 60 10Z" fill="currentColor" opacity="0.15" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/15 rounded-2xl backdrop-blur-sm mb-8">
              <Leaf className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Join TFMS</h1>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-6" />
            <p className="text-lg text-white/80 max-w-sm leading-relaxed">
              Create your account to access the Tea Factory Management System. Admin approval is required.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 space-y-4 text-left w-full max-w-xs"
          >
            {[
              'Real-time production monitoring',
              'Tea collection & inventory tracking',
              'Sales & expense management',
              'Detailed analytics & reports',
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-white/70">
                <CheckCircle2 size={16} className="text-accent shrink-0" />
                <span className="text-sm">{feature}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="inline-flex items-center justify-center w-10 h-10 bg-primary rounded-xl">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-primary">TFMS</span>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            Back to Sign In
          </Link>

          <h2 className="text-3xl font-bold text-text-primary">Create Account</h2>
          <p className="text-text-secondary mt-2 mb-8">Fill in your details to register</p>

          {authError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-sm text-danger"
            >
              {authError}
            </motion.div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.displayName
                      ? 'border-danger focus:ring-danger/30 focus:border-danger'
                      : 'border-border focus:ring-primary/30 focus:border-primary'
                  }`}
                  {...register('displayName', { required: 'Name is required' })}
                />
              </div>
              {errors.displayName && <p className="text-xs text-danger mt-1">{errors.displayName.message}</p>}
            </div>

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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.password
                        ? 'border-danger focus:ring-danger/30 focus:border-danger'
                        : 'border-border focus:ring-primary/30 focus:border-primary'
                    }`}
                    {...register('password', {
                      required: 'Required',
                      minLength: { value: 6, message: 'Min 6 chars' },
                    })}
                  />
                </div>
                {errors.password && <p className="text-xs text-danger mt-1">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Confirm</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Repeat password"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                      errors.confirmPassword
                        ? 'border-danger focus:ring-danger/30 focus:border-danger'
                        : 'border-border focus:ring-primary/30 focus:border-primary'
                    }`}
                    {...register('confirmPassword', {
                      required: 'Required',
                      validate: (val) => val === password || 'Passwords do not match',
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-xs text-danger mt-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Role</label>
                <select
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer ${
                    errors.role
                      ? 'border-danger focus:ring-danger/30 focus:border-danger'
                      : 'border-border focus:ring-primary/30 focus:border-primary'
                  }`}
                  {...register('role', { required: 'Role is required' })}
                >
                  <option value="">Select role</option>
                  {ROLE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.role && <p className="text-xs text-danger mt-1">{errors.role.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary mb-1.5 block">Department</label>
                <select
                  className={`w-full rounded-xl border bg-white px-4 py-2.5 text-sm text-text-primary transition-all duration-200 focus:outline-none focus:ring-2 cursor-pointer ${
                    errors.department
                      ? 'border-danger focus:ring-danger/30 focus:border-danger'
                      : 'border-border focus:ring-primary/30 focus:border-primary'
                  }`}
                  {...register('department', { required: 'Department is required' })}
                >
                  <option value="">Select dept</option>
                  {DEPARTMENT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.department && <p className="text-xs text-danger mt-1">{errors.department.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Phone Number</label>
              <div className="relative">
                <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="tel"
                  placeholder="+254 7XX XXX XXX"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.phone
                      ? 'border-danger focus:ring-danger/30 focus:border-danger'
                      : 'border-border focus:ring-primary/30 focus:border-primary'
                  }`}
                  {...register('phone', { required: 'Phone number is required' })}
                />
              </div>
              {errors.phone && <p className="text-xs text-danger mt-1">{errors.phone.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-semibold text-sm transition-all duration-200 hover:bg-primary-dark hover:shadow-md active:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
