import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Star,
  BookOpen,
  Users,
  DollarSign,
  Eye,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  FileText,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../context/ToastContext';

export const AdminInstructorsPage: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'APPLICATIONS' | 'FACULTY'>('APPLICATIONS');

  // Applications state
  const [applications, setApplications] = useState<any[]>([]);
  const [appStatusFilter, setAppStatusFilter] = useState<string>('ALL');
  const [appSearch, setAppSearch] = useState('');
  const [isLoadingApps, setIsLoadingApps] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [rejectingAppId, setRejectingAppId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Faculty state
  const [instructors, setInstructors] = useState<any[]>([]);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(false);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);

  useEffect(() => {
    fetchApplications();
    fetchInstructors();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoadingApps(true);
      const params: any = {};
      if (appStatusFilter !== 'ALL') params.status = appStatusFilter;
      if (appSearch.trim()) params.search = appSearch.trim();
      const data = await api.getAdminInstructorApplications(params);
      setApplications(data);
    } catch (err) {
      console.error('Failed to load instructor applications:', err);
    } finally {
      setIsLoadingApps(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      setIsLoadingFaculty(true);
      const data = await api.getAdminInstructors();
      setInstructors(data);
    } catch (err) {
      console.error('Failed to load instructors list:', err);
    } finally {
      setIsLoadingFaculty(false);
    }
  };

  const handleReviewApplication = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      await api.reviewAdminInstructorApplication(id, action, reason);
      showToast(
        action === 'APPROVE' ? 'Application Approved' : 'Application Rejected',
        action === 'APPROVE'
          ? 'User account has been upgraded to INSTRUCTOR and notified.'
          : 'Application has been marked as rejected.',
        'success'
      );
      setRejectingAppId(null);
      setRejectionReason('');
      setSelectedApplication(null);
      fetchApplications();
      fetchInstructors();
    } catch (err: any) {
      showToast('Review Failed', err.message || 'Could not review application.', 'error');
    }
  };

  const handleApproveToggle = async (id: string, currentStatus: boolean) => {
    try {
      await api.approveInstructor(id, !currentStatus);
      showToast('Status Updated', 'Instructor publishing privileges updated.', 'success');
      fetchInstructors();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update approval.', 'error');
    }
  };

  const inspectInstructor = async (id: string) => {
    try {
      const detail = await api.getAdminUserDetail(id);
      setSelectedInstructor(detail);
    } catch (err) {
      console.error('Failed to fetch instructor detail:', err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Faculty & Instructor Governance</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review onboarding applications, promote verified candidates to instructors, and manage active faculty.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-700/60 p-1 rounded-xl border border-slate-700/50 self-start">
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'APPLICATIONS'
                ? 'bg-slate-800 text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Applications Queue</span>
            {applications.filter((a) => a.status === 'PENDING').length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 rounded-full text-[10px] font-extrabold">
                {applications.filter((a) => a.status === 'PENDING').length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('FACULTY')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'FACULTY'
                ? 'bg-slate-800 text-indigo-400 shadow-xs'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Active Faculty ({instructors.length})</span>
          </button>
        </div>
      </div>

      {activeTab === 'APPLICATIONS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-slate-800 p-3.5 rounded-2xl border border-slate-700/50">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidate name, email, or expertise..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchApplications()}
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700/50 text-slate-100 placeholder:text-slate-500 focus:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={appStatusFilter}
                onChange={(e) => {
                  setAppStatusFilter(e.target.value);
                  setTimeout(fetchApplications, 50);
                }}
                className="px-3 py-2 text-xs rounded-xl bg-slate-900/60 border border-slate-700/50 font-semibold text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <Button variant="outline" size="sm" onClick={fetchApplications}>
                Refresh
              </Button>
            </div>
          </div>

          {/* Applications Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-400">
                <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-5 py-3.5">Candidate</th>
                    <th className="px-4 py-3.5">Expertise</th>
                    <th className="px-4 py-3.5">Experience</th>
                    <th className="px-4 py-3.5">Submitted</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  {isLoadingApps ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        Loading instructor applications...
                      </td>
                    </tr>
                  ) : applications.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-slate-400">
                        No instructor applications found.
                      </td>
                    </tr>
                  ) : (
                    applications.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-700/40 transition-colors">
                        <td className="px-5 py-4 font-bold text-slate-100">
                          <div>
                            <p>{app.name}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{app.email}</p>
                            {app.headline && <p className="text-[10px] text-indigo-400 font-medium truncate max-w-xs">{app.headline}</p>}
                          </div>
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-200">
                          <span className="px-2.5 py-1 bg-slate-700/60 rounded-lg text-slate-300 text-[11px]">
                            {app.expertise}
                          </span>
                        </td>

                        <td className="px-4 py-4 font-semibold text-slate-300">
                          {app.experienceYears} Years
                        </td>

                        <td className="px-4 py-4 text-slate-400">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                              app.status === 'PENDING'
                                ? 'bg-amber-500/10 text-amber-400'
                                : app.status === 'APPROVED'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-rose-500/10 text-rose-400'
                            }`}
                          >
                            {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            {app.status === 'APPROVED' && <CheckCircle2 className="w-3 h-3" />}
                            {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                            {app.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedApplication(app)}
                              className="text-xs"
                            >
                              <Eye className="w-3.5 h-3.5 mr-1" /> View Proposal
                            </Button>

                            {app.status === 'PENDING' && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleReviewApplication(app.id, 'APPROVE')}
                                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                >
                                  Approve & Upgrade
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setRejectingAppId(app.id);
                                    setRejectionReason('');
                                  }}
                                  className="text-xs text-rose-400 hover:bg-rose-500/10"
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'FACULTY' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-400">
              <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="px-5 py-3.5">Instructor</th>
                  <th className="px-4 py-3.5">Courses</th>
                  <th className="px-4 py-3.5">Total Students</th>
                  <th className="px-4 py-3.5">Avg Rating</th>
                  <th className="px-4 py-3.5">Gross Revenue</th>
                  <th className="px-4 py-3.5">Approval Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {isLoadingFaculty ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Loading instructor faculty list...
                    </td>
                  </tr>
                ) : instructors.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      No instructors onboarded yet.
                    </td>
                  </tr>
                ) : (
                  instructors.map((inst) => (
                    <tr key={inst.id} className="hover:bg-slate-700/40 transition-colors">
                      <td className="px-5 py-4 font-bold text-slate-100 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center font-extrabold text-xs shrink-0 overflow-hidden">
                          {inst.avatarUrl ? (
                            <img src={inst.avatarUrl} alt={inst.name} className="w-full h-full object-cover" />
                          ) : (
                            inst.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p>{inst.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{inst.email}</p>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-slate-200">{inst.courseCount} Courses</td>
                      <td className="px-4 py-4 font-bold text-purple-400">{inst.totalStudents} Students</td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 font-bold text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span>{inst.avgRating || 'N/A'}</span>
                        </div>
                      </td>

                      <td className="px-4 py-4 font-bold text-emerald-400">
                        ${inst.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>

                      <td className="px-4 py-4">
                        {inst.isInstructorApproved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3" /> Approved Faculty
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                            Pending Approval
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant={inst.isInstructorApproved ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleApproveToggle(inst.id, inst.isInstructorApproved)}
                          >
                            {inst.isInstructorApproved ? 'Revoke Approval' : 'Approve Faculty'}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => inspectInstructor(inst.id)}>
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Application Proposal Detail Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <Card className="w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-700/50 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-slate-100 text-lg">{selectedApplication.name}</h3>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      selectedApplication.status === 'PENDING'
                        ? 'bg-amber-500/10 text-amber-400'
                        : selectedApplication.status === 'APPROVED'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {selectedApplication.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400">{selectedApplication.email}</p>
                {selectedApplication.headline && (
                  <p className="text-xs text-indigo-400 font-semibold mt-0.5">{selectedApplication.headline}</p>
                )}
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedApplication(null)}>
                Close
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Expertise</span>
                <span className="font-bold text-slate-200">{selectedApplication.expertise}</span>
              </div>
              <div className="p-3 bg-slate-800/60 rounded-xl">
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Experience</span>
                <span className="font-bold text-slate-200">{selectedApplication.experienceYears} Years</span>
              </div>
            </div>

            {(selectedApplication.website || selectedApplication.github || selectedApplication.linkedin) && (
              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Links & Profiles</span>
                <div className="flex flex-wrap gap-2">
                  {selectedApplication.website && (
                    <a
                      href={selectedApplication.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-lg font-medium"
                    >
                      <ExternalLink className="w-3 h-3" /> Website
                    </a>
                  )}
                  {selectedApplication.github && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 text-slate-300 rounded-lg font-medium">
                      GitHub: {selectedApplication.github}
                    </span>
                  )}
                  {selectedApplication.linkedin && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-700/60 text-slate-300 rounded-lg font-medium">
                      LinkedIn: {selectedApplication.linkedin}
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Instructor Bio</span>
              <p className="p-3.5 bg-slate-800/60 rounded-xl text-xs text-slate-300 leading-relaxed">
                {selectedApplication.bio}
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">Course Proposal Concept</span>
              <p className="p-3.5 bg-indigo-500/10 border border-indigo-500/30 rounded-xl text-xs text-slate-200 leading-relaxed font-medium">
                {selectedApplication.message}
              </p>
            </div>

            {selectedApplication.status === 'PENDING' && (
              <div className="pt-4 border-t border-slate-700/50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setRejectingAppId(selectedApplication.id);
                    setRejectionReason('');
                  }}
                  className="text-rose-400 hover:bg-rose-500/10"
                >
                  Reject Application
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => handleReviewApplication(selectedApplication.id, 'APPROVE')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & Promote to Instructor
                </Button>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingAppId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-slate-100 text-base">Reject Instructor Application</h3>
            <p className="text-xs text-slate-400">
              Provide feedback or a reason for the applicant explaining why the application was declined.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Please provide a more detailed syllabus and verify your portfolio credentials..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700/50 bg-slate-900/60 text-slate-100 placeholder:text-slate-500 focus:bg-slate-900/60 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectingAppId(null)}>
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={() => handleReviewApplication(rejectingAppId, 'REJECT', rejectionReason)}
              >
                Confirm Rejection
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Selected Instructor Modal */}
      {selectedInstructor && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-100 text-base">{selectedInstructor.name}</h3>
                <p className="text-xs text-slate-400">{selectedInstructor.email}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedInstructor(null)}>
                Close
              </Button>
            </div>

            <div>
              <h4 className="font-bold text-slate-200 text-xs uppercase mb-2">Authored Curriculums</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedInstructor.authoredCourses?.map((c: any) => (
                  <div key={c.id} className="p-3 bg-slate-800/60 border-slate-700/50 rounded-xl flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{c.title}</span>
                    <span className="font-extrabold text-purple-400">${c.price}</span>
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

