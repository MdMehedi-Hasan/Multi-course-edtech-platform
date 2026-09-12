import React from 'react';
import { ScrollText, UserCheck, BookOpen, ShieldCheck, Scale } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';
import { PageHero } from '../../components/layouts/PageHero';

const sections = [
  {
    icon: UserCheck,
    title: '1. User Registration & Account Security',
    body: 'You must provide accurate, complete information when creating an account. You are responsible for safeguarding your login credentials and for all activities that occur under your account.',
  },
  {
    icon: BookOpen,
    title: '2. Course Enrollment & License',
    body: 'When you enroll in a course, EduNexus grants you a limited, non-exclusive, non-transferable license to view and access the course content for personal educational purposes. Reselling or distributing video assets is strictly prohibited.',
  },
  {
    icon: ShieldCheck,
    title: '3. Instructor Responsibilities',
    body: 'Instructors publishing course content warrant that they own or hold necessary rights to all uploaded media and curriculums, and that content complies with all applicable privacy and trademark laws.',
  },
  {
    icon: Scale,
    title: '4. Limitation of Liability',
    body: 'EduNexus shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, loss of data, or reliance on educational materials.',
  },
];

export const TermsPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title="Terms of Service"
        description="EduNexus Terms of Service governing platform usage, account creation, course enrollment, and intellectual property."
      />

      <PageHero
        eyebrow="Legal Agreement"
        eyebrowIcon={<ScrollText className="w-4 h-4 text-indigo-400" />}
        title={
          <>
            Terms of{' '}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Service
            </span>
          </>
        }
        description="Last Updated: January 2026"
      />

      <main className="flex-1 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8 sm:p-12">
            <p className="text-sm text-slate-600 leading-relaxed border-b border-slate-100 pb-8">
              Welcome to EduNexus ("Platform", "we", "us", or "our"). By accessing or using our website,
              services, video lessons, or course materials, you agree to be bound by these Terms of Service.
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