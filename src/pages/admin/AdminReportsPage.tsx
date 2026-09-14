import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, Award, BookOpen } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminReports();
      setReports(data);
    } catch (err) {
      console.error('Failed to load platform reports:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-purple-500/40 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Platform Analytics & Financial Reports</h1>
        <p className="text-xs text-slate-400 mt-1">Marketplace revenue distribution, top performing course curricula, and enrollment metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">Revenue Metrics Summary</h3>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-xl">
              <span className="text-slate-400">Gross Marketplace Revenue</span>
              <span className="font-black text-slate-100 text-sm">
                ${(reports?.grossRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-xl">
              <span className="text-slate-400">Total Valid Enrollments</span>
              <span className="font-black text-slate-100">{reports?.totalEnrollments || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-800/60 rounded-xl">
              <span className="text-slate-400">Average Course Price</span>
              <span className="font-black text-slate-100">
                ${(reports?.avgCoursePrice || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4 border-b pb-3">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            <h3 className="font-extrabold text-slate-100 text-sm">Course Category Distribution</h3>
          </div>
          <div className="space-y-2 text-xs max-h-48 overflow-y-auto">
            {reports?.categoryBreakdown?.map((cat: any) => (
              <div key={cat.name} className="flex justify-between items-center p-2.5 bg-slate-800/60 rounded-xl">
                <span className="font-bold text-slate-200">{cat.name}</span>
                <span className="font-black text-purple-400">{cat.count} Courses</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Top Performing Courses */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4 border-b pb-3">
          <Award className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-slate-100 text-sm">Top Revenue Performing Courses</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase text-[10px]">
              <tr>
                <th className="px-4 py-3">Course Title</th>
                <th className="px-4 py-3">Instructor</th>
                <th className="px-4 py-3">Students</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Gross Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {reports?.topCourses?.map((c: any) => (
                <tr key={c.id}>
                  <td className="px-4 py-3 font-bold text-slate-100">{c.title}</td>
                  <td className="px-4 py-3 text-slate-400">{c.instructorName}</td>
                  <td className="px-4 py-3 font-bold text-purple-400">{c.studentCount} Students</td>
                  <td className="px-4 py-3">${c.price}</td>
                  <td className="px-4 py-3 font-extrabold text-emerald-400">
                    ${(c.studentCount * c.price).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
