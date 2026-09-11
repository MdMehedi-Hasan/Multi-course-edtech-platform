import React, { useEffect, useState } from 'react';
import {
  Star,
  CheckCircle2,
  Shield,
  Lock,
  Award,
  Clock,
  BookOpen,
  User,
  Play,
  HelpCircle,
  MessageSquare,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Loader2,
} from 'lucide-react';
import { Course, Enrollment, Review } from '../../types/index';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LessonPlayer } from '../../components/course/LessonPlayer';
import { SEOHead } from '../../components/ui/SEOHead';
import { CourseCard } from '../../components/course/CourseCard';
import { Card } from '../../components/ui/Card';

interface CourseDetailPageProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export const CourseDetailPage: React.FC<CourseDetailPageProps> = ({ courseId, onNavigate }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | undefined>(undefined);
  const [relatedCourses, setRelatedCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  useEffect(() => {
    async function loadCourseAndEnrollment() {
      setIsLoading(true);
      try {
        const cData = await api.getCourseById(courseId);
        setCourse(cData);

        // Fetch related courses in same category
        const allCourses = await api.getCourses({ categoryId: cData.categoryId });
        setRelatedCourses(allCourses.filter((c) => c.id !== cData.id).slice(0, 3));

        if (user) {
          const myEnrollments = await api.getMyEnrollments();
          const match = myEnrollments.find((e) => e.courseId === cData.id);
          setEnrollment(match);
        }
      } catch (err) {
        console.error('Failed to load course details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourseAndEnrollment();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!user) {
      showToast('Authentication Required', 'Please sign in or create an account to enroll in courses.', 'info');
      onNavigate('/login');
      return;
    }

    setIsEnrolling(true);
    try {
      const enr = await api.enroll(course?.id || courseId);
      setEnrollment(enr);
      showToast('Enrollment Successful!', `You are now enrolled in ${course?.title}`, 'success');
    } catch (err: any) {
      showToast('Enrollment Failed', err.message || 'Could not process enrollment', 'error');
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleMarkLessonComplete = async (lessonId: string) => {
    if (!user || !course) return;

    setIsUpdatingProgress(true);
    try {
      const updatedEnr = await api.updateProgress(course.id, lessonId);
      setEnrollment(updatedEnr);
      showToast('Progress Saved', 'Lesson marked as complete!', 'success');
    } catch (err: any) {
      showToast('Error', 'Failed to update progress', 'error');
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  if (isLoading || !course) {
    return (
      <div className="py-20 text-center max-w-7xl mx-auto px-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl mb-4" />
          <div className="h-6 bg-slate-200 w-1/2 rounded mb-2" />
          <div className="h-4 bg-slate-200 w-1/3 rounded" />
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const totalLessons = course.sections?.reduce((acc, s) => acc + s.lessons.length, 0) || course.lessons?.length || 12;
  const levelVariant = course.level === 'BEGINNER' ? 'emerald' : course.level === 'INTERMEDIATE' ? 'amber' : 'rose';

  // Requirements & Learning outcomes default fallbacks
  const learningOutcomes = course.learningOutcomes || [
    'Gain comprehensive, actionable domain mastery through structured lessons.',
    'Apply practical frameworks, methodology, and real-world techniques.',
    'Complete hands-on assignments, reviews, and interactive assessments.',
    'Earn a verifiable certificate of completion to showcase on your profile.',
  ];

  const requirements = course.requirements || [
    'An open mindset and motivation to learn and apply new concepts.',
    'A computer, tablet, or smartphone with internet connectivity.',
  ];

  const faqs = [
    {
      q: 'Do I get lifetime access to this course?',
      a: 'Yes! Once you enroll, you enjoy unlimited lifetime access to all current and future video lessons and resources.',
    },
    {
      q: 'Will I receive a certificate of completion?',
      a: 'Absolutely. Upon reaching 100% course completion, EduNexus issues a verified digital certificate.',
    },
    {
      q: 'Can I ask questions if I get stuck?',
      a: 'Yes, enrolled students can participate in lesson discussions and reach out to instructors directly.',
    },
  ];

  const sampleReviews: Review[] = course.reviewsList || [
    {
      id: '1',
      userName: 'Alex Rivera',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      rating: 5,
      comment: 'Hands down the most comprehensive architecture course available. Clear explanations and real-world project structure.',
      createdAt: '2 weeks ago',
    },
    {
      id: '2',
      userName: 'David Miller',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      comment: 'The instructor explains advanced concepts with exceptional clarity. The video lessons and progress tracking work flawlessly.',
      createdAt: '1 month ago',
    },
  ];

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <SEOHead
        title={course.title}
        description={course.shortDescription}
        ogImage={course.thumbnailUrl}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 mb-8 border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="indigo">{course.categoryName || 'General Education'}</Badge>
              <Badge variant={levelVariant}>{course.level}</Badge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight mb-3">
              {course.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
              {course.shortDescription}
            </p>

            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{(course.rating || 4.8).toFixed(1)}</span>
                <span className="text-slate-400 font-normal">({course.reviewCount || 120} reviews)</span>
              </div>

              <button
                onClick={() => course.instructorId && onNavigate(`/instructors/${course.instructorId}`)}
                className="flex items-center gap-2 hover:text-indigo-300 transition-colors"
              >
                <img
                  src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={course.instructorName || 'Instructor'}
                  className="w-6 h-6 rounded-full object-cover border border-slate-700"
                />
                <span className="font-semibold text-slate-200">{course.instructorName || 'Instructor'}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span>{totalLessons} Lessons</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-indigo-400" />
                <span>Approx. 8.5 hours total</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action / Enrollment Banner */}
        {!isEnrolled && (
          <div className="bg-white p-6 rounded-2xl border border-indigo-200 shadow-sm mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Access Price</span>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-extrabold text-slate-900">
                  {course.price === 0 ? 'FREE' : `$${course.price.toFixed(2)}`}
                </div>
                {course.originalPrice && course.originalPrice > course.price && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ${course.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Includes full lifetime access, interactive video curriculum, and verifiable completion certificate.
              </p>
            </div>
            <Button size="lg" variant="default" disabled={isEnrolling} onClick={handleEnroll} className="w-full sm:w-auto font-bold px-8 gap-2">
              {isEnrolling && <Loader2 className="w-4 h-4 animate-spin" />}
              Enroll in Course Now
            </Button>
          </div>
        )}

        {/* Lesson Player Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-slate-900">Interactive Curriculum & Player</h2>
            {!isEnrolled && (
              <span className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" />
                Enrolled students get full video access
              </span>
            )}
          </div>
          <LessonPlayer
            course={course}
            enrollment={enrollment}
            onMarkLessonComplete={handleMarkLessonComplete}
            isUpdatingProgress={isUpdatingProgress}
          />
        </div>

        {/* Main Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Left Column: Learning Outcomes & Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Learning Outcomes */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                What You Will Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {learningOutcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Course Overview</h3>
              <div className="text-xs text-slate-600 leading-relaxed whitespace-pre-line space-y-3">
                <p>{course.description}</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-3">Requirements & Prerequisites</h3>
              <ul className="list-disc list-inside space-y-2 text-xs text-slate-600">
                {requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>

            {/* Reviews */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Student Reviews
                </h3>
                <div className="flex items-center gap-1 text-sm font-bold text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span>{(course.rating || 4.8).toFixed(1)} out of 5</span>
                </div>
              </div>

              <div className="space-y-4">
                {sampleReviews.map((rev) => (
                  <div key={rev.id} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={rev.userName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span className="font-bold text-xs text-slate-900">{rev.userName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{rev.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 mb-2">
                      {Array.from({ length: rev.rating }).map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                Frequently Asked Questions
              </h3>
              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaqIndex === idx;
                  return (
                    <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                        className="w-full text-left p-4 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-center justify-between text-xs font-bold text-slate-900"
                      >
                        <span>{faq.q}</span>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </button>
                      {isOpen && (
                        <div className="p-4 text-xs text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Instructor Profile Card & Course Highlights */}
          <div className="space-y-6">
            <Card className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Course Instructor</h4>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={course.instructorName || 'Instructor'}
                  className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100"
                />
                <div>
                  <h5 className="font-bold text-slate-900 text-sm">{course.instructorName || 'Instructor'}</h5>
                  <p className="text-xs text-indigo-600 font-medium">{course.instructorHeadline || 'Lead Course Instructor'}</p>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {course.instructorBio || 'Dedicated educator passionate about teaching and mentoring learners worldwide.'}
              </p>

              {course.instructorId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold"
                  onClick={() => onNavigate(`/instructors/${course.instructorId}`)}
                >
                  View Instructor Profile
                </Button>
              )}
            </Card>

            <Card className="p-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Course Highlights</h4>
              <ul className="space-y-3 text-xs text-slate-700 font-medium">
                <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Total Lessons:</span>
                  <span className="font-bold text-slate-900">{totalLessons}</span>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Difficulty Level:</span>
                  <Badge variant={levelVariant}>{course.level}</Badge>
                </li>
                <li className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-500">Access:</span>
                  <span className="font-bold text-slate-900">Lifetime</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-500">Certificate:</span>
                  <span className="font-bold text-emerald-600">Included</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Related Courses */}
        {relatedCourses.length > 0 && (
          <div className="pt-10 border-t border-slate-200">
            <h3 className="text-xl font-extrabold text-slate-900 mb-6">Related Courses in This Category</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCourses.map((rc) => (
                <CourseCard key={rc.id} course={rc} onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
