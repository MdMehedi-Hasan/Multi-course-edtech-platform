import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  PlusCircle,
  Users,
  DollarSign,
  Star,
  CheckCircle2,
  FileEdit,
  TrendingUp,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface InstructorDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorDashboardPage: React.FC<InstructorDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getInstructorDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load instructor dashboard:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const {
    totalCourses = 0,
    publishedCourses = 0,
    draftCourses = 0,
    totalStudents = 0,
    totalRevenue = 0,
    averageRating = 4.9,
    recentEnrollments = [],
    coursePerformance = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Header Studio Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2.5 py-1 rounded-md border border-amber-800/60">
            Instructor Studio
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Welcome back, {user?.name || 'Instructor'}!
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Monitor student enrollments, course revenue, student feedback ratings, and build new curriculums.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => onNavigate('/instructor/courses/create')}
          className="gap-2 shrink-0 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold border-none"
        >
          <PlusCircle className="w-4.5 h-4.5" />
          <span>Create New Course</span>
        </Button>
      </div>

      {/* Metrics Row (6 key cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
              <h3 className="text-xl font-black text-slate-900">{totalCourses}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Published</p>
              <h3 className="text-xl font-black text-slate-900">{publishedCourses}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Drafts</p>
              <h3 className="text-xl font-black text-slate-900">{draftCourses}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-50 text-cyan-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-xl font-black text-slate-900">{totalStudents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</p>
              <h3 className="text-xl font-black text-slate-900">${totalRevenue.toFixed(2)}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 text-amber-500 rounded-xl">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Rating</p>
              <h3 className="text-xl font-black text-slate-900">{averageRating}</h3>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Performance Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" /> Course Performance & Revenue
            </h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('/instructor/courses')}
              className="text-xs"
            >
              Manage Courses
            </Button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4">Course Title</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Students</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Total Revenue</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {coursePerformance.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No authored courses found. Click "Create New Course" to build your first curriculum.
                    </td>
                  </tr>
                ) : (
                  coursePerformance.map((cp: any) => (
                    <tr key={cp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-bold text-slate-900 line-clamp-1 max-w-xs">{cp.title}</td>
                      <td className="p-4">
                        {cp.isPublished ? (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                            Published
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                            Draft
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold text-slate-800">{cp.studentCount}</td>
                      <td className="p-4 text-slate-600">${cp.price.toFixed(2)}</td>
                      <td className="p-4 font-black text-slate-900">${cp.revenue.toFixed(2)}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onNavigate(`/instructor/courses/${cp.id}/edit`)}
                          className="text-xs"
                        >
                          Edit Course
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Student Enrollments */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Enrollments</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/instructor/students')}
              className="text-xs text-indigo-600 hover:text-indigo-800"
            >
              View All
            </Button>
          </div>

          <Card className="p-4 border-slate-200 space-y-3 divide-y divide-slate-100">
            {recentEnrollments.length === 0 ? (
              <p className="p-4 text-center text-xs text-slate-500">No student enrollments logged yet.</p>
            ) : (
              recentEnrollments.map((e: any) => (
                <div key={e.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate">{e.studentName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{e.courseTitle}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {new Date(e.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded shrink-0">
                    +${e.coursePrice}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
