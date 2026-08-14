import React from 'react';
import { Star, Users, BookOpen, Clock } from 'lucide-react';
import { Course } from '../../types/index';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';

interface CourseCardProps {
  course: Course;
  onSelect: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onSelect }) => {
  const levelVariant =
    course.level === 'BEGINNER' ? 'emerald' : course.level === 'INTERMEDIATE' ? 'amber' : 'rose';

  const lessonCount = course.lessons?.length || 16;
  const originalPrice = course.originalPrice || (course.price > 0 ? course.price * 1.5 : undefined);
  const discountPercent = originalPrice ? Math.round(((originalPrice - course.price) / originalPrice) * 100) : 0;

  return (
    <Card hoverable className="flex flex-col h-full group cursor-pointer" onClick={() => onSelect(course)}>
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnailUrl || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {course.categoryName && <Badge variant="slate">{course.categoryName}</Badge>}
          <Badge variant={levelVariant}>{course.level}</Badge>
        </div>
        {discountPercent > 0 && (
          <div className="absolute top-3 right-3 bg-rose-600 text-white font-extrabold text-[10px] uppercase px-2 py-0.5 rounded-md shadow-xs">
            {discountPercent}% OFF
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-5">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
          <div className="flex items-center gap-1 text-amber-500 font-bold">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{course.rating ? course.rating.toFixed(1) : '4.8'}</span>
            <span className="text-slate-400 font-normal">({course.reviewCount || 120})</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              {course.studentCount?.toLocaleString() || '1,240'}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              {lessonCount} lessons
            </span>
          </div>
        </div>

        <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
          {course.title}
        </h3>

        <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">{course.shortDescription}</p>

        {/* Instructor & Pricing */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={course.instructorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={course.instructorName || 'Instructor'}
              className="w-6 h-6 rounded-full object-cover border border-slate-200"
            />
            <span className="text-xs font-semibold text-slate-700 truncate max-w-[110px]">
              {course.instructorName || 'Instructor'}
            </span>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1.5">
              {originalPrice && originalPrice > course.price && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
              <span className="text-slate-900 font-extrabold text-base">
                {course.price === 0 ? 'FREE' : `$${course.price.toFixed(2)}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
