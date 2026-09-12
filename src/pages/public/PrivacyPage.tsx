import React from 'react';
import { Shield, Database, Lock, UserCog } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

const sections = [
  {
    icon: Database,
    title: '1. Information We Collect',
    body: 'We collect information you provide directly to us during account registration (e.g. name, email, role selection), course enrollments, and lesson progress completions.',
  },
  {
    icon: UserCog,
    title: '2. How We Use Your Information',
    body: 'We use collected data to deliver personalized course experiences, persist video progress checkpoints, issue completion certificates, and optimize platform performance.',
  },
  {
    icon: Lock,
    title: '3. Data Security & Storage',
    body: 'We employ industry-standard encryption, password hashing (bcrypt), and secure HTTP-only cookie authentication to protect your sensitive personal credentials against unauthorized access.',
  },
  {
    icon: UserCog,
    title: '4. Your Rights & Choices',
    body: 'You have the right to request access to, correction of, or deletion of your personal data stored within EduNexus. Contact support@ednexus.edu to exercise these rights.',
  },
];

export const PrivacyPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title="Privacy Policy"
        description="EduNexus Privacy Policy outlining data collection, security measures, and user rights."
      />

      <PageHero
        eyebrow="Privacy & Data Governance"
        eyebrowIcon={<Shield className="w-4 h-4 text-indigo-400" />}
        title={
          <>
            Privacy{' '}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Policy
            </span>
          </>
        }
        description="Last Updated: January 2026"
      />

      <main className="flex-1 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12">
            <p className="text-sm text-slate-600 leading-relaxed border-b border-slate-100 pb-8">
              At EduNexus, we respect your privacy and are committed to protecting your personal data.
              This Privacy Policy explains how we collect, use, and disclose information when you visit our
              platform.
            </p>

            <div className="mt-8 space-y-6">
              {sections.map((s) => (
                <div className="flex gap-4" key={s.title}>
                  <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 shrink-0">
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-slate-900 text-base mb-1.5">{s.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};