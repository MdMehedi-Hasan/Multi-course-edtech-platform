import React, { useEffect, useState } from 'react';
import { Settings, Save, CheckCircle2, AlertCircle, Shield, Globe, Lock } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<any>({
    siteName: 'LearnPulse Governance',
    supportEmail: 'support@learnpulse.edu',
    requireInstructorApproval: true,
    enablePublicRegistration: true,
    maintenanceMode: false,
    allowCourseSelfPublishing: false,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      await api.updateAdminSettings(settings);
      setFeedback({ type: 'success', message: 'Platform global settings updated successfully.' });
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update settings.' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">System Settings & Platform Parameters</h1>
        <p className="text-xs text-slate-500 mt-1">Configure global registration policies, faculty onboarding requirements, and emergency maintenance controls.</p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      <Card className="p-6 max-w-2xl">
        <form onSubmit={handleSave} className="space-y-6 text-xs">
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Globe className="w-4 h-4 text-purple-600" /> General Identification
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Platform Brand Name</label>
              <input
                type="text"
                required
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Support Email</label>
              <input
                type="email"
                required
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-600 font-medium"
              />
            </div>
          </div>

          {/* Onboarding & Publishing Governance */}
          <div className="space-y-4 border-b pb-6">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-600" /> Security & Onboarding Rules
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Require Manual Approval for New Faculty</p>
                <p className="text-[11px] text-slate-500">New instructors cannot publish courses until vetted by an admin.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.requireInstructorApproval}
                onChange={(e) => setSettings({ ...settings, requireInstructorApproval: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Allow Public Account Registrations</p>
                <p className="text-[11px] text-slate-500">Enable new student signups via auth portal.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.enablePublicRegistration}
                onChange={(e) => setSettings({ ...settings, enablePublicRegistration: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <p className="font-bold text-slate-900">Allow Instructor Self-Publishing</p>
                <p className="text-[11px] text-slate-500">Instructors can publish directly without individual course admin review.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.allowCourseSelfPublishing}
                onChange={(e) => setSettings({ ...settings, allowCourseSelfPublishing: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2 text-rose-600">
              <Lock className="w-4 h-4" /> System Maintenance Override
            </h3>

            <div className="flex items-center justify-between p-3.5 bg-rose-50 border border-rose-200 rounded-xl">
              <div>
                <p className="font-bold text-rose-900">Activate Platform Maintenance Mode</p>
                <p className="text-[11px] text-rose-700">Restrict non-admin users from accessing courses or purchasing enrollments.</p>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-rose-600 rounded border-rose-300 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="pt-3">
            <Button type="submit" variant="primary" className="w-full py-2.5" disabled={isSaving}>
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving System Configuration...' : 'Save Configuration Parameters'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
