import React, { useEffect, useState } from 'react';
import { Users, Search, BookOpen, CheckCircle2, Mail } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

interface InstructorStudentsPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorStudentsPage: React.FC<InstructorStudentsPageProps> = ({ onNavigate }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [studentList, courseList] = await Promise.all([
          api.getInstructorStudents(),
          api.getInstructorCourses(),
        ]);
        setStudents(studentList);
        setCourses(courseList);
      } catch (err) {
        console.error('Failed to load instructor students:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredStudents = students.filter((s) => {
    if (selectedCourseId !== 'ALL' && s.courseId !== selectedCourseId) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        s.studentName?.toLowerCase().includes(q) ||
        s.studentEmail?.toLowerCase().includes(q) ||
        s.courseTitle?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500/40"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100">Enrolled Student Directory</h1>
        <p className="text-xs text-slate-400 mt-1">
          Monitor active students across your published curriculums and track individual progress.
        </p>
      </div>

      {/* Filters and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-bold text-slate-400 uppercase shrink-0">Filter by Course:</label>
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="bg-slate-900/60 text-slate-100 p-2 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-indigo-500/40 font-bold w-full sm:w-64"
          >
            <option className="bg-slate-900 text-slate-100" value="ALL">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option className="bg-slate-900 text-slate-100" key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/60 text-slate-100 pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700/50 focus:outline-none focus:border-indigo-500/40"
          />
        </div>
      </div>

      {/* Student List Table */}
      <Card className="border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 border-b border-slate-700/50 text-slate-400 uppercase tracking-wider font-bold">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Enrolled Course</th>
                <th className="p-4">Enrollment Date</th>
                <th className="p-4">Progress</th>
                <th className="p-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No active student enrollments found matching your query.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-700/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            s.studentAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
                          }
                          alt={s.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-700/50"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{s.studentName}</p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {s.studentEmail}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 font-bold text-slate-200 max-w-xs truncate">{s.courseTitle}</td>

                    <td className="p-4 text-slate-400">
                      {new Date(s.enrolledAt).toLocaleDateString()}
                    </td>

                    <td className="p-4 w-48">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-400">{s.progress}% Completed</span>
                        </div>
                        <div className="w-full bg-slate-700/60 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              s.progress >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                            }`}
                            style={{ width: `${s.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-right">
                      {s.progress >= 100 ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                          Completed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/30 px-2 py-0.5 rounded">
                          In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
