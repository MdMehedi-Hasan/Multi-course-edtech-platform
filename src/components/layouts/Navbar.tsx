import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, User, LogOut, LayoutDashboard, Settings, Menu, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../ui/sheet';

interface NavbarProps {
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPath }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { label: 'Courses', path: '/courses' },
    { label: 'Categories', path: '/categories' },
    { label: 'Pricing', path: '/pricing' },
    ...(!user || user.role === 'STUDENT' ? [{ label: 'Become Instructor', path: '/become-instructor' }] : []),
    { label: 'About', path: '/about' },
  ];

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'INSTRUCTOR') return '/instructor/dashboard';
    return '/student/dashboard';
  };

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/settings';
    if (user.role === 'INSTRUCTOR') return '/instructor/profile';
    return '/student/profile';
  };

  const getSettingsPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/settings';
    if (user.role === 'INSTRUCTOR') return '/instructor/settings';
    return '/student/settings';
  };

  const handleMobileNavigate = (path: string) => {
    setMobileMenuOpen(false);
    onNavigate(path);
  };

  const mobileActions: { label: string; icon: React.ReactNode; path?: string; onClick?: () => void; danger?: boolean }[] = user
    ? [
        {
          label: 'Dashboard',
          icon: <LayoutDashboard className="w-4 h-4" />,
          path: getDashboardPath(),
        },
        { label: 'Profile', icon: <User className="w-4 h-4" />, path: getProfilePath() },
        { label: 'Settings', icon: <Settings className="w-4 h-4" />, path: getSettingsPath() },
        {
          label: 'Sign Out',
          icon: <LogOut className="w-4 h-4" />,
          onClick: () => {
            setMobileMenuOpen(false);
            logout();
            onNavigate('/');
          },
          danger: true,
        },
      ]
    : [];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 group focus:outline-none"
          >
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-extrabold text-base text-slate-900 tracking-tight leading-none">
                EduNexus
              </span>
              <span className="text-[10px] font-semibold text-indigo-600 tracking-widest uppercase mt-0.5">
                Global Learning
              </span>
            </div>
          </button>

          {/* Public Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-600 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Authentication Actions + Mobile Menu */}
          <div className="flex items-center gap-3">
            {/* Desktop Auth Actions */}
            <div className="hidden md:flex items-center gap-3">
              {user ? (
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onNavigate(getDashboardPath())}
                    className="flex items-center gap-1.5 shadow-sm text-xs font-semibold px-3.5 py-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </Button>

                  <div className="relative" ref={dropdownRef}>
                    <button
                      onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                      className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 focus:outline-none"
                    >
                      <img
                        src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={user.name || 'User profile'}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200"
                      />
                      <div className="hidden sm:flex flex-col text-left pr-1">
                        <span className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                          {user.name}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500 uppercase">
                          {user.role}
                        </span>
                      </div>
                    </button>

                    {userDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                          <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-extrabold uppercase rounded-md">
                            {user.role}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate(getDashboardPath());
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                          <span>Dashboard</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate(getProfilePath());
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          <span>Profile</span>
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate(getSettingsPath());
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <Settings className="w-4 h-4 text-slate-500" />
                          <span>Settings</span>
                        </button>

                        <div className="border-t border-slate-100 my-1" />

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                            onNavigate('/');
                          }}
                          className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-rose-600" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('/login')}>
                    Sign In
                  </Button>
                  <Button variant="default" size="sm" onClick={() => onNavigate('/register')}>
                    Get Started
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Menu (Base UI Sheet) */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-slate-700"
                    aria-label="Open navigation menu"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-80 sm:w-96 px-0">
                <SheetHeader className="px-5 py-4 border-b border-slate-100">
                  <SheetTitle>
                    <span className="flex items-center gap-2.5">
                      <span className="p-1.5 bg-indigo-600 rounded-lg text-white">
                        <BookOpen className="w-4 h-4" />
                      </span>
                      <span className="font-extrabold text-base text-slate-900 tracking-tight">
                        EduNexus
                      </span>
                    </span>
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    Explore courses, categories, and start learning today.
                  </SheetDescription>
                </SheetHeader>

                <nav className="px-3 pt-2 flex flex-col gap-1 overflow-y-auto">
                  {navLinks.map((link) => {
                    const isActive = currentPath === link.path;
                    return (
                      <button
                        key={link.path}
                        onClick={() => handleMobileNavigate(link.path)}
                        className={`flex items-center justify-between px-3.5 py-3 text-sm font-medium rounded-xl transition-colors ${
                          isActive
                            ? 'bg-indigo-50 text-indigo-600 font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        {link.label}
                        {isActive ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                        ) : (
                          <ArrowRight className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                    );
                  })}
                </nav>

                <div className="mt-auto px-4 pt-3 pb-5 border-t border-slate-100">
                  {user ? (
                    <div className="flex flex-col gap-1">
                      {mobileActions.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => {
                            if (action.onClick) {
                              action.onClick();
                            } else if (action.path) {
                              handleMobileNavigate(action.path);
                            }
                          }}
                          className={`flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                            action.danger
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-indigo-600'
                          }`}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2.5">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full rounded-xl"
                        onClick={() => handleMobileNavigate('/login')}
                      >
                        Sign In
                      </Button>
                      <Button
                        variant="default"
                        size="lg"
                        className="w-full rounded-xl"
                        onClick={() => handleMobileNavigate('/register')}
                      >
                        Get Started
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};