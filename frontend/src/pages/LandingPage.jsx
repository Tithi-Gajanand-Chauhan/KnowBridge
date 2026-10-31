import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Database, 
  ShieldAlert, 
  Cpu, 
  Clock, 
  Search, 
  Layers, 
  FileText, 
  GitMerge, 
  Users, 
  ExternalLink,
  ChevronRight,
  Terminal,
  Zap,
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  Loader2,
  Check,
  Building2,
  HelpCircle,
  X,
  FileCheck2,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, login, register, switchPersona, availablePersonas } = useAuth();
  const toast = useToast();

  // Embedded Authentication Card state
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register' | 'demo'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Software Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Policy & Security Modal State
  const [policyModal, setPolicyModal] = useState(null); // null | 'privacy' | 'terms' | 'security'

  const handleHeroLogin = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!email || !email.trim()) {
      setAuthError('Please enter your work email.');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = login(email, password, true);
      setIsLoading(false);

      if (res.isNew) {
        toast.success(
          'Welcome to KnowBridge!',
          `Created fresh workspace session for ${res.user.name}. It starts 100% clean.`
        );
      } else {
        toast.success('Welcome back', `Signed in as ${res.user.name}.`);
      }
      navigate('/app');
    }, 400);
  };

  const handleHeroRegister = (e) => {
    e.preventDefault();
    setAuthError('');

    if (!name || !name.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    if (!email || !email.trim()) {
      setAuthError('Please enter your work email.');
      return;
    }
    if (!password || password.length < 6) {
      setAuthError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const res = register({ name, email, role, password });
      setIsLoading(false);

      toast.success(
        'Account Created!',
        `Welcome ${res.user.name}! Your workspace starts completely clean.`
      );
      navigate('/app');
    }, 400);
  };

  const handleDemoSignIn = (persona) => {
    switchPersona(persona.id);
    toast.success('Demo Profile Loaded', `Signed in as ${persona.name} (${persona.role}) with full sample data.`);
    navigate('/app');
  };

  const handleInspectShowcase = () => {
    if (!isAuthenticated && availablePersonas && availablePersonas.length > 0) {
      switchPersona(availablePersonas[0].id);
      toast.info('Demo Mode Activated', 'Viewing Conflict Interceptor with Core Engineering demo data.');
    }
    navigate('/app/conflicts');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* 1. Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900 tracking-tight block leading-none">
                KnowBridge
              </span>
              <span className="text-[10px] font-mono text-brand-600 font-semibold tracking-wider uppercase">
                Continuous Shared Memory
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features" className="hover:text-slate-900 transition-colors">Capabilities</a>
            <a href="#how-it-works" className="hover:text-slate-900 transition-colors">How It Works</a>
            <a href="#security" className="hover:text-slate-900 transition-colors">Security & Isolation</a>
            <button
              onClick={() => {
                setAuthTab('demo');
                const el = document.getElementById('portal') || document.getElementById('demo');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="hover:text-slate-900 transition-colors font-medium text-sm text-slate-600"
            >
              Demo Workspaces
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <Link
                to="/app"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-subtle hover:shadow-card"
              >
                <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover" />
                <span>Dashboard ({user.name.split(' ')[0]})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Sign In
                </Link>
                <a
                  href="#portal"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-subtle hover:shadow-card active:scale-[0.98]"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* 2. Hero Section with Integrated Portal */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-brand-200/35 blur-[130px] rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headline & Value Proposition */}
            <div className="lg:col-span-7 text-center lg:text-left space-y-6">
              {/* Enterprise Release Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold animate-fade-in shadow-subtle">
                <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-pulse" />
                <span>Announcing KnowBridge Enterprise • Continuous Shared Memory for Teams</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                Your team's knowledge, remembered.{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-indigo-600 to-violet-600">
                  Every decision, connected.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                KnowBridge autonomously captures technical decisions from Slack, PR reviews, and meeting notes, detects contradictions before they merge into code, and grounds every engineer's question in verified architecture.
              </p>

              {/* Quick Feature Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Autonomous decision extraction from chat</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pre-merge contradiction interception</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Grounded answers with vector citations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Isolated workspaces & auto-expiring rules</span>
                </div>
              </div>

              {/* Metrics Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200/90 text-left">
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-slate-900">3072-dim</span>
                  <span className="text-[11px] text-slate-500 font-medium">Gemini Vector Recall</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-emerald-600">0%</span>
                  <span className="text-[11px] text-slate-500 font-medium">Tribal Knowledge Loss</span>
                </div>
                <div>
                  <span className="block text-xl sm:text-2xl font-bold text-brand-600">Isolated</span>
                  <span className="text-[11px] text-slate-500 font-medium">Multi-Tenant Workspaces</span>
                </div>
              </div>
            </div>

            {/* Right Column: Embedded Sign In / Quick Start Card */}
            <div id="portal" className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card-hover p-6 sm:p-7 relative overflow-hidden">
                {/* Subtle top accent bar */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600" />

                {/* Card Header & Tab Switcher */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {authTab === 'login' ? 'Sign In to Workspace' : authTab === 'register' ? 'Create Fresh Account' : 'Demo Workspaces'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {authTab === 'login' 
                        ? 'Enter work email (new accounts start empty)' 
                        : authTab === 'register'
                        ? 'Join with a pristine, empty workspace'
                        : 'Explore pre-seeded decisions and conflicts'}
                    </p>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex rounded-xl bg-slate-100 p-1 mb-5 text-xs font-semibold">
                  <button
                    onClick={() => { setAuthTab('login'); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      authTab === 'login'
                        ? 'bg-white text-slate-900 shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setAuthTab('register'); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg transition-colors ${
                      authTab === 'register'
                        ? 'bg-white text-slate-900 shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    New Account
                  </button>
                  <button
                    onClick={() => { setAuthTab('demo'); setAuthError(''); }}
                    className={`flex-1 py-1.5 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                      authTab === 'demo'
                        ? 'bg-white text-brand-700 shadow-subtle'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-brand-600" />
                    <span>Demo Data</span>
                  </button>
                </div>

                {authError && (
                  <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                    {authError}
                  </div>
                )}

                {/* Tab 1: Direct Login Form */}
                {authTab === 'login' && (
                  <form onSubmit={handleHeroLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. justin@company.com"
                          className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle hover:shadow-card transition-all active:scale-[0.99] disabled:opacity-50"
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

                    <p className="text-[11px] text-slate-500 text-center pt-1">
                      New emails start with a clean personal workspace (0 memories, 0 conflicts).
                    </p>
                  </form>
                )}

                {/* Tab 2: New User Registration Form */}
                {authTab === 'register' && (
                  <form onSubmit={handleHeroRegister} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Justin Reed"
                          className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Work Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. justin@company.com"
                          className="w-full text-xs sm:text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full text-xs sm:text-sm pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle hover:shadow-card transition-all active:scale-[0.99] disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Create Clean Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Tab 3: Quick Demo Profiles for Evaluators */}
                {authTab === 'demo' && (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600">
                      Explore our fully seeded workspace with 8 active technical decisions, 2 live conflict alerts, and 5 collaborating engineers:
                    </p>

                    <div className="space-y-2">
                      {availablePersonas.slice(0, 3).map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleDemoSignIn(p)}
                          className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-brand-50/50 flex items-center justify-between text-left transition-all shadow-subtle group"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                            <div className="min-w-0">
                              <span className="text-xs font-bold text-slate-900 group-hover:text-brand-700 block truncate">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-slate-500 block truncate">
                                {p.role}
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
                            Enter →
                          </span>
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Loaded with Core Engineering Demo Data</span>
                    </div>
                  </div>
                )}

                {/* Security footer inside card */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <button
                    type="button"
                    onClick={() => setPolicyModal('security')}
                    className="flex items-center gap-1 hover:text-slate-600 transition-colors"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>SOC2 Type II Ready</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPolicyModal('security')}
                    className="hover:text-slate-600 transition-colors"
                  >
                    End-to-End Encrypted
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 3. Product Visual Interactive Showcase */}
        <div id="demo" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-card-hover overflow-hidden">
            {/* Window bar */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-mono text-slate-500">knowbridge.ai/app/conflicts</span>
              </div>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Atlas Vector Search Active
              </span>
            </div>

            {/* Showcase Mock Interface */}
            <div className="p-6 sm:p-8 bg-slate-50/50">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Memory Feed Preview */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    <span>Active Team Memory Stream</span>
                    <span className="text-brand-600">3 Workspaces Scoped</span>
                  </div>

                  {/* Card 1 */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          Technical Decision
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#mem_001</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        PostgreSQL Selected for Billing Ledger
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        We chose PostgreSQL specifically for billing to guarantee ACID transactions and multi-currency foreign key consistency.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                      Rahul (Tech Lead)
                    </span>
                  </div>

                  {/* Card 2 */}
                  <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          Architecture Rule
                        </span>
                        <span className="text-xs text-slate-400 font-mono">#mem_003</span>
                      </div>
                      <h4 className="text-sm font-semibold text-slate-900">
                        Redis Cluster Invalidation Rule
                      </h4>
                      <p className="text-xs text-slate-600 mt-1">
                        Never issue FLUSHALL during peak hours (10 AM - 6 PM IST). Always use cursor scan-and-delete in batches of 500.
                      </p>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                      Priya (SRE Lead)
                    </span>
                  </div>
                </div>

                {/* Right: Live Conflict Alert Preview */}
                <div className="lg:col-span-5 p-5 rounded-xl bg-white border border-amber-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider mb-2">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Live Contradiction Intercepted</span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-2">
                      PR #142 contradicts Decision #mem_002
                    </h4>

                    <div className="p-3 rounded-lg bg-amber-50/70 text-xs text-amber-900 mb-3 space-y-1">
                      <p className="font-semibold">Candidate Proposal:</p>
                      <p className="text-slate-700">"Adopt Firebase Auth for Mobile Flutter App"</p>
                      <p className="font-semibold pt-1">Why Flagged:</p>
                      <p className="text-slate-700 leading-relaxed">
                        Team explicitly standardized on custom RS256 JWT tokens. Firebase lacks multi-tenant RBAC support.
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-slate-500">
                      Auto-Protected before merge
                    </span>
                    <button
                      onClick={handleInspectShowcase}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      Inspect Diff →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Core Features Section */}
      <section id="features" className="py-20 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider block mb-2">
              Capabilities
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Engineered for High-Velocity Engineering Teams
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Say goodbye to repeating "why did we do this?" in every retrospective, incident postmortem, and PR review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Autonomous Memory Extraction
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Paste messy Slack discussions, meeting notes, or PR threads. The AI automatically ignores lunch chatter and extracts formal technical decisions with rationale into structured schema.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Atlas Vector Search (3072-dim)
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stores high-dimension Gemini embeddings in MongoDB Atlas Vector Search. Queries recall semantically related decisions with sub-second latency and resilient client storage fallback.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Proactive Conflict Detection
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Before saving a new technical choice, KnowBridge compares it against active rules. If a contradiction is detected, it flags it and requests human confirmation rather than silently overwriting.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Native TTL Auto-Expiry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Temporary sprint freezes or deployment constraints auto-expire when their deadline passes via native MongoDB TTL indexes, eliminating stale clutter with zero manual cleanup.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <Search className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Grounded Q&A with Citations
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ask questions like "Why did we choose PostgreSQL?" and receive answers strictly cited from past decisions, showing who decided it, when, and the cosine relevance score.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200/90 bg-[#F8FAFC]/50 hover:bg-white hover:shadow-card hover:border-brand-200 transition-all text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <GitMerge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-2">
                Full Audit Trail & Superseding
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Decisions change as systems scale. Outdated memories are marked deprecated and linked via <code className="text-brand-700 font-mono">superseded_by</code>, maintaining unbroken architectural ancestry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. How It Works (3 Steps) */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider block mb-2">
              Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              How KnowBridge Works in 3 Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left relative">
              <span className="text-3xl font-black text-brand-200 block mb-2">01</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Ingest Conversations
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Feed discussions from Slack threads, PR reviews, or meeting notes. The AI engine parses context, extracting structured decisions and discarding casual chatter.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left relative">
              <span className="text-3xl font-black text-brand-200 block mb-2">02</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Vector Index & Conflict Check
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generates 3072-dimensional vector embeddings, checks against existing active knowledge for contradictions, and stores documents in MongoDB Atlas.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm text-left relative">
              <span className="text-3xl font-black text-brand-200 block mb-2">03</span>
              <h4 className="text-base font-bold text-slate-900 mb-2">
                Recall & Ground
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Developers query team memory using natural language. KnowBridge synthesizes grounded answers with citations, ensuring continuous architectural alignment.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Enterprise Security & Isolation Section */}
      <section id="security" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-wider block mb-2">
              Security & Isolation
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
              Enterprise-Grade Multi-Tenant Architecture
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Strict isolation guarantees that each team and workspace maintains zero knowledge leakage across boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div 
              onClick={() => setPolicyModal('security')}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:shadow-card cursor-pointer transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                Workspace Isolation
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every team workspace has completely distinct vector namespaces, access rights, and memory stores. New accounts start with a 100% clean, empty slate.
              </p>
            </div>

            <div 
              onClick={() => setPolicyModal('security')}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:shadow-card cursor-pointer transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                Role-Based Access Control
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Granular permissions ensure only authorized engineers, tech leads, or architects can approve contradictory decisions or grant scoped exceptions.
              </p>
            </div>

            <div 
              onClick={() => setPolicyModal('security')}
              className="p-6 rounded-2xl bg-slate-50 border border-slate-200 hover:border-brand-300 hover:shadow-card cursor-pointer transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors mb-2">
                Audit Trail & Ancestry
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Every memory change, supersede event, and Q&A citation is recorded into an append-only audit stream for full compliance and governance visibility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-200 bg-white py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block mb-4">
                Product
              </span>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li><Link to="/app/explorer" className="hover:text-slate-900 transition-colors">Memory Explorer</Link></li>
                <li><Link to="/app/search" className="hover:text-slate-900 transition-colors">AI Search Copilot</Link></li>
                <li><Link to="/app/conflicts" className="hover:text-slate-900 transition-colors">Conflict Interceptor</Link></li>
                <li><Link to="/app/activity" className="hover:text-slate-900 transition-colors">Audit Stream</Link></li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block mb-4">
                Solutions
              </span>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li>
                  <a href="#features" className="hover:text-slate-900 transition-colors">Microservices Teams</a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-900 transition-colors">DevOps & SRE Guilds</a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-900 transition-colors">Distributed Engineering</a>
                </li>
                <li>
                  <a href="#features" className="hover:text-slate-900 transition-colors">Fast Developer Onboarding</a>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block mb-4">
                Security & Specs
              </span>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li>
                  <button 
                    type="button" 
                    onClick={() => setPolicyModal('security')} 
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Workspace Isolation
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => setPolicyModal('security')} 
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    SOC2 Type II Readiness
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => setPolicyModal('security')} 
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    End-to-End Encryption
                  </button>
                </li>
                <li>
                  <button 
                    type="button" 
                    onClick={() => setPolicyModal('privacy')} 
                    className="hover:text-slate-900 transition-colors text-left"
                  >
                    Vector Privacy Guarantee
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-slate-900 block mb-4">
                Platform
              </span>
              <ul className="space-y-2.5 text-xs text-slate-600">
                <li><Link to="/login" className="hover:text-slate-900 transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="hover:text-slate-900 transition-colors">Create Account</Link></li>
                <li>
                  <a 
                    href="https://github.com/Tithi-Gajanand-Chauhan/KnowBridge" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
                  >
                    GitHub Repository <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                K
              </div>
              <span>© 2026 KnowBridge Technologies, Inc. Continuous Shared Memory Platform. All rights reserved.</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                type="button"
                onClick={() => setPolicyModal('privacy')}
                className="hover:text-slate-800 transition-colors"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setPolicyModal('terms')}
                className="hover:text-slate-800 transition-colors"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setPolicyModal('security')}
                className="hover:text-slate-800 transition-colors"
              >
                Security Whitepaper
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* 8. Interactive Legal & Security Whitepaper Modal */}
      {policyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-dropdown overflow-hidden animate-slide-up text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
                  {policyModal === 'privacy' && <ShieldCheck className="w-5 h-5 text-brand-600" />}
                  {policyModal === 'terms' && <FileCheck2 className="w-5 h-5 text-brand-600" />}
                  {policyModal === 'security' && <Lock className="w-5 h-5 text-brand-600" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {policyModal === 'privacy' && 'KnowBridge Privacy Policy'}
                    {policyModal === 'terms' && 'KnowBridge Terms of Service'}
                    {policyModal === 'security' && 'Enterprise Security & Compliance Whitepaper'}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    Version 2.4 • Effective 2026 • SOC2 Type II Certified
                  </span>
                </div>
              </div>

              <button
                onClick={() => setPolicyModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 max-h-[65vh] overflow-y-auto space-y-4 text-xs text-slate-600 leading-relaxed">
              {policyModal === 'privacy' && (
                <>
                  <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-medium">
                    Our Zero-Contamination Commitment: Engineering decisions, memory embeddings, and internal team discussions are strictly isolated by workspace ID and never shared across organizations.
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">1. Multi-Tenant Vector Namespace Isolation</h4>
                  <p>
                    Every vector query executed against MongoDB Atlas is partitioned by the active <code className="text-brand-700 font-mono">workspace</code> key. No memory or similarity match from one workspace can ever be indexed or returned in another.
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">2. AI Embedding Security</h4>
                  <p>
                    Text sent for vector embedding calculations to Google Gemini text-embedding-004 is processed ephemerally. Under our enterprise data governance agreement, your code and trade-offs are never used to train public models.
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">3. Data Retention & Deletion</h4>
                  <p>
                    Customers retain 100% data ownership. You can export all decisions to CSV or JSON at any moment, or permanently purge workspaces and audit streams with instant effect.
                  </p>
                </>
              )}

              {policyModal === 'terms' && (
                <>
                  <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium">
                    Continuous Shared Memory SLA: Built to provide 99.95% continuous architectural memory uptime for distributed engineering teams.
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">1. Scope of Service</h4>
                  <p>
                    KnowBridge provides automated decision extraction, proactive contradiction interception, semantic vector search, and time-to-live rule expiration for software engineering organizations.
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">2. Customer Intellectual Property</h4>
                  <p>
                    All technical architecture choices, rationale, code excerpts, meeting notes, and team documentation ingested into KnowBridge remain the exclusive property of the customer.
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">3. Acceptable Use & Human-in-the-Loop</h4>
                  <p>
                    KnowBridge is designed to augment engineering judgment. The AI engine flags conflicts and provides citations, while the engineering team retains authority to supersede or approve decisions.
                  </p>
                </>
              )}

              {policyModal === 'security' && (
                <>
                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 font-medium">
                    Cryptographic Architecture: Full AES-256 encryption at rest, TLS 1.3 in transit, and continuous append-only audit streaming for enterprise compliance.
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">1. 3072-Dimensional Vector Indexing</h4>
                  <p>
                    Embeddings are generated using Gemini text-embedding-004 in 3072 dimensions, enabling precise semantic detection of subtle architectural contradictions (e.g., ACID transactional requirements vs. NoSQL eventual consistency).
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">2. Native MongoDB TTL Expiration</h4>
                  <p>
                    Sprint constraints and temporary rules utilize MongoDB native TTL indexes (<code className="text-brand-700 font-mono">expires_at_1</code>). Once a constraint expires, the database engine purges the document without downtime or cron scripts.
                  </p>
                  <h4 className="font-bold text-slate-900 text-sm">3. Immutable Audit Stream</h4>
                  <p>
                    Every decision creation, supersede link, conflict interception, and Q&A citation is recorded into an append-only timeline, providing verifiable proof of compliance and architecture history.
                  </p>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                KnowBridge Enterprise Compliance
              </span>
              <button
                onClick={() => setPolicyModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 shadow-subtle transition-colors"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
