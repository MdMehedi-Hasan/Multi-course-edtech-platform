import React, { useEffect, useState } from 'react';
import { Star, GraduationCap, BookOpen, Mail, Award, ArrowLeft } from 'lucide-react';
import { InstructorDetail } from '../../types/index';
import { api } from '../../lib/api';
import { CourseCard } from '../../components/course/CourseCard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
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
      <div className="py-20 text-center max-w-7xl mx-auto px-4">
        <div className="bg-white p-12 rounded-3xl border border-slate-200 animate-pulse flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full mb-4" />
          <div className="h-6 bg-slate-200 w-1/3 rounded mb-2" />
          <div className="h-4 bg-slate-200 w-1/4 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 bg-slate-50 min-h-screen">
      <SEOHead
        title={`${instructor.name} - Instructor Profile`}
        description={`${instructor.name} is a ${instructor.headline} teaching courses on EduNexus.`}
        ogImage={instructor.avatarUrl}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => onNavigate('/instructors')}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Instructors</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <img
              src={instructor.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300'}
              alt={instructor.name}
              className="w-28 h-28 rounded-full object-cover border-4 border-indigo-50 shadow-md shrink-0"
            />

            <div className="flex-1">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{instructor.name}</h1>
                  <p className="text-sm font-semibold text-indigo-600 mt-0.5">{instructor.headline}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{instructor.email}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed mt-4 max-w-3xl">{instructor.bio}</p>

              {/* Instructor Stats */}
              <div className="flex flex-wrap items-center gap-6 pt-6 mt-6 border-t border-slate-100 text-xs font-bold">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="text-slate-900">{instructor.rating} Rating</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>{instructor.studentCount.toLocaleString()} Total Students</span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>{instructor.courseCount} Published Courses</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor's Courses */}
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-6">Courses Taught by {instructor.name}</h2>
          {instructor.courses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
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
    </div>
  );
};
