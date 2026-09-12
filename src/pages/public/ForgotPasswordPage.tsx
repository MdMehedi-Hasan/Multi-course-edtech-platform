import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { SEOHead } from '../../components/ui/SEOHead';

interface ForgotPasswordPageProps {
  onNavigate: (path: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast('Validation Error', 'Please enter your email address.', 'error');
      return;
    }
    setSubmitted(true);
    showToast('Reset Link Sent', 'If an account exists, a recovery link has been dispatched.', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.08),transparent_55%),radial-gradient(ellipse_at_bottom_right,rgba(139,92,246,0.08),transparent_55%)] pointer-events-none" />
      <SEOHead title="Forgot Password" description="Reset your EduNexus account password via email recovery." />
      <div className="w-full max-w-md relative bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="inline-flex mb-3">
            <img src="/dark-logo.png" alt="EduNexus" className="h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Reset Your Password</h1>
          <p className="text-xs text-slate-500 mt-1">Enter your registered email address to receive password reset instructions.</p>
        </div>

        {submitted ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
            <p className="text-xs text-emerald-800 font-medium leading-relaxed">
              Password recovery email dispatched to <strong>{email}</strong>. Check your inbox to set a new password.
            </p>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/login')} className="mt-4">
              Return to Login
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <Button type="submit" variant="default" size="lg" className="w-full">
              Send Reset Link
            </Button>
          </form>
        )}

        <div className="mt-6 text-center text-xs text-slate-500">
          Remembered your password?{' '}
          <button onClick={() => onNavigate('/login')} className="font-bold text-indigo-600 hover:underline">
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
