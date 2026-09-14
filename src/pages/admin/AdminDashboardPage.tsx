import React, { useEffect, useState } from 'react';
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CheckCircle2,
  DollarSign,
  Activity,
  Shield,
  ArrowRight,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface AdminDashboardPageProps {
  onNavigate: (path: string) => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load admin dashboard stats:', err);
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
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Shield className="w-64 h-64 text-purple-400" />
        </div>
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-widest text-purple-400 bg-purple-950/80 px-2.5 py-1 rounded-md border border-purple-500/40">
            Platform Operations & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">Executive Admin Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time control tower monitoring student acquisition, course publishing pipelines, platform security audit trails, and revenue metrics.
          </p>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="p-5 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats?.studentCount || 0}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{stats?.totalUsers || 0} total registered users</p>
            </div>
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-amber-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Instructors</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats?.instructorCount || 0}</h3>
              <p className="text-[11px] text-amber-400 font-semibold mt-0.5">Faculty status active</p>
            </div>
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-purple-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">{stats?.totalCourses || 0}</h3>
              <p className="text-[11px] text-purple-400 font-semibold mt-0.5">{stats?.publishedCourses || 0} published online</p>
            </div>
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>
        </Card>

        <Card className="p-5 border-l-4 border-l-emerald-500 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</p>
              <h3 className="text-2xl font-black text-slate-100 mt-1">
                ${(stats?.grossRevenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
              <p className="text-[11px] text-emerald-400 font-semibold mt-0.5">{stats?.totalEnrollments || 0} enrollments</p>
            </div>
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      {/* Secondary Operational Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Card className="p-5 flex items-center gap-4 bg-slate-900 text-white border-slate-800">
          <div className="p-3 bg-purple-950/80 border border-purple-500/40 text-purple-400 rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active User Base</p>
            <h4 className="text-xl font-bold">{stats?.activeUsers || 0} Users</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified active accounts</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-slate-900 text-white border-slate-800">
          <div className="p-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 rounded-2xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Completion Rate</p>
            <h4 className="text-xl font-bold">{stats?.courseCompletionRate || 0}%</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">{stats?.completedEnrollments || 0} courses finished</p>
          </div>
        </Card>

        <Card className="p-5 flex items-center gap-4 bg-slate-900 text-white border-slate-800">
          <div className="p-3 bg-indigo-950/80 border border-indigo-500/40 text-indigo-400 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Course Catalog Status</p>
            <h4 className="text-xl font-bold">{stats?.draftCourses || 0} Drafts / {stats?.archivedCourses || 0} Archived</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Pipeline in creation</p>
          </div>
        </Card>
      </div>

      {/* Two Column Layout: Recent Enrollments & Live Security Audit Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Enrollments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">Recent Student Enrollments</h3>
              <p className="text-xs text-slate-400">Latest platform course registrations</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/enrollments')}>
              View All <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {stats?.recentEnrollments && stats.recentEnrollments.length > 0 ? (
              stats.recentEnrollments.map((enr: any) => (
                <div key={enr.id} className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-100">{enr.studentName}</span>
                    <span className="text-slate-400 text-[11px] ml-1.5">({enr.studentEmail})</span>
                    <p className="text-purple-400 font-semibold mt-0.5">{enr.courseTitle}</p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <Clock className="w-3 h-3 inline mr-1" />
                    {new Date(enr.enrolledAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No recent enrollments recorded.</p>
            )}
          </div>
        </Card>

        {/* Live Security Audit Stream */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4 border-b pb-3">
            <div>
              <h3 className="font-extrabold text-slate-100 text-base">Live Audit Trail Stream</h3>
              <p className="text-xs text-slate-400">Real-time security and administrative events</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/audit-logs')}>
              View Logs <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>

          <div className="space-y-3">
            {stats?.recentAuditLogs && stats.recentAuditLogs.length > 0 ? (
              stats.recentAuditLogs.map((log: any) => (
                <div key={log.id} className="p-3 rounded-xl bg-slate-900 text-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="font-mono text-[10px] bg-purple-950 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded font-bold mr-2">
                      {log.action}
                    </span>
                    <span className="font-medium">{log.actorEmail}</span>
                    <span className="text-slate-400 ml-1">→ {log.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">No audit log entries found.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
