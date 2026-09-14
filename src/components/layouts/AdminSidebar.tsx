import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  FolderTree,
  CreditCard,
  MessageSquareText,
  BarChart3,
  Bell,
  Shield,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from 'cn';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminSidebar: React.FC<SidebarProps & { className?: string }> = ({
  currentPath,
  onNavigate,
  className,
}) => {
  const { logout } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'All Users', path: '/admin/users', icon: Users },
    { label: 'Students', path: '/admin/students', icon: GraduationCap },
    { label: 'Instructors', path: '/admin/instructors', icon: UserCheck },
    { label: 'Courses', path: '/admin/courses', icon: BookOpen },
    { label: 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: 'Enrollments', path: '/admin/enrollments', icon: CreditCard },
    { label: 'Reviews', path: '/admin/reviews', icon: MessageSquareText },
    { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Notifications', path: '/admin/notifications', icon: Bell },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: Shield },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full min-h-0 border-r border-slate-800',
        className
      )}
    >
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-800">
          Admin Governance
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0 scrollbar-thin">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.path;
          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{link.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t border-slate-800 shrink-0">
        <button
          onClick={() => {
            logout();
            onNavigate('/');
          }}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium text-xs text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
