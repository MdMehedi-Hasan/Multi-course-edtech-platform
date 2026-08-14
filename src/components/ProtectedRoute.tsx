import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/index';
import { ShieldAlert, Lock, ArrowRight } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  onNavigate: (path: string) => void;
}

export function ProtectedRoute({ children, allowedRoles, onNavigate }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-600 font-medium text-sm">Verifying authorization security credentials...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
        <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Authentication Required</h2>
        <p className="text-slate-600 text-sm mb-6">
          You must be logged in to access this section of the platform.
        </p>
        <button
          onClick={() => onNavigate('/login')}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-200 flex items-center justify-center gap-2"
        >
          Sign In to Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div className="max-w-lg mx-auto my-16 p-8 bg-white rounded-2xl shadow-lg border border-rose-100 text-center">
        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied - Role Authorization Guard</h2>
        <p className="text-slate-600 text-sm mb-2">
          Your current account role <span className="font-semibold text-rose-600 uppercase">[{user.role}]</span> is not authorized to view this resource.
        </p>
        <p className="text-slate-500 text-xs mb-6">
          Required roles: {allowedRoles.join(', ')}
        </p>
        <button
          onClick={() => {
            if (user.role === 'STUDENT') onNavigate('/student/dashboard');
            else if (user.role === 'INSTRUCTOR') onNavigate('/instructor/dashboard');
            else if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
            else onNavigate('/');
          }}
          className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition shadow-sm"
        >
          Return to My Authorized Dashboard
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
