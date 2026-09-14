import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCheck, ExternalLink } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface StudentNotificationsPageProps {
  onNavigate: (path: string) => void;
}

export const StudentNotificationsPage: React.FC<StudentNotificationsPageProps> = ({
  onNavigate,
}) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await api.getStudentNotifications();
        setNotifications(res);
      } catch (err) {
        console.error('Failed to load student notifications:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center pb-6 border-b border-slate-700/50">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64 rounded-lg" />
            <Skeleton className="h-4 w-80 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-700/50">
        <div>
          <h1 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Bell className="w-6 h-6 text-indigo-400" /> Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Stay updated with course progress alerts, certificates, and system updates.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            className="gap-2 text-xs shrink-0"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <Bell className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-100">No notifications</h3>
          <p className="text-xs text-slate-400 mt-1">You are all caught up!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <Card
              key={item.id}
              className={`p-5 transition-colors flex items-start justify-between gap-4 ${
                !item.isRead ? 'bg-indigo-500/10 border-indigo-500/30' : ''
              }`}
            >
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  {!item.isRead && (
                    <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0" />
                  )}
                  <h3 className="font-bold text-slate-100 text-sm">{item.title}</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{item.message}</p>
                <p className="text-[10px] text-slate-500 pt-1">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {item.linkUrl && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(item.linkUrl)}
                    className="text-xs gap-1"
                  >
                    <span>View</span>
                    <ExternalLink className="w-3 h-3" />
                  </Button>
                )}

                {!item.isRead && (
                  <button
                    onClick={() => handleMarkRead(item.id)}
                    className="p-1.5 text-slate-500 hover:text-indigo-400 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
