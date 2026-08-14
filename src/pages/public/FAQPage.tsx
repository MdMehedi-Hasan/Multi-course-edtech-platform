import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Search, MessageSquare } from 'lucide-react';
import { SEOHead } from '../../components/ui/SEOHead';
import { Button } from '../../components/ui/Button';

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
    <div className="py-12 bg-slate-50 min-h-screen">
      <SEOHead
        title="Frequently Asked Questions (FAQ)"
        description="Find answers to common questions about EduNexus courses, video progress tracking, certificates, and student accounts."
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Help Center</span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-1">Frequently Asked Questions</h1>
          <p className="text-xs text-slate-500 mt-2">Find quick answers to common questions about EduNexus courses and account management.</p>
        </div>

        {/* Search Input */}
        <div className="relative mb-8 max-w-xl mx-auto">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search FAQ by keyword..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
          />
        </div>

        {/* FAQ Accordions */}
        <div className="space-y-4">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
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
                  {isOpen ? <ChevronUp className="w-5 h-5 text-indigo-600 shrink-0" /> : <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="p-5 pt-0 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-white rounded-2xl border border-indigo-200 p-8 text-center shadow-xs">
          <MessageSquare className="w-8 h-8 text-indigo-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-900 text-base mb-1">Still Have Questions?</h3>
          <p className="text-xs text-slate-500 mb-6">Our dedicated support team is available 24/7 to assist you.</p>
          <Button variant="primary" size="md" onClick={() => onNavigate('/contact')}>
            Contact Support Team
          </Button>
        </div>
      </div>
    </div>
  );
};
