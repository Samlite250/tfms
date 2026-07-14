import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, LogIn, Leaf, Users, Shield, Factory, Package, Receipt, BarChart3 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const TeaLeafSVG = ({ className }) => (
  <svg viewBox="0 0 120 160" fill="none" className={className}>
    <path
      d="M60 10C30 10 10 40 10 80C10 120 30 150 60 150C90 150 110 120 110 80C110 40 90 10 60 10Z"
      fill="currentColor"
      opacity="0.15"
    />
    <path
      d="M60 30C40 30 25 55 25 85C25 115 40 140 60 140"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.2"
    />
    <path
      d="M60 30C80 30 95 55 95 85C95 115 80 140 60 140"
      stroke="currentColor"
      strokeWidth="2"
      opacity="0.2"
    />
    <path
      d="M60 20V145"
      stroke="currentColor"
      strokeWidth="1.5"
      opacity="0.25"
    />
  </svg>
);

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const { login, demoUsers } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (data) => {
    setAuthError('');
    try {
      await login(data.email, data.password);
      navigate('/dashboard');
    } catch (err) {
      const code = err?.code;
      if (code === 'auth/user-not-found') setAuthError('No account found with this email.');
      else if (code === 'auth/wrong-password') setAuthError('Incorrect password.');
      else if (code === 'auth/invalid-email') setAuthError('Invalid email address.');
      else if (code === 'auth/too-many-requests') setAuthError('Too many attempts. Please try again later.');
      else setAuthError(err?.message || 'Failed to sign in. Please check your credentials.');
    }
  };

  const handleDemoLogin = async (email, password) => {
    setAuthError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err?.message || 'Demo login failed.');
    }
  };

  return (
    <div className="min-h-screen flex bg-bg">
      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 40%, #43A047 100%)' }}
      >
        <div className="absolute inset-0 opacity-10">
          <TeaLeafSVG className="absolute top-10 left-10 w-32 h-40 text-white" />
          <TeaLeafSVG className="absolute top-1/4 right-16 w-24 h-32 text-white rotate-45" />
          <TeaLeafSVG className="absolute bottom-20 left-20 w-28 h-36 text-white -rotate-30" />
          <TeaLeafSVG className="absolute bottom-1/3 right-10 w-20 h-28 text-white rotate-12" />
          <TeaLeafSVG className="absolute top-1/2 left-1/3 w-16 h-24 text-white -rotate-60" />
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
            <h1 className="text-4xl font-bold mb-4 tracking-tight">Tea Factory</h1>
            <h2 className="text-4xl font-bold mb-6 tracking-tight">Management System</h2>
            <div className="w-16 h-1 bg-accent rounded-full mx-auto mb-6" />
            <p className="text-lg text-white/80 max-w-sm leading-relaxed">
              Streamline your tea production workflow with real-time monitoring and analytics.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mt-16 grid grid-cols-3 gap-8 text-center"
          >
            {[
              { label: 'Production', value: '24/7' },
              { label: 'Monitoring', value: 'Live' },
              { label: 'Reports', value: 'Instant' },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-2xl font-bold text-accent">{item.value}</p>
                <p className="text-sm text-white/60 mt-1">{item.label}</p>
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

          <h2 className="text-3xl font-bold text-text-primary">Welcome Back</h2>
          <p className="text-text-secondary mt-2 mb-8">Sign in to your account</p>

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

            <div>
              <label className="text-sm font-medium text-text-primary mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`w-full pl-10 pr-11 py-2.5 rounded-xl border bg-white text-sm text-text-primary placeholder:text-text-secondary/60 transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? 'border-danger focus:ring-danger/30 focus:border-danger'
                      : 'border-border focus:ring-primary/30 focus:border-primary'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
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
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary focus:ring-primary/30 cursor-pointer"
                  {...register('rememberMe')}
                />
                <span className="text-sm text-text-secondary">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm font-medium text-primary hover:text-primary-dark transition-colors">
                Forgot Password?
              </Link>
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
                  Signing in...
                </span>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign In
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-text-secondary mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">Create Account</Link>
          </p>

          {demoUsers && demoUsers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-6 p-4 bg-primary/5 border border-primary/10 rounded-xl"
            >
              <p className="text-xs font-semibold text-primary mb-3 uppercase tracking-wide">Quick Demo Login</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { email: 'admin@tfms.com', password: 'admin123', label: 'Admin', icon: Shield, color: 'bg-primary/10 text-primary' },
                  { email: 'manager@tfms.com', password: 'manager123', label: 'Manager', icon: Users, color: 'bg-info/10 text-info' },
                  { email: 'collection@tfms.com', password: 'collection123', label: 'Collection', icon: Factory, color: 'bg-success/10 text-success' },
                  { email: 'production@tfms.com', password: 'production123', label: 'Production', icon: Package, color: 'bg-warning/10 text-warning' },
                  { email: 'store@tfms.com', password: 'store123', label: 'Store Keeper', icon: Receipt, color: 'bg-danger/10 text-danger' },
                  { email: 'accountant@tfms.com', password: 'accountant123', label: 'Accountant', icon: BarChart3, color: 'bg-accent/10 text-accent-dark' },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => handleDemoLogin(demo.email, demo.password)}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-3 py-2 bg-white border border-border rounded-lg hover:border-primary/30 hover:shadow-sm transition-all text-left disabled:opacity-50 cursor-pointer"
                  >
                    <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${demo.color}`}>
                      <demo.icon className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-text-primary">{demo.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default LoginPage;
