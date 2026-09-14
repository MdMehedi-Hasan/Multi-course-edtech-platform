import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Users,
  Award,
  Star,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';

interface InstructorAnalyticsPageProps {
  onNavigate: (path: string) => void;
}

export const InstructorAnalyticsPage: React.FC<InstructorAnalyticsPageProps> = ({ onNavigate }) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setIsLoading(true);
        const data = await api.getInstructorAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load instructor analytics:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500/40"></div>
      </div>
    );
  }

  const {
    totalEnrollments = 0,
    activeStudents = 0,
    avgCompletionRate = 0,
    avgRating = 4.9,
    monthlyData = [],
    courseEngagement = [],
  } = analytics || {};

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-700/50">
        <h1 className="text-2xl font-black text-slate-100">Analytics & Insights</h1>
        <p className="text-xs text-slate-400 mt-1">
          Track course metrics, monthly enrollment growth, completion velocity, and rating performance.
        </p>
      </div>

      {/* Metric Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-5 border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Enrollments</p>
              <h3 className="text-2xl font-black text-slate-100">{totalEnrollments}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-2xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Students</p>
              <h3 className="text-2xl font-black text-slate-100">{activeStudents}</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Completion Rate</p>
              <h3 className="text-2xl font-black text-slate-100">{avgCompletionRate}%</h3>
            </div>
          </div>
        </Card>

        <Card className="p-5 border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
              <Star className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg Course Rating</p>
              <h3 className="text-2xl font-black text-slate-100">{avgRating}</h3>
            </div>
          </div>
        </Card>
      </div>

      {/* Enrollment Growth Chart */}
      <Card className="p-6 border-slate-700/50 space-y-4">
        <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <TrendingUp className="w-4.5 h-4.5 text-indigo-400" /> Monthly Enrollment Velocity
        </h2>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="enrollmentGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="enrollments"
                stroke="#4f46e5"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#enrollmentGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Course Completion Breakdown Chart */}
      <Card className="p-6 border-slate-700/50 space-y-4">
        <h2 className="text-base font-extrabold text-slate-100 flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-emerald-400" /> Course Completion & Engagement Rates (%)
        </h2>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseEngagement} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="title" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="completionRate" fill="#10b981" radius={[8, 8, 0, 0]} name="Completion %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
