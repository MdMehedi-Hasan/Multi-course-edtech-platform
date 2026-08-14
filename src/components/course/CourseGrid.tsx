import React from 'react';
import { Course } from '../../types/index';
import { CourseCard } from './CourseCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

interface CourseGridProps {
  courses: Course[];
  isLoading?: boolean;
  onSelectCourse: (course: Course) => void;
}

export const CourseGrid: React.FC<CourseGridProps> = ({ courses, isLoading = false, onSelectCourse }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
            <Skeleton className="aspect-video w-full rounded-xl" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <EmptyState
        title="No courses found"
        description="We couldn't find any courses matching your search criteria or category filter."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} onSelect={onSelectCourse} />
      ))}
    </div>
  );
};
