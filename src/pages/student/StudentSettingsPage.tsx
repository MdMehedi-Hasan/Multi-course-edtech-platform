import React, { useState } from 'react';
import { KeyRound, ShieldCheck, BellRing, CheckCircle, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StudentSettingsPageProps {
  onNavigate?: (path: string) => void;
}

export const StudentSettingsPage: React.FC<StudentSettingsPageProps> = () => {
  const { user } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  const [notifyCourseUpdates, setNotifyCourseUpdates] = useState(true);
  const [notifyPromotions, setNotifyPromotions] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    if (newPassword.length < 8) {
      setPwdError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError('New passwords do not match.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await api.changeStudentPassword({ currentPassword, newPassword });
      setPwdSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to update password:', err);
      setPwdError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const inputClass =
    'w-full bg-slate-900/60 text-slate-100 placeholder:text-slate-500 p-2.5 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-indigo-500';

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100">Account & Security Settings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage credentials, password updates, and notification settings.
        </p>
      </div>

      {/* Account Info Box */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Account Security Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Primary Email
            </span>
            <p className="font-bold text-slate-100 mt-0.5">{user?.email}</p>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-700/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Account Role
            </span>
            <p className="font-bold text-indigo-400 mt-0.5">{user?.role}</p>
          </div>
        </div>
      </Card>

      {/* Password Change Form */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-indigo-400" /> Change Password
        </h2>

        {pwdError && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>{pwdError}</span>
          </div>
        )}

        {pwdSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{pwdSuccess}</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <Button type="submit" variant="default" disabled={isUpdatingPassword} className="text-xs">
            {isUpdatingPassword ? 'Updating Password...' : 'Update Password'}
          </Button>
        </form>
      </Card>

      {/* Notification Preferences */}
      <Card className="p-6 space-y-4">
        <h2 className="text-sm font-extrabold text-slate-100 flex items-center gap-2">
          <BellRing className="w-4 h-4 text-indigo-400" /> Email Notifications
        </h2>

        <div className="space-y-3 divide-y divide-slate-700/50 text-xs">
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="font-bold text-slate-100">Course & Lesson Announcements</p>
              <p className="text-[11px] text-slate-400">
                Receive email alerts for new course modules and updates.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyCourseUpdates}
              onChange={(e) => setNotifyCourseUpdates(e.target.checked)}
              className="w-4 h-4 text-indigo-400 rounded border-slate-600 bg-slate-800 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between pt-3">
            <div>
              <p className="font-bold text-slate-100">Promotional & Catalog Updates</p>
              <p className="text-[11px] text-slate-400">
                Receive special discount offers and new category additions.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyPromotions}
              onChange={(e) => setNotifyPromotions(e.target.checked)}
              className="w-4 h-4 text-indigo-400 rounded border-slate-600 bg-slate-800 focus:ring-indigo-500"
            />
          </div>
        </div>
      </Card>
    </div>
  );
};
