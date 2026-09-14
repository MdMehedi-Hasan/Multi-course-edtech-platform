import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  Heart,
  Star,
  User,
  Settings,
  Bell,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from 'cn';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const StudentSidebar: React.FC<SidebarProps & { className?: string }> = ({
  currentPath,
  onNavigate,
  className,
}) => {
  const { logout } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/student/courses', icon: BookOpen },
    { label: 'Progress & Stats', path: '/student/progress', icon: TrendingUp },
    { label: 'Wishlist', path: '/student/wishlist', icon: Heart },
    { label: 'My Reviews', path: '/student/reviews', icon: Star },
    { label: 'Profile', path: '/student/profile', icon: User },
    { label: 'Notifications', path: '/student/notifications', icon: Bell },
    { label: 'Account Settings', path: '/student/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full min-h-0 border-r border-slate-800',
        className
      )}
    >
      <div className="p-4 border-b border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-md border border-emerald-800">
          Student Portal
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800">
        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
