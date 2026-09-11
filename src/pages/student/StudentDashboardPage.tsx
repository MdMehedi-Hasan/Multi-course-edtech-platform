import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  Award,
  Clock,
  ArrowRight,
  Play,
  TrendingUp,
  Sparkles,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface StudentDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState<any>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const res = await api.getStudentDashboard();
        setData(res);
      } catch (err) {
        console.error('Failed to load dashboard:', err);
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
    completedCoursesCount = 0,
    overallProgress = 0,
    continueLearning,
    recentlyAccessed = [],
    enrolledCourses = [],
    certificates = [],
    recommendedCourses = [],
  } = data || {};

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-md border border-emerald-800">
            <Sparkles className="w-3.5 h-3.5" /> Student Learning Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">Welcome back, {user?.name}!</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            You have completed <strong className="text-white">{completedCoursesCount}</strong> courses so far.
            Keep up the streak and advance your engineering skillset!
          </p>
        </div>

        <div className="relative z-10 flex gap-3 shrink-0">
          <Button variant="default" onClick={() => onNavigate('/courses')} className="gap-2">
            <BookOpen className="w-4 h-4" />
            Explore Catalog
          </Button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Courses</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{totalCourses}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">In Progress</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{totalCourses - completedCoursesCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{completedCoursesCount}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-50 text-cyan-600 rounded-2xl">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Overall Completion</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{overallProgress}%</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Continue Learning Spotlight */}
      {continueLearning && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" /> Continue Learning
            </h2>
          </div>
          <Card className="p-6 border-indigo-200 bg-gradient-to-r from-indigo-50/50 via-white to-slate-50 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded">
                    Active Course
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Instructor: {continueLearning.instructorName}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{continueLearning.courseTitle}</h3>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <span className="font-semibold text-indigo-600">Next Lesson:</span>
                  <span className="truncate">{continueLearning.nextLessonTitle}</span>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-xs font-semibold text-slate-700">
                    <span>Progress</span>
                    <span>{continueLearning.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${continueLearning.progress}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="shrink-0 flex items-center">
                <Button
                  variant="default"
                  size="lg"
                  onClick={() =>
                    continueLearning.nextLessonId
                      ? onNavigate(`/student/learn/${continueLearning.courseId}/${continueLearning.nextLessonId}`)
                      : onNavigate(`/student/courses/${continueLearning.courseId}`)
                  }
                  className="gap-2.5 shadow-lg shadow-indigo-200 w-full lg:w-auto"
                >
                  <Play className="w-5 h-5 fill-white" />
                  <span>Resume Lesson</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Enrolled Courses & Recently Accessed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Enrolled Courses</h2>
            <button
              onClick={() => onNavigate('/student/courses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {enrolledCourses.length === 0 ? (
            <Card className="p-8 text-center border-dashed border-slate-300">
              <p className="text-xs text-slate-500 mb-4">You are not enrolled in any courses yet.</p>
              <Button variant="default" size="sm" onClick={() => onNavigate('/courses')}>
                Browse Courses
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {enrolledCourses.slice(0, 4).map((enr: any) => (
                <Card key={enr.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {enr.level}
                      </span>
                      <span className="text-xs font-bold text-indigo-600">{enr.progress}%</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{enr.title}</h4>
                    <p className="text-xs text-slate-500 mb-4">By {enr.instructorName}</p>

                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-4">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${enr.progress}%` }} />
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onNavigate(`/student/courses/${enr.courseId}`)}
                    className="w-full text-xs"
                  >
                    View Details & Lessons
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Certificates & Achievements Sidebar */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" /> Earned Certificates
          </h2>

          {certificates.length === 0 ? (
            <Card className="p-6 text-center border-slate-200">
              <GraduationCap className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500">
                Complete 100% of any enrolled course to earn a verified completion certificate.
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert: any) => (
                <Card
                  key={cert.id}
                  className="p-4 border-amber-200 bg-amber-50/30 hover:bg-amber-50/70 transition-colors cursor-pointer"
                  onClick={() => setSelectedCert(cert)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-amber-100 text-amber-700 rounded-xl shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                        {cert.id}
                      </p>
                      <h4 className="text-xs font-bold text-slate-900 truncate">{cert.courseTitle}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Issued: {new Date(cert.completedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended Courses Section */}
      {recommendedCourses.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recommended Next Steps</h2>
            <button
              onClick={() => onNavigate('/courses')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Browse Catalog <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {recommendedCourses.map((rc: any) => (
              <Card key={rc.id} className="p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {rc.categoryName}
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm mt-2 mb-1">{rc.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">{rc.shortDescription}</p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="font-extrabold text-slate-900 text-sm">${rc.price}</span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onNavigate(`/courses/${rc.slug}`)}
                    className="text-xs"
                  >
                    View Course
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Certificate Preview Modal */}
      {selectedCert && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 border border-slate-200 shadow-2xl relative">
            <div className="border-4 border-amber-400 p-8 rounded-2xl text-center bg-gradient-to-b from-amber-50/50 to-white relative">
              <span className="text-xs font-bold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                Certificate of Completion
              </span>
              <p className="text-xs text-slate-400 mt-4 uppercase tracking-wider">This is to certify that</p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">{selectedCert.studentName}</h2>
              <p className="text-xs text-slate-500 mt-2">has successfully completed the comprehensive course</p>
              <h3 className="text-lg font-bold text-indigo-900 mt-2">{selectedCert.courseTitle}</h3>
              <p className="text-xs text-slate-400 mt-4">Instructor: {selectedCert.instructorName}</p>
              <div className="mt-6 pt-4 border-t border-amber-200/80 flex items-center justify-between text-xs text-slate-500">
                <span>Certificate ID: {selectedCert.id}</span>
                <span>Date: {new Date(selectedCert.completedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" size="sm" onClick={() => setSelectedCert(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
