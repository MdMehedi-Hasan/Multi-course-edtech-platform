import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, CheckCircle2, Award, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';

interface StudentProgressPageProps {
  onNavigate: (path: string) => void;
}

export const StudentProgressPage: React.FC<StudentProgressPageProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadProgress() {
      try {
        const res = await api.getStudentProgressSummary();
        setData(res);
      } catch (err) {
        console.error('Failed to load student progress:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProgress();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2 pb-6 border-b border-slate-700/50">
          <Skeleton className="h-7 w-64 rounded-lg" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-6 w-56 rounded-lg" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const {
    totalEnrollments = 0,
    completedCoursesCount = 0,
    completedLessonsCount = 0,
    totalWatchedHours = 0,
    coursesProgress = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100">
          Learning Progress & Analytics
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Detailed overview of your study hours, lesson achievements, and certificates.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Hours Watched
              </p>
              <h3 className="text-2xl font-extrabold text-slate-100">
                {totalWatchedHours} hrs
              </h3>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Lessons Finished
              </p>
              <h3 className="text-2xl font-extrabold text-slate-100">{completedLessonsCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Completed Courses
              </p>
              <h3 className="text-2xl font-extrabold text-slate-100">{completedCoursesCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Total Enrolled
              </p>
              <h3 className="text-2xl font-extrabold text-slate-100">{totalEnrollments}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Course Progress Detailed Table */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100">Course Progress Breakdown</h2>

        {coursesProgress.length === 0 ? (
          <Card className="p-8 text-center text-xs text-slate-400">
            No active course progress tracked yet. Enroll in a course to begin tracking.
          </Card>
        ) : (
          <div className="bg-slate-800 rounded-2xl border border-slate-700/50 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/60 border-b border-slate-700/50 text-slate-400 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Level</th>
                  <th className="p-4">Progress</th>
                  <th className="p-4">Enrolled Date</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {coursesProgress.map((cp: any) => (
                  <tr key={cp.courseId} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-bold text-slate-100">{cp.title}</td>
                    <td className="p-4">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-700/60 px-2 py-0.5 rounded">
                        {cp.level}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[10px] font-bold mb-1">
                          <span className="text-slate-400">{cp.progress}%</span>
                          {cp.progress >= 100 && (
                            <span className="text-emerald-400">Done</span>
                          )}
                        </div>
                        <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cp.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${cp.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(cp.enrolledAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onNavigate(`/student/courses/${cp.courseId}`)}
                        className="text-xs"
                      >
                        View Course
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
