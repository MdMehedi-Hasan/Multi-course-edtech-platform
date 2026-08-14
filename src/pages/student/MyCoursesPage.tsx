import React, { useEffect, useState } from 'react';
import { BookOpen, Play, CheckCircle2, Search, Filter, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface MyCoursesPageProps {
  onNavigate: (path: string) => void;
}

export const MyCoursesPage: React.FC<MyCoursesPageProps> = ({ onNavigate }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');

  useEffect(() => {
    async function loadEnrolledCourses() {
      try {
        const res = await api.getStudentCourses();
        setCourses(res);
      } catch (err) {
        console.error('Failed to load student courses:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEnrolledCourses();
  }, []);

  const filteredCourses = courses.filter((item) => {
    const matchesSearch = item.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterStatus === 'COMPLETED') return matchesSearch && item.progress >= 100;
    if (filterStatus === 'IN_PROGRESS') return matchesSearch && item.progress < 100;
    return matchesSearch;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900">My Enrolled Courses</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your course enrollments and track your completion progress.</p>
        </div>

        <Button variant="primary" size="md" onClick={() => onNavigate('/courses')} className="gap-2 shrink-0">
          <BookOpen className="w-4 h-4" />
          Find More Courses
        </Button>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search my courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              filterStatus === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({courses.length})
          </button>
          <button
            onClick={() => setFilterStatus('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              filterStatus === 'IN_PROGRESS'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            In Progress ({courses.filter((c) => c.progress < 100).length})
          </button>
          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors shrink-0 ${
              filterStatus === 'COMPLETED'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Completed ({courses.filter((c) => c.progress >= 100).length})
          </button>
        </div>
      </div>

      {/* Course List Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No courses match your filter</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or explore the course catalog to enroll in new skills.
          </p>
          <Button variant="primary" size="sm" onClick={() => onNavigate('/courses')} className="mt-4">
            Explore Course Catalog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((c) => {
            const isCompleted = c.progress >= 100;
            return (
              <Card key={c.id} className="p-6 flex flex-col justify-between border-slate-200 hover:border-slate-300 transition-all">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded">
                      {c.level}
                    </span>
                    {isCompleted ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : (
                      <span className="text-xs font-extrabold text-indigo-600">{c.progress}% Done</span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 line-clamp-1">{c.courseTitle}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Instructor: {c.instructorName}</p>
                  </div>

                  {c.lastAccessedLesson && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Accessed Lesson</p>
                      <p className="font-semibold text-slate-800 truncate mt-0.5">{c.lastAccessedLesson.title}</p>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                      <span>{c.completedLessonsCount} / {c.totalLessonsCount} Lessons Completed</span>
                      <span>{c.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isCompleted ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${c.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-3">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() =>
                      c.lastAccessedLesson
                        ? onNavigate(`/student/learn/${c.courseId}/${c.lastAccessedLesson.id}`)
                        : onNavigate(`/student/courses/${c.courseId}`)
                    }
                    className="flex-1 gap-2 text-xs"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>{isCompleted ? 'Review Course' : 'Continue Learning'}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`/student/courses/${c.courseId}`)}
                    className="text-xs"
                  >
                    Details
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
