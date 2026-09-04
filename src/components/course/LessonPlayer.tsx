import React, { useState } from 'react';
import { Play, CheckCircle2, Circle, Lock, Award, BookOpen, Clock } from 'lucide-react';
import { Course, Lesson, Enrollment } from '../../types/index';
import { Button } from '../ui/Button';

interface LessonPlayerProps {
  course: Course;
  enrollment?: Enrollment;
  onMarkLessonComplete: (lessonId: string) => void;
  isUpdatingProgress?: boolean;
}

export const LessonPlayer: React.FC<LessonPlayerProps> = ({
  course,
  enrollment,
  onMarkLessonComplete,
  isUpdatingProgress = false,
}) => {
  const lessons = course.lessons || course.sections?.flatMap((section) => section.lessons) || [];
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const activeLesson = lessons[activeLessonIndex] || lessons[0];
  const isEnrolled = !!enrollment;

  const getYoutubeEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/[?&]v=([^&]+)/) || url.match(/youtu\.be\/([^?&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const isCompleted = (lessonId: string) => {
    return enrollment?.completedLessonIds.includes(lessonId) || false;
  };

  const handleNext = () => {
    if (activeLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(activeLessonIndex + 1);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video Player & Info Column */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-xl border border-slate-800">
          {activeLesson && getYoutubeEmbedUrl(activeLesson.externalUrl) ? (
            <iframe
              title={activeLesson.title}
              className="w-full h-full"
              src={getYoutubeEmbedUrl(activeLesson.externalUrl) || undefined}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : activeLesson ? (
            <video
              key={activeLesson.id}
              controls
              autoPlay={false}
              className="w-full h-full object-cover"
              src={activeLesson.videoUrl}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500">No video selected</div>
          )}
        </div>

        {/* Lesson Control Header */}
        {activeLesson && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Lesson {activeLessonIndex + 1} of {lessons.length}
              </span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">{activeLesson.title}</h2>
              <p className="text-xs text-slate-500 mt-1">{activeLesson.description}</p>
            </div>

            {isEnrolled && (
              <Button
                variant={isCompleted(activeLesson.id) ? 'outline' : 'primary'}
                size="sm"
                isLoading={isUpdatingProgress}
                onClick={() => onMarkLessonComplete(activeLesson.id)}
                className="shrink-0 gap-2"
              >
                <CheckCircle2 className={`w-4 h-4 ${isCompleted(activeLesson.id) ? 'text-emerald-600' : ''}`} />
                {isCompleted(activeLesson.id) ? 'Completed' : 'Mark as Complete'}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lesson List Sidebar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col h-full">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Course Curriculum</h3>
            <p className="text-xs text-slate-500">{lessons.length} Lessons</p>
          </div>
          {isEnrolled && enrollment && (
            <div className="text-right">
              <span className="text-xs font-bold text-indigo-600">{enrollment.progress}%</span>
              <div className="w-20 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${enrollment.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-2 overflow-y-auto max-h-[450px] pr-1">
          {lessons.map((lesson, idx) => {
            const isActive = idx === activeLessonIndex;
            const completed = isCompleted(lesson.id);
            const canPlay = isEnrolled || lesson.isFreePreview;

            return (
              <button
                key={lesson.id}
                onClick={() => canPlay && setActiveLessonIndex(idx)}
                disabled={!canPlay}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-start gap-3 border ${
                  isActive
                    ? 'bg-indigo-50 border-indigo-200 text-indigo-900 font-medium shadow-xs'
                    : canPlay
                    ? 'bg-white hover:bg-slate-50 border-slate-100 text-slate-700'
                    : 'bg-slate-50/60 border-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                  ) : canPlay ? (
                    <Circle className="w-4 h-4 text-slate-300" />
                  ) : (
                    <Lock className="w-4 h-4 text-slate-300" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate leading-snug">{lesson.title}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.round(lesson.duration / 60)} mins
                    </span>
                    {lesson.isFreePreview && !isEnrolled && (
                      <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                        Free Preview
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
