import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { BookOpen, LogOut, ArrowLeft, Search, User, Settings, Bell, Heart } from 'lucide-react';
import { StudentSidebar } from './StudentSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';

interface StudentLayoutProps {
  children: ReactNode;
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const StudentLayout: React.FC<StudentLayoutProps> = ({
  children,
  currentPath,
  onNavigate,
}) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Student Portal App Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/20 font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base text-white tracking-tight leading-none">
                  EduNexus
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  Student Portal
                </span>
              </div>
            </div>
          </div>

          <div className="hidden md:block h-5 w-[1px] bg-slate-800" />

          {/* Return to Public Website link */}
          <button
            onClick={() => onNavigate('/courses')}
            className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Explore All Courses</span>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/courses')}
            className="hidden sm:flex items-center gap-1.5 border-slate-700 bg-slate-850 hover:bg-slate-800 text-slate-200 text-xs"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>Course Catalog</span>
          </Button>

          {/* User Profile & Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-800/80 transition-colors border border-transparent hover:border-slate-700"
            >
              <img
                src={user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={user?.name || 'Student'}
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40"
              />
              <div className="hidden sm:flex flex-col text-left pr-1">
                <span className="text-xs font-bold text-slate-200 leading-tight truncate max-w-[130px]">
                  {user?.name}
                </span>
                <span className="text-[10px] font-semibold text-emerald-400">Student</span>
              </div>
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-slate-950 rounded-2xl shadow-2xl border border-slate-800 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                <div className="px-4 py-2 border-b border-slate-800">
                  <p className="text-xs font-bold text-slate-200 truncate">{user?.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-950 text-emerald-300 text-[10px] font-extrabold uppercase rounded border border-emerald-800/60">
                    Student
                  </span>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/student/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Student Profile</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/student/wishlist');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/student/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-850 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 text-slate-400" />
                  <span>Public Website</span>
                </button>

                <div className="border-t border-slate-800 my-1" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    logout();
                    onNavigate('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-950/40 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-400" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Workspace with dedicated Student Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        <StudentSidebar currentPath={currentPath} onNavigate={onNavigate} />
        <main className="flex-1 bg-slate-900 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
};
