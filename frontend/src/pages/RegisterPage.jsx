import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Sparkles, 
  Eye, 
  EyeOff, 
  Lock, 
  Mail, 
  User, 
  Briefcase, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const toast = useToast();

  const invitedWorkspace = searchParams.get('workspace') || '';
  const paramEmail = searchParams.get('email') || '';
  const paramName = searchParams.get('name') || '';
  const paramRole = searchParams.get('role') || 'Software Engineer';

  const [name, setName] = useState(paramName);
  const [email, setEmail] = useState(paramEmail);
  const [role, setRole] = useState(paramRole);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Validation
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false
  });

  const validateName = (val) => {
    if (!val || !val.trim()) return 'Full name is required.';
    if (val.trim().length < 2) return 'Please enter your full name.';
    return '';
  };

  const validateEmail = (val) => {
    if (!val || !val.trim()) return 'Work email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) return 'Please enter a valid work email (e.g. name@company.com).';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    if (val.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'name') setErrors((prev) => ({ ...prev, name: validateName(name) }));
    if (field === 'email') setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (field === 'password') setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setTouched({ name: true, email: true, password: true });
    setErrors({ name: nameErr, email: emailErr, password: passErr });

    if (nameErr || emailErr || passErr) {
      toast.error('Validation Error', 'Please check the highlighted fields.');
      return;
    }

    if (!agreed) {
      toast.warning('Terms Required', 'Please accept the engineering guidelines.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      register({ name, email, role, password, invitedWorkspace });
      setIsLoading(false);
      if (invitedWorkspace) {
        toast.success('Joined Workspace!', `Welcome ${name}! Joined workspace "${invitedWorkspace}".`);
      } else {
        toast.success('Account Created', `Welcome to KnowBridge, ${name}! Your fresh workspace is ready.`);
      }
      navigate('/app');
    }, 500);
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ['Too weak', 'Weak', 'Fair', 'Strong', 'Excellent'];
  const strengthColors = ['bg-slate-200', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const isEmailValid = email.length > 0 && !validateEmail(email);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center">
      <div className="w-full flex-1 flex flex-col lg:flex-row">
        
        {/* Left Hero */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#0B0F19] text-white p-12 lg:p-16 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />

          <div>
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">KnowBridge</span>
            </Link>
          </div>

          <div className="my-auto py-12 max-w-lg space-y-6">
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Start remembering every decision from day one.
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Create an account to preserve technical decisions, extract rules from PR reviews, and prevent contradictory engineering standards.
            </p>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant 3-Step Onboarding</span>
              </div>
              <p className="text-slate-300">
                1. Create your engineering profile.<br/>
                2. Ingest notes or browse existing team memories.<br/>
                3. Ask AI copilot questions with verified source citations.
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>Enterprise Knowledge Security</span>
            <span>Continuous Shared Memory</span>
          </div>
        </div>

        {/* Right Form Container */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
          <div className="w-full max-w-md space-y-6">
            <div className="lg:hidden flex items-center justify-between mb-2">
              <Link to="/" className="inline-flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span className="font-bold text-lg text-slate-900">KnowBridge</span>
              </Link>
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Sign In
              </Link>
            </div>

            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {invitedWorkspace ? 'Accept Workspace Invitation' : 'Create a fresh account'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {invitedWorkspace 
                  ? `You've been invited to join the "${invitedWorkspace}" workspace.`
                  : "Join your engineering team's persistent knowledge network."}
              </p>
            </div>

            {invitedWorkspace && (
              <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 flex items-center gap-2.5 animate-slide-up">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center flex-shrink-0">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block">
                    Workspace Invitation Active
                  </span>
                  <span className="text-brand-700">
                    Signing up will link your account directly to <strong>{invitedWorkspace}</strong>.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (touched.name) setErrors((prev) => ({ ...prev, name: validateName(e.target.value) }));
                    }}
                    onBlur={() => handleBlur('name')}
                    placeholder="e.g. Alex Turner"
                    className={`w-full text-xs sm:text-sm rounded-xl border pl-10 pr-3 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.name && touched.name
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                </div>
                {touched.name && errors.name && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.name}</span>
                  </p>
                )}
              </div>

              {/* Work Email */}
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
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (touched.email) setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
                    }}
                    onBlur={() => handleBlur('email')}
                    placeholder="name@company.com"
                    className={`w-full text-xs sm:text-sm rounded-xl border pl-10 pr-9 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.email && touched.email
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : isEmailValid
                        ? 'border-emerald-300 focus:ring-2 focus:ring-emerald-500/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {touched.email && errors.email && <AlertCircle className="w-4 h-4 text-rose-500" />}
                    {isEmailValid && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  </div>
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.email}</span>
                  </p>
                )}
              </div>

              {/* Role */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Engineering Role
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full text-xs sm:text-sm rounded-xl border border-slate-200 pl-10 pr-3 py-2.5 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  >
                    <option value="Frontend & UI/UX Lead">Frontend & UI/UX Lead</option>
                    <option value="Database & AI Memory Engine Lead">Database & AI Memory Engine Lead</option>
                    <option value="Backend & Express API Lead">Backend & Express API Lead</option>
                    <option value="Tech Lead / Architect">Tech Lead / Architect</option>
                    <option value="SRE & Infrastructure Lead">SRE & Infrastructure Lead</option>
                    <option value="Software Engineer">Software Engineer</option>
                  </select>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
                    }}
                    onBlur={() => handleBlur('password')}
                    placeholder="Create password (min 6 characters)"
                    className={`w-full text-xs sm:text-sm rounded-xl border pl-10 pr-10 py-2.5 bg-white text-slate-800 placeholder-slate-400 focus:outline-none transition-all ${
                      errors.password && touched.password
                        ? 'border-rose-300 focus:ring-2 focus:ring-rose-500/20'
                        : 'border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3, 4].map((step) => (
                        <div
                          key={step}
                          className={`h-full flex-1 rounded-full transition-colors ${
                            strength >= step ? strengthColors[strength] : 'bg-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Strength: {strengthLabels[strength]}
                    </span>
                  </div>
                )}
                {touched.password && errors.password && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />
                    <span>{errors.password}</span>
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="regTerms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-brand-600 rounded border-slate-300"
                />
                <label htmlFor="regTerms" className="text-xs text-slate-600 cursor-pointer">
                  I agree to the team knowledge guidelines and audit standards.
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 transition-all shadow-subtle hover:shadow-card active:scale-[0.99] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Fresh Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account & Join</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
