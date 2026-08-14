import React from 'react';
import { SEOHead } from '../../components/ui/SEOHead';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Terms of Service"
        description="EduNexus Terms of Service governing platform usage, account creation, course enrollment, and intellectual property."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-12 space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Legal Agreement</span>
            <h1 className="text-3xl font-extrabold text-slate-900 mt-1">Terms of Service</h1>
            <p className="text-xs text-slate-500 mt-1">Last Updated: January 2026</p>
          </div>

          <div className="text-xs text-slate-600 leading-relaxed space-y-4 border-t border-slate-100 pt-6">
            <p>
              Welcome to EduNexus ("Platform", "we", "us", or "our"). By accessing or using our website, services, video lessons, or course materials, you agree to be bound by these Terms of Service.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">1. User Registration & Account Security</h3>
            <p>
              You must provide accurate, complete information when creating an account. You are responsible for safeguarding your login credentials and for all activities that occur under your account.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">2. Course Enrollment & License</h3>
            <p>
              When you enroll in a course, EduNexus grants you a limited, non-exclusive, non-transferable license to view and access the course content for personal educational purposes. Reselling or distributing video assets is strictly prohibited.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">3. Instructor Responsibilities</h3>
            <p>
              Instructors publishing course content warrant that they own or hold necessary rights to all uploaded media and curriculums, and that content complies with all applicable privacy and trademark laws.
            </p>

            <h3 className="font-bold text-slate-900 text-sm pt-2">4. Limitation of Liability</h3>
            <p>
              EduNexus shall not be liable for any indirect, incidental, or consequential damages resulting from platform downtime, loss of data, or reliance on educational materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
