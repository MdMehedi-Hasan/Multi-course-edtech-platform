import React, { useState } from 'react';
import { Bell, Send, CheckCircle2, AlertCircle, Megaphone } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminNotificationsPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    linkUrl: '',
    targetRole: 'ALL',
  });

  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;

    try {
      setIsSending(true);
      const res = await api.broadcastAdminNotification(formData);
      setResultMessage({
        type: 'success',
        text: res.message || 'Broadcast notification dispatched successfully!',
      });
      setFormData({
        title: '',
        message: '',
        linkUrl: '',
        targetRole: 'ALL',
      });
    } catch (err: any) {
      setResultMessage({
        type: 'error',
        text: err.message || 'Failed to dispatch broadcast notification.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">System Broadcast Announcements</h1>
        <p className="text-xs text-slate-400 mt-1">Dispatch platform updates, policy changes, or system maintenance alerts to all users or target roles.</p>
      </div>

      {resultMessage && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-xs font-semibold ${
            resultMessage.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {resultMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
          <span>{resultMessage.text}</span>
        </div>
      )}

      <Card className="p-6 max-w-2xl">
        <div className="flex items-center gap-3 border-b pb-4 mb-5">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-100 text-base">New Platform Broadcast</h3>
            <p className="text-xs text-slate-400">Sent instantly to in-app notification centers for online users.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">Target Audience</label>
            <select
              value={formData.targetRole}
              onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            >
              <option value="ALL">All Platform Users (Students + Faculty + Admins)</option>
              <option value="STUDENT">Students Only</option>
              <option value="INSTRUCTOR">Instructors Only</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Notification Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., Platform Terms Update / Scheduled Maintenance"
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Message Body *</label>
            <textarea
              rows={4}
              required
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Provide clear details regarding the announcement..."
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">Optional Action Link URL</label>
            <input
              type="text"
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              placeholder="E.g., /courses or /student/settings"
              className="w-full p-2.5 bg-slate-900/60 border border-slate-700/50 rounded-xl text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600 font-mono text-[11px]"
            />
          </div>

          <div className="pt-2">
            <Button type="submit" variant="default" className="w-full py-2.5" disabled={isSending}>
              {isSending ? 'Dispatching Broadcast...' : 'Broadcast Notification Now'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
