import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  PlusCircle,
  Users,
  BarChart3,
  Star,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const InstructorSidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate }) => {
  const { logout } = useAuth();

  const links = [
    { label: 'Dashboard', path: '/instructor/dashboard', icon: LayoutDashboard },
    { label: 'My Courses', path: '/instructor/courses', icon: BookOpen },
    { label: 'Create Course', path: '/instructor/courses/create', icon: PlusCircle },
    { label: 'Students', path: '/instructor/students', icon: Users },
    { label: 'Analytics', path: '/instructor/analytics', icon: BarChart3 },
    { label: 'Reviews', path: '/instructor/reviews', icon: Star },
    { label: 'Profile', path: '/instructor/profile', icon: User },
    { label: 'Settings', path: '/instructor/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 h-full min-h-0 border-r border-slate-800">
      <div className="p-4 border-b border-slate-800">
        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800">
          Instructor Studio
        </span>
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto min-h-0">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = currentPath === link.path || (link.path === '/instructor/courses/create' && currentPath === '/instructor/courses/new');
          return (
            <button
              key={link.path}
              onClick={() => onNavigate(link.path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-xs transition-colors ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-extrabold'
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
