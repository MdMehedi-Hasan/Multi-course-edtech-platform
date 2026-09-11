import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Clock,
  Send,
  BookOpen,
  DollarSign,
  Users,
  Award,
  ArrowRight,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

interface BecomeInstructorPageProps {
  onNavigate: (path: string) => void;
}

export const BecomeInstructorPage: React.FC<BecomeInstructorPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [headline, setHeadline] = useState('');
  const [expertise, setExpertise] = useState('');
  const [experienceYears, setExperienceYears] = useState(3);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [message, setMessage] = useState('');

  const [existingApplication, setExistingApplication] = useState<any>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      fetchMyApplication();
    }
  }, [user]);

  const fetchMyApplication = async () => {
    if (!user) return;
    setIsLoadingStatus(true);
    try {
      const app = await api.getMyInstructorApplication();
      setExistingApplication(app);
    } catch (err) {
      console.error('Could not fetch existing application:', err);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !expertise.trim() || !bio.trim() || !message.trim()) {
      showToast('Validation Error', 'Please complete all required fields.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await api.submitInstructorApplication({
        name: name.trim(),
        email: email.trim(),
        headline: headline.trim(),
        expertise: expertise.trim(),
        experienceYears: Number(experienceYears),
        bio: bio.trim(),
        website: website.trim(),
        github: github.trim(),
        linkedin: linkedin.trim(),
        message: message.trim(),
      });

      showToast('Application Submitted!', 'Platform administrators have received your application for review.', 'success');
      setExistingApplication(result);
    } catch (err: any) {
      showToast('Submission Failed', err.message || 'Could not submit application.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-10">
        {/* Header Hero */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Instructor Onboarding Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Teach and Inspire Learners Worldwide
          </h1>
          <p className="max-w-2xl mx-auto text-slate-600 text-base">
            Join EduNexus as an approved course instructor. Publish professional courses, mentor global students, and share your domain expertise.
          </p>
        </div>

        {/* Benefits Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Global Student Reach</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Connect with thousands of eager students, professionals, and lifelong learners worldwide.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Earn Revenue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Monetize your courses and masterclasses with flexible course pricing and transparent sales analytics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">State-of-the-Art Studio</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organize multi-section curricula, upload HD videos, configure free previews, and monitor student engagement.
            </p>
          </div>
        </div>

        {/* Status Banners for Existing Role or Application */}
        {user?.role === 'INSTRUCTOR' && (
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <h4 className="font-bold text-emerald-950 text-base">You are an Approved Instructor</h4>
                <p className="text-xs text-emerald-700">Your account already has full course authoring and studio privileges.</p>
              </div>
            </div>
            <Button variant="default" onClick={() => onNavigate('/instructor/dashboard')}>
              Go to Instructor Studio <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </div>
        )}

        {existingApplication && user?.role !== 'INSTRUCTOR' && (
          <div
            className={`p-6 rounded-3xl border ${
              existingApplication.status === 'PENDING'
                ? 'bg-amber-50 border-amber-200'
                : existingApplication.status === 'APPROVED'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-rose-50 border-rose-200'
            }`}
          >
            <div className="flex items-start gap-4">
              {existingApplication.status === 'PENDING' && (
                <Clock className="w-8 h-8 text-amber-600 shrink-0 mt-0.5" />
              )}
              {existingApplication.status === 'APPROVED' && (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0 mt-0.5" />
              )}
              {existingApplication.status === 'REJECTED' && (
                <AlertCircle className="w-8 h-8 text-rose-600 shrink-0 mt-0.5" />
              )}

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-base">Application Status:</h4>
                  <span
                    className={`text-xs font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                      existingApplication.status === 'PENDING'
                        ? 'bg-amber-200 text-amber-900'
                        : existingApplication.status === 'APPROVED'
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-rose-200 text-rose-900'
                    }`}
                  >
                    {existingApplication.status}
                  </span>
                </div>

                {existingApplication.status === 'PENDING' && (
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Thank you for applying to become an instructor on EduNexus! Our administration team is actively reviewing your credentials and proposed curriculum. In the meantime, your account remains active as a student.
                  </p>
                )}

                {existingApplication.status === 'APPROVED' && (
                  <div className="space-y-3 pt-2">
                    <p className="text-xs text-emerald-800">
                      Congratulations! Your instructor application has been approved by the platform administrator.
                    </p>
                    <Button variant="default" size="sm" onClick={() => onNavigate('/instructor/dashboard')}>
                      Launch Instructor Studio <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                )}

                {existingApplication.status === 'REJECTED' && (
                  <div className="text-xs text-rose-800 space-y-1">
                    <p>Your previous application was not approved at this time.</p>
                    {existingApplication.rejectionReason && (
                      <p className="font-semibold italic">Feedback: "{existingApplication.rejectionReason}"</p>
                    )}
                    <p className="text-slate-600 pt-1">You may update your information and re-apply below.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Application Form */}
        {(!existingApplication || existingApplication.status === 'REJECTED') && user?.role !== 'INSTRUCTOR' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-10">
            <div className="border-b border-slate-100 pb-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900">Instructor Application Form</h2>
              <p className="text-xs text-slate-500 mt-1">
                All instructor accounts are manually vetted to ensure top-tier educational standards.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Full Name *"
                  placeholder="e.g. Dr. Jane Smith"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />

                <Input
                  label="Email Address *"
                  type="email"
                  placeholder="jane.smith@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Input
                  label="Professional Headline"
                  placeholder="e.g. Executive Leadership Coach & Consultant"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                />

                <Input
                  label="Primary Subject / Domain Expertise *"
                  placeholder="e.g. Digital Marketing, Graphic Design, Business Strategy, Programming"
                  value={expertise}
                  onChange={(e) => setExpertise(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Years of Experience
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                  />
                </div>

                <Input
                  label="GitHub Profile (optional)"
                  placeholder="github.com/username"
                  value={github}
                  onChange={(e) => setGithub(e.target.value)}
                />

                <Input
                  label="LinkedIn Profile (optional)"
                  placeholder="linkedin.com/in/username"
                  value={linkedin}
                  onChange={(e) => setLinkedin(e.target.value)}
                />
              </div>

              <Input
                label="Portfolio / Personal Website (optional)"
                placeholder="https://janesmith.dev"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Instructor Bio & Background *
                </label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your background, career achievements, and previous mentoring experience..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Course Proposal & Teaching Concept *
                </label>
                <textarea
                  rows={4}
                  placeholder="What course or specialization do you plan to create on EduNexus? Describe the target audience and learning outcomes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-500 text-center sm:text-left">
                  By submitting, you agree to EduNexus Instructor Quality Guidelines.
                </p>
                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto min-w-[200px] flex items-center justify-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  <Send className="w-4 h-4" />
                  Submit Instructor Application
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
