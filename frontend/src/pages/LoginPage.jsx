import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Database,
  ShieldAlert,
  Loader2,
  Cpu,
  User,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, availablePersonas, switchPersona } = useAuth();
  const toast = useToast();

  // Target to redirect after successful login
  const from = location.state?.from?.pathname || '/app';

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    email: false,
    password: false
  });

  // Real-time Email Format Validator
  const validateEmail = (val) => {
    if (!val || !val.trim()) {
      return 'Work email is required.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      return 'Please enter a valid work email (e.g. name@company.com).';
    }
    return '';
  };

  // Real-time Password Validator
  const validatePassword = (val) => {
    if (!val) {
      return 'Password is required.';
    }
    if (val.length < 6) {
      return 'Password must be at least 6 characters.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    if (touched.email) {
      setErrors((prev) => ({ ...prev, email: validateEmail(val) }));
    }
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    if (touched.password) {
      setErrors((prev) => ({ ...prev, password: validatePassword(val) }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) {
      toast.error('Validation Error', 'Please fix the highlighted fields to continue.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const res = login(email, password, rememberMe);
      setIsLoading(false);

      if (res.isNew) {
        toast.success(
          'Welcome to KnowBridge!',
          `Created fresh workspace session for ${res.user.name}.`
        );
      } else {
        toast.success('Welcome back', `Signed in as ${res.user.name}.`);
      }

      navigate(from, { replace: true });
    }, 500);
  };

  const handleDemoSignIn = (persona) => {
    switchPersona(persona.id);
    toast.success('Demo Profile Loaded', `Signed in as ${persona.name} (${persona.role})`);
    navigate(from, { replace: true });
  };

  const isEmailValid = email.length > 0 && !validateEmail(email);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center">
      <div className="w-full flex-1 flex flex-col lg:flex-row">
        
        {/* ============================================================== */}
        {/* LEFT PANEL: High-End Brand & Technology Showcase              */}
        {/* ============================================================== */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0B0F19] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
          {/* Subtle glowing radial background */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-violet-600/15 rounded-full blur-[100px] pointer-events-none" />

          {/* Top Brand Link */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:bg-brand-500 transition-colors">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-xl text-white tracking-tight block leading-none">
                  KnowBridge
                </span>
                <span className="text-[10px] font-mono text-brand-400 font-semibold tracking-wider uppercase">
                  Continuous Shared Memory
                </span>
              </div>
            </Link>
          </div>

          {/* Middle: Decision Card Preview & Value Proposition */}
          <div className="relative z-10 my-auto py-12 max-w-lg space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-white/10 text-brand-300 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>MongoDB Atlas Vector Search • Gemini 3072-dim</span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight text-white">
              The persistent memory your engineering team has always needed.
            </h1>

            <p className="text-slate-400 text-sm leading-relaxed">
              Capture decisions from chat and PRs automatically. Intercept technical contradictions before they compound into debt.
            </p>

            {/* Live Card Mockup */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Technical Decision
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active Standard
                  </span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">#mem_001</span>
              </div>

              <h4 className="text-sm font-bold text-white">
                PostgreSQL Selected for Billing Ledger
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                We chose PostgreSQL over MongoDB specifically for the billing service ledger because we require ACID transactions and strict foreign key integrity.
              </p>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span>By Rahul (Tech Lead)</span>
                <span className="text-brand-300 font-mono">3072-dim Vector Match</span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <p className="text-xs text-slate-400 italic border-l-2 border-brand-500 pl-3">
              "KnowBridge eliminated our weekly 'why did we build it like this?' meetings. Every single trade-off is recorded, grounded, and protected."
            </p>
          </div>

          {/* Bottom Trust Footer */}
          <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Enterprise Knowledge Security</span>
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400">
              <span>SOC2 Type II Ready</span>
              <span>End-to-End Encrypted</span>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* RIGHT PANEL: Crisp, Proper Authentication Form                 */}
        {/* ============================================================== */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-6">

            {/* Mobile Brand Link (visible on small screens) */}
            <div className="lg:hidden flex items-center justify-between mb-2">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900">KnowBridge</span>
              </Link>
              <Link to="/" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Link>
            </div>

            {/* If user is already authenticated notification banner */}
            {isAuthenticated && user && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-center justify-between gap-3 animate-fade-in">
                <div className="flex items-center gap-2 truncate">
                  <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
                  <span className="truncate">
                    Signed in as <strong>{user.name}</strong> ({user.role})
                  </span>
                </div>
                <button
                  onClick={() => navigate('/app')}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-600 text-white hover:bg-indigo-700 whitespace-nowrap"
                >
                  Continue →
                </button>
              </div>
            )}

            {/* Form Header */}
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign in to your workspace
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enter your work credentials to access your team's persistent knowledge base.
              </p>
            </div>

            {/* Main Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              
              {/* Work Email Field */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={email}
                    onChange={handleEmailChange}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@company.com"
                    className={`w-full text-xs sm:text-sm rounded-xl border pl-10 pr-9 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.email && touched.email
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                        : isEmailValid
                        ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500'
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  {/* Status indicator on the right */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {touched.email && errors.email && (
                      <AlertCircle className="w-4 h-4 text-rose-500" />
                    )}
                    {isEmailValid && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    )}
                  </div>
                </div>
                {/* Email Validation Error message */}
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      toast.info('Password Reset', 'In mock mode: any password with 6+ characters will sign in.');
                    }}
                    className="text-[11px] font-medium text-brand-600 hover:text-brand-700"
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={handlePasswordChange}
                    onBlur={() => handleBlur('password')}
                    placeholder="Enter your password (min 6 characters)"
                    className={`w-full text-xs sm:text-sm rounded-xl border pl-10 pr-10 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.password && touched.password
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500'
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {/* Password Validation Error message */}
                {touched.password && errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                  />
                  <span className="text-slate-600 font-medium">Keep me signed in</span>
                </label>
                <span className="text-[11px] text-slate-400">Secure Session</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-subtle hover:shadow-card active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to KnowBridge</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Fresh New User Prompt */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-center text-xs">
              <span className="text-slate-600">New to KnowBridge? </span>
              <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
                Create a fresh account →
              </Link>
            </div>

            {/* Quick Demo Switcher Section */}
            <div className="pt-4 border-t border-slate-200/80">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Access (Sample Data)
                </span>
                <span className="text-[10px] text-brand-600 font-medium">Instant</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {availablePersonas.slice(0, 4).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleDemoSignIn(p)}
                    type="button"
                    className="p-2 rounded-xl border border-slate-200 hover:border-brand-300 bg-white hover:bg-brand-50/40 text-left transition-all flex items-center gap-2 shadow-subtle group"
                  >
                    <img src={p.avatar} alt={p.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-700 block truncate">
                        {p.name}
                      </span>
                      <span className="text-[10px] text-slate-400 block truncate">
                        {p.role.split('&')[0]}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Security Badge */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Grounded on MongoDB Atlas Cloud Vector Security</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
