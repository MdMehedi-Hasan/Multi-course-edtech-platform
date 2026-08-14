import React from 'react';
import { BookOpen, Shield, Sparkles, Award, Users, Globe } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="About EduNexus Global Learning"
        description="Learn about EduNexus' mission to provide accessible, high-impact education across diverse subjects, empowering lifelong learners worldwide."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-12 space-y-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">About EduNexus</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Empowering Lifelong Learners Everywhere</h1>
            <p className="text-xs text-slate-500 mt-2">
              A modern, multi-purpose online learning ecosystem built for students, educators, and organizations.
            </p>
          </div>

          <div className="text-xs leading-relaxed space-y-4 text-slate-600">
            <p>
              EduNexus is a comprehensive online learning platform dedicated to making quality education accessible, engaging, and practical across every discipline.
            </p>
            <p>
              Whether mastering business strategy, graphic design, programming, foreign languages, or creative leadership, our platform connects learners with leading educators through structured video curriculums, interactive assessments, and recognized certificates.
            </p>

            <h3 className="text-base font-bold text-slate-900 pt-6 border-t border-slate-100">Our Core Pillars</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <Shield className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Role-Based Governance</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Secure access control protecting dedicated portals for Students, Instructors, and Platform Administrators.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <Sparkles className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Diverse Curriculums</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Courses spanning business, design, technology, science, humanities, marketing, and language fluency.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <Award className="w-5 h-5 text-amber-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Interactive Progress Engine</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Real-time video progress tracking, completion calculations, and verifiable digital certificates.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <Globe className="w-5 h-5 text-purple-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-xs">Global Learner Network</h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  Join over 50,000 active students and instructors expanding their horizons and leveling up their careers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
