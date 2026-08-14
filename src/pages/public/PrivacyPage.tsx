import React from 'react';
import { SEOHead } from '../../components/ui/SEOHead';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Privacy Policy"
        description="EduNexus Privacy Policy outlining data collection, security measures, and user rights."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-12 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Privacy & Data Governance</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Privacy Policy</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: January 2026</p>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed space-y-4 border-t border-slate-100 pt-6">
            <p>
              At EduNexus, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and disclose information when you visit our platform.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">1. Information We Collect</h3>
            <p>
              We collect information you provide directly to us during account registration (e.g. name, email, role selection), course enrollments, and lesson progress completions.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">2. How We Use Your Information</h3>
            <p>
              We use collected data to deliver personalized course experiences, persist video progress checkpoints, issue completion certificates, and optimize platform performance.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">3. Data Security & Storage</h3>
            <p>
              We employ industry-standard encryption, password hashing (`bcrypt`), and secure HTTP-only cookie authentication to protect your sensitive personal credentials against unauthorized access.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">4. Your Rights & Choices</h3>
            <p>
              You have the right to request access to, correction of, or deletion of your personal data stored within EduNexus. Contact support@ednexus.edu to exercise these rights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
