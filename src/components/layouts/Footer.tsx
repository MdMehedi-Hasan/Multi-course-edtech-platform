import React from 'react';

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Info */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt="EduNexus"
                className="h-7 brightness-0 invert"
              />
            </div>
            <p className="text-slate-400 leading-relaxed max-w-xs">
              Enterprise-grade online learning management ecosystem built for students, instructors, and educational institutions.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider">Explore</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/courses')} className="hover:text-white transition-colors">
                  Course Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-white transition-colors">
                  Categories
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/instructors')} className="hover:text-white transition-colors">
                  Top Instructors
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/pricing')} className="hover:text-white transition-colors">
                  Pricing Plans
                </button>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigate('/about')} className="hover:text-white transition-colors">
                  About EduNexus
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/contact')} className="hover:text-white transition-colors">
                  Contact Support
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/faq')} className="hover:text-white transition-colors">
                  FAQ Center
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/terms')} className="hover:text-white transition-colors">
                  Terms of Service
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy Policy
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Status */}
          <div>
            <h4 className="font-bold text-slate-200 text-sm mb-3 uppercase tracking-wider">System Architecture</h4>
            <p className="text-slate-400 leading-relaxed mb-3">
              Phase 3 Public Web Foundation running modular Express REST API + React SPA architecture.
            </p>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-950/80 text-emerald-300 rounded-full border border-emerald-800 text-[11px] font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Services Operational
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© {new Date().getFullYear()} EduNexus Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate('/terms')} className="hover:text-slate-300">
              Terms
            </button>
            <button onClick={() => onNavigate('/privacy')} className="hover:text-slate-300">
              Privacy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
