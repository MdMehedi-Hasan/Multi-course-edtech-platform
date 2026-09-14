import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { BookOpen, LogOut, ArrowLeft, Menu, X, User, Settings, Heart } from 'lucide-react';
import { StudentSidebar } from './StudentSidebar';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Sheet, SheetContent, SheetClose } from '../ui/sheet';

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    <div className="h-screen bg-slate-900 text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Top Student Portal App Header */}
      <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mobile Sidebar Toggle */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="EduNexus" className="h-7 brightness-0 invert" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                  Student Portal
                </span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block h-5 w-[1px] bg-slate-800" />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('/courses')}
            className="hidden sm:flex items-center gap-1.5 border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs"
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
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>Student Profile</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/student/wishlist');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Heart className="w-4 h-4 text-rose-400" />
                  <span>Wishlist</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/student/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onNavigate('/');
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-slate-300 hover:bg-slate-800 hover:text-emerald-400 flex items-center gap-2.5 font-medium transition-colors"
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
      <div className="flex-1 min-h-0 flex overflow-hidden">
        <div className="hidden lg:block h-full">
          <StudentSidebar currentPath={currentPath} onNavigate={onNavigate} />
        </div>
        <main className="flex-1 min-h-0 bg-slate-900 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className="w-80 sm:w-96 p-0 gap-0 bg-slate-950 border-slate-800"
        >
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800 shrink-0">
            <img src="/logo.png" alt="EduNexus" className="h-6 brightness-0 invert" />
            <SheetClose
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close navigation menu"
            >
              <X className="w-4 h-4" />
            </SheetClose>
          </div>
          <div className="flex-1 overflow-y-auto min-h-0">
            <StudentSidebar
              currentPath={currentPath}
              onNavigate={(path) => {
                setSidebarOpen(false);
                onNavigate(path);
              }}
              className="w-full min-h-0 border-r-0"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
