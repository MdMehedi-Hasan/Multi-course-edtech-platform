import React, { useEffect, useState } from 'react';
import { GraduationCap, Search, Eye, CheckCircle2, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminUsers({ role: 'STUDENT', search: searchQuery || undefined });
      setStudents(data);
    } catch (err) {
      console.error('Failed to load students roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  const inspectStudent = async (id: string) => {
    try {
      const detail = await api.getAdminUserDetail(id);
      setSelectedStudent(detail);
    } catch (err) {
      console.error('Failed to inspect student:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Roster Directory</h1>
        <p className="text-xs text-slate-500 mt-1">Directory of enrolled learners across all courses.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search student by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
          <Button type="submit" variant="primary" size="sm">Search</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Student</th>
                <th className="px-4 py-3.5">Email</th>
                <th className="px-4 py-3.5">Total Enrollments</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Joined</th>
                <th className="px-5 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">Loading student directory...</td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">No students found matching query.</td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs shrink-0">
                        {st.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span>{st.name}</span>
                    </td>
                    <td className="px-4 py-4 text-slate-500">{st.email}</td>
                    <td className="px-4 py-4 font-bold text-purple-700">{st.enrollmentCount} Enrollments</td>
                    <td className="px-4 py-4">
                      {st.isSuspended ? (
                        <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">Suspended</span>
                      ) : (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Active</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-400">{new Date(st.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-right">
                      <Button variant="ghost" size="sm" onClick={() => inspectStudent(st.id)}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Selected Student Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(null)}>Close</Button>
            </div>

            <div>
              <h4 className="font-bold text-slate-800 text-xs uppercase mb-2">Enrolled Courses ({selectedStudent.enrollments?.length || 0})</h4>
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {selectedStudent.enrollments?.map((e: any) => (
                  <div key={e.id} className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">{e.course?.title}</span>
                    <span className="text-purple-700 font-extrabold">{e.progress}% Complete</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
