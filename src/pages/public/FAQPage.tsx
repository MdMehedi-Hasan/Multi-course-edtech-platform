import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';
import { PageHero } from '../../components/layouts/PageHero';

interface FAQPageProps {
  onNavigate: (path: string) => void;
}

export const FAQPage: React.FC<FAQPageProps> = ({ onNavigate }) => {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const faqList = [
    {
      category: 'General Platform',
      question: 'What is EduNexus and who is it designed for?',
      answer: 'EduNexus is a modern global online learning platform designed for students, working professionals, and lifelong learners seeking high-impact courses across diverse disciplines.',
    },
    {
      category: 'General Platform',
      question: 'Are courses self-paced or live scheduled?',
      answer: 'All EduNexus courses offer self-paced video curriculums. Once enrolled, you get lifetime access to study on your schedule.',
    },
    {
      category: 'Courses & Certification',
      question: 'How do video progress saving and certificates work?',
      answer: 'As you watch video lessons, your progress is automatically persisted to your account. Upon completing 100% of a course curriculum, EduNexus generates a shareable certificate of completion.',
    },
    {
      category: 'Courses & Certification',
      question: 'Can I preview course content before enrolling?',
      answer: 'Yes! Every course includes free preview lessons accessible to public visitors without requiring prior payment.',
    },
    {
      category: 'Accounts & Licensing',
      question: 'What is the difference between Student, Instructor, and Admin roles?',
      answer: 'Students browse and enroll in courses; Instructors create, edit, and publish video curriculums; Admins manage user roles, system metrics, and platform governance.',
    },
    {
      category: 'Accounts & Licensing',
      question: 'How do I reset my account password?',
      answer: 'You can navigate to the Forgot Password page, enter your registered email, and follow the secure password reset instructions.',
    },
  ];

  const filteredFaqs = faqList.filter(
    (f) =>
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about EduNexus courses, video progress tracking, certificates, and student accounts."
      />

      <PageHero
        eyebrow="Help Center"
        eyebrowIcon={<HelpCircle className="w-4 h-4 text-indigo-400" />}
        title={
          <>
            Frequently Asked{' '}
            <span className="bg-linear-to-r from-indigo-400 via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              Questions
            </span>
          </>
        }
        description="Find quick answers to common questions about EduNexus courses and account management."
      />

      <main className="flex-1 py-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Input */}
          <div className="relative mb-8 max-w-xl mx-auto">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search FAQ by keyword..."
              className="w-full pl-10 pr-4 py-3 text-xs bg-white border border-slate-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-colors"
            />
          </div>

          {/* FAQ Accordions */}
          <div className="space-y-4">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIdx === idx;
              return (
                <div
                  key={idx}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-colors ${
                    isOpen ? 'border-indigo-300' : 'border-slate-200/80'
                  }`}
                >
                  <button
                    onClick={() => setOpenIdx(isOpen ? null : idx)}
                    className="w-full text-left p-5 hover:bg-slate-50/80 transition-colors flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block mb-0.5">
                        {faq.category}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{faq.question}</h3>
                    </div>
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isOpen ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-sm shadow-indigo-600/25' : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}

            {filteredFaqs.length === 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                No FAQ results match "{searchQuery}". Try a different keyword.
              </div>
            )}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 relative overflow-hidden bg-white rounded-2xl border border-indigo-200 p-8 text-center shadow-sm">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.1),transparent_60%)]" />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-indigo-500/25">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-1">Still Have Questions?</h3>
              <p className="text-xs text-slate-500 mb-6">Our dedicated support team is available 24/7 to assist you.</p>
              <Button variant="default" onClick={() => onNavigate('/contact')}>
                Contact Support Team
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};