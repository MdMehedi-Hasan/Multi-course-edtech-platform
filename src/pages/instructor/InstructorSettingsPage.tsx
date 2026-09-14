import React, { useState } from 'react';
import { Lock, Bell, CheckCircle2, ShieldAlert, KeyRound } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorSettingsPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorSettingsPage: React.FC<InstructorSettingsPageProps> = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailEnrollments, setEmailEnrollments] = useState(true);
  const [emailReviews, setEmailReviews] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const [isChangingPass, setIsChangingPass] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setErrorMsg('New password must be at least 8 characters long.');
      return;
    }

    try {
      setIsChangingPass(true);
      setErrorMsg(null);
      setSuccessMsg(null);

      await api.changeInstructorPassword({ currentPassword, newPassword });
      setSuccessMsg('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      setErrorMsg(err.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100">Instructor Settings & Security</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage password security, email alerts, and payout preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Password Change Card */}
      <Card className="p-6 border-slate-700/50 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" /> Change Security Password
        </h2>

        <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Current Password *</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-slate-900/60 text-slate-100 p-2.5 rounded-xl border border-slate-700/50"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">New Password *</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-slate-900/60 text-slate-100 p-2.5 rounded-xl border border-slate-700/50"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-300 mb-1">Confirm New Password *</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-900/60 text-slate-100 p-2.5 rounded-xl border border-slate-700/50"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="default" size="sm" disabled={isChangingPass} className="text-xs">
              {isChangingPass ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 border-slate-700/50 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-400" /> Email Notifications
        </h2>

        <div className="space-y-3 text-xs">
          <label className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-100">New Student Enrollments</p>
              <p className="text-[10px] text-slate-400">Receive an instant email when a student purchases your course.</p>
            </div>
            <input
              type="checkbox"
              checked={emailEnrollments}
              onChange={(e) => setEmailEnrollments(e.target.checked)}
              className="rounded text-indigo-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-100">Course Reviews & Feedback</p>
              <p className="text-[10px] text-slate-400">Get notified when a student submits a review on your course.</p>
            </div>
            <input
              type="checkbox"
              checked={emailReviews}
              onChange={(e) => setEmailReviews(e.target.checked)}
              className="rounded text-indigo-400"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 cursor-pointer">
            <div>
              <p className="font-bold text-slate-100">Platform & Feature Updates</p>
              <p className="text-[10px] text-slate-400">Receive monthly newsletter regarding instructor platform enhancements.</p>
            </div>
            <input
              type="checkbox"
              checked={emailUpdates}
              onChange={(e) => setEmailUpdates(e.target.checked)}
              className="rounded text-indigo-400"
            />
          </label>
        </div>
      </Card>
    </div>
  );
};
