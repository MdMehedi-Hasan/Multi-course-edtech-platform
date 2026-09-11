import React, { useEffect, useState } from 'react';
import { Play, CheckCircle, Lock, BookOpen, Clock, ArrowLeft, ShieldAlert } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StudentCourseDetailPageProps {
  courseId: string;
  onNavigate: (path: string) => void;
}

export const StudentCourseDetailPage: React.FC<StudentCourseDetailPageProps> = ({
  courseId,
  onNavigate,
}) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadCourseDetail() {
      try {
        setIsLoading(true);
        setErrorMsg(null);
        const res = await api.getStudentCourseDetail(courseId);
        setData(res);
      } catch (err: any) {
        console.error('Failed to load student course detail:', err);
        setErrorMsg(err.message || 'You are not enrolled in this course.');
      } finally {
        setIsLoading(false);
      }
    }
    if (courseId) {
      loadCourseDetail();
    }
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <Card className="p-8 border-rose-200 bg-rose-50/50 text-center space-y-4">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900">Course Access Restricted</h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMsg}</p>
          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" size="sm" onClick={() => onNavigate('/student/courses')}>
              Back to My Courses
            </Button>
            <Button variant="default" size="sm" onClick={() => onNavigate(`/courses/${courseId}`)}>
              View Course Landing Page
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const { course, enrollment, sections = [] } = data || {};

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div>
        <button
          onClick={() => onNavigate('/student/courses')}
          className="text-xs font-bold text-slate-500 hover:text-indigo-600 flex items-center gap-1.5 mb-4"
        >
          <ArrowLeft className="w-4 h-4" /> Back to My Courses
        </button>

        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Enrolled Course
            </span>
            <span className="text-xs text-slate-400 font-semibold">{course?.categoryName}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{course?.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{course?.shortDescription}</p>

          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800">
            <span>Instructor: <strong className="text-white">{course?.instructorName}</strong></span>
            <span>Level: <strong className="text-white">{course?.level}</strong></span>
            <span>Progress: <strong className="text-emerald-400">{enrollment?.progress}%</strong></span>
          </div>
        </div>
      </div>

      {/* Course Progress Bar */}
      <Card className="p-6 border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Course Completion</span>
          <span className="text-sm font-extrabold text-indigo-600">{enrollment?.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${enrollment?.progress}%` }}
          />
        </div>
      </Card>

      {/* Curriculum Outline */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" /> Course Curriculum & Lessons
        </h2>

        <div className="space-y-4">
          {sections.map((section: any, idx: number) => (
            <Card key={section.id} className="p-6 border-slate-200 space-y-3">
              <h3 className="font-extrabold text-slate-900 text-sm">
                Section {idx + 1}: {section.title}
              </h3>

              <div className="divide-y divide-slate-100">
                {section.lessons.map((lesson: any) => (
                  <div
                    key={lesson.id}
                    className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-3 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {lesson.isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      ) : (
                        <Play className="w-5 h-5 text-indigo-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{lesson.title}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" /> {lesson.durationMinutes} min
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={lesson.isCompleted ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => onNavigate(`/student/learn/${courseId}/${lesson.id}`)}
                      className="text-xs shrink-0 gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{lesson.isCompleted ? 'Replay' : 'Start Lesson'}</span>
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
