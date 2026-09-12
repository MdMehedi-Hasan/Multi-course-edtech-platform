import React, { useEffect, useState } from 'react';
import { Star, GraduationCap, BookOpen, Mail, Award, ArrowLeft, BadgeCheck } from 'lucide-react';
import { InstructorDetail } from '../../types/index';
import { api } from '../../lib/api';
import { CourseCard } from '../../components/course/CourseCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { SEOHead } from '../../components/ui/SEOHead';

interface InstructorProfilePageProps {
  instructorId: string;
  onNavigate: (path: string) => void;
}

export const InstructorProfilePage: React.FC<InstructorProfilePageProps> = ({ instructorId, onNavigate }) => {
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadInstructor() {
      setIsLoading(true);
      try {
        const data = await api.getInstructorById(instructorId);
        setInstructor(data);
      } catch (err) {
        console.error('Failed to load instructor details:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadInstructor();
  }, [instructorId]);

  if (isLoading || !instructor) {
    return (
      <div className="py-10 bg-slate-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <Skeleton className="h-8 w-40" />
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 flex flex-col sm:flex-row items-start gap-6">
            <Skeleton className="w-28 h-28 rounded-full shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-72 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <SEOHead
        title={`${instructor.name} - Instructor Profile`}
        description={`${instructor.name} is a ${instructor.headline} teaching courses on EduNexus.`}
        ogImage={instructor.avatarUrl}
      />

      <main className="flex-1 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => onNavigate('/instructors')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Instructors</span>
          </button>

          {/* Profile Header */}
          <div className="relative overflow-hidden bg-white rounded-3xl p-8 sm:p-10 border border-slate-200/80 shadow-sm mb-10">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-indigo-100/60 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 w-56 h-56 rounded-full bg-violet-100/50 blur-3xl" />
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center gap-6 sm:gap-8">
              <img
                src={instructor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
                alt={instructor.name}
                className="w-28 h-28 rounded-2xl object-cover border-4 border-white ring-2 ring-indigo-200 shadow-lg shrink-0"
              />

              <div className="flex-1 w-full">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
                      {instructor.name}
                      <BadgeCheck className="w-6 h-6 text-indigo-600" />
                    </h1>
                    <span className="inline-block text-[11px] font-semibold bg-indigo-50 text-indigo-700 rounded-full px-2.5 py-0.5 mt-1.5">
                      {instructor.headline}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-white/70 border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{instructor.email}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mt-4 max-w-3xl">{instructor.bio}</p>

                {/* Instructor Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 mt-6 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                      <Star className="w-4.5 h-4.5 fill-amber-400" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{instructor.rating}</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Rating</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                      <GraduationCap className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">
                        {instructor.studentCount.toLocaleString()}
                      </div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Students</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="w-9 h-9 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                      <BookOpen className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <div className="text-sm font-extrabold text-slate-900">{instructor.courseCount}</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Courses</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructor's Courses */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25">
                <Award className="w-5 h-5" />
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                Courses Taught by {instructor.name}
              </h2>
            </div>
            {instructor.courses.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center text-xs text-slate-500">
                No active public courses currently published by this instructor.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {instructor.courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onSelect={(c) => onNavigate(`/courses/${c.slug || c.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};