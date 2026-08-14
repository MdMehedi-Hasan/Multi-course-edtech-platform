import React, { useEffect, useState } from 'react';
import { CreditCard, Search, BookOpen, Clock, CheckCircle2 } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminEnrollmentsPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminEnrollments();
      setEnrollments(data);
    } catch (err) {
      console.error('Failed to fetch enrollments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter(
    (e) =>
      e.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Global Enrollment Ledger</h1>
        <p className="text-xs text-slate-500 mt-1">Audit student registrations, track progress across all courses, and inspect completion status.</p>
      </div>

      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search enrollment by student name, email or course title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-purple-600"
          />
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Student Learner</th>
                <th className="px-4 py-3.5">Course Enrolled</th>
                <th className="px-4 py-3.5">Instructor</th>
                <th className="px-4 py-3.5">Learning Progress</th>
                <th className="px-4 py-3.5">Registration Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">Loading enrollment records...</td>
                </tr>
              ) : filteredEnrollments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">No enrollment records found.</td>
                </tr>
              ) : (
                filteredEnrollments.map((enr) => (
                  <tr key={enr.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{enr.studentName}</p>
                      <p className="text-[11px] text-slate-400">{enr.studentEmail}</p>
                    </td>

                    <td className="px-4 py-4">
                      <p className="font-bold text-purple-700 line-clamp-1">{enr.courseTitle}</p>
                      <span className="text-[10px] text-slate-400 font-bold">${enr.price} Paid</span>
                    </td>

                    <td className="px-4 py-4 font-medium text-slate-800">
                      {enr.instructorName}
                    </td>

                    <td className="px-4 py-4 w-48">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                          <div
                            className="bg-purple-600 h-full transition-all"
                            style={{ width: `${enr.progress}%` }}
                          />
                        </div>
                        <span className="font-extrabold text-slate-800 text-[11px]">{enr.progress}%</span>
                      </div>
                      {enr.completedAt && (
                        <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed {new Date(enr.completedAt).toLocaleDateString()}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-400 text-[11px]">
                      {new Date(enr.enrolledAt).toLocaleDateString()}
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
