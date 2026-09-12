import React, { useState } from 'react';
import { GraduationCap, User, Shield, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';

interface LoginPageProps {
  onNavigate: (path: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login, loginWithGoogle, demoLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [isDemoSubmitting, setIsDemoSubmitting] = useState(false);

  const routeByRole = (role: string) => {
    if (role === 'ADMIN') {
      onNavigate('/admin/dashboard');
    } else if (role === 'INSTRUCTOR') {
      onNavigate('/instructor/dashboard');
    } else {
      onNavigate('/student/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Validation Error', 'Please enter both email and password.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      showToast('Welcome back!', `Signed in as ${user.name || user.email}.`, 'success');
      routeByRole(user.role);
    } catch (err: any) {
      showToast('Authentication Failed', err.message || 'Invalid email or password.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleSubmitting(true);
    try {
      // Demo simulated Google profile payload or existing link
      const targetEmail = email.trim() || 'student@ednexus.edu';
      const user = await loginWithGoogle({
        email: targetEmail,
        name: 'Google User',
      });
      showToast('Google Sign In', `Welcome back, ${user.name}!`, 'success');
      routeByRole(user.role);
    } catch (err: any) {
      showToast('Google Auth Error', err.message || 'Failed to authenticate with Google.', 'error');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoRole = async (role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN') => {
    if (isDemoSubmitting) return;
    setIsDemoSubmitting(true);
    try {
      const user = await demoLogin(role);
      showToast('Demo Mode Active', `Signed in as ${role}`, 'success');
      routeByRole(user.role);
    } catch (err: any) {
      showToast('Error', 'Failed to activate demo login', 'error');
    } finally {
      setIsDemoSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_55%)] pointer-events-none" />
      <SEOHead title="Sign In" description="Sign in to your EduNexus account to continue learning or teaching." />
      <div className="w-full max-w-md relative bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex mb-3">
            <img src="/dark-logo.png" alt="EduNexus" className="h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Sign In to EduNexus</h1>
          <p className="text-xs text-slate-500 mt-1">Access your learning portal or instructor studio.</p>
        </div>

        {/* 1-Click Demo Login Panel */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 mb-6">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
            Instant 1-Click Test Login
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleDemoRole('STUDENT')}
              disabled={isDemoSubmitting || isGoogleSubmitting || isSubmitting}
              className="px-2.5 py-1.5 bg-white hover:bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex flex-col items-center gap-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <GraduationCap className="w-4 h-4 text-emerald-600" />
              <span>Student</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoRole('INSTRUCTOR')}
              disabled={isDemoSubmitting || isGoogleSubmitting || isSubmitting}
              className="px-2.5 py-1.5 bg-white hover:bg-amber-50 text-amber-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex flex-col items-center gap-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <User className="w-4 h-4 text-amber-600" />
              <span>Instructor</span>
            </button>
            <button
              type="button"
              onClick={() => handleDemoRole('ADMIN')}
              disabled={isDemoSubmitting || isGoogleSubmitting || isSubmitting}
              className="px-2.5 py-1.5 bg-white hover:bg-purple-50 text-purple-700 font-bold text-xs rounded-xl border border-slate-200 shadow-xs flex flex-col items-center gap-1 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Shield className="w-4 h-4 text-purple-600" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Continue with Google */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleSubmitting || isSubmitting || isDemoSubmitting}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm transition shadow-sm mb-4"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {isGoogleSubmitting ? 'Connecting Google...' : 'Continue with Google'}
        </button>

        <div className="flex items-center my-4">
          <div className="flex-1 border-t border-slate-200" />
          <span className="px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">or email</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="student@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs pt-1">
            <button
              type="button"
              onClick={() => onNavigate('/forgot-password')}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <Button type="submit" variant="default" size="lg" disabled={isSubmitting || isDemoSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account yet?{' '}
          <button type="button" onClick={() => onNavigate('/register')} className="font-bold text-indigo-600 hover:underline">
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};

