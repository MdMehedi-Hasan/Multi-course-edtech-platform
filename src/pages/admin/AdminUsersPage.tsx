import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  ShieldAlert,
  UserCheck,
  UserX,
  MoreVertical,
  Eye,
  Trash2,
  AlertCircle,
  X,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

interface AdminUsersPageProps {
  onNavigate?: (path: string) => void;
}

export const AdminUsersPage: React.FC<AdminUsersPageProps> = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  // Selected User Modal / Detail state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<any>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // Status Change Modal
  const [suspendingUser, setSuspendingUser] = useState<any>(null);
  const [suspensionReason, setSuspensionReason] = useState('');

  // Role Change Modal
  const [roleChangeUser, setRoleChangeUser] = useState<any>(null);
  const [targetRole, setTargetRole] = useState<string>('STUDENT');

  // Notification feedback
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminUsers({
        role: roleFilter !== 'ALL' ? roleFilter : undefined,
        status: statusFilter,
        search: searchQuery || undefined,
      });
      setUsers(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      setActionFeedback({ type: 'error', message: err.message || 'Failed to fetch users.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers();
  };

  const openUserDetail = async (userId: string) => {
    setSelectedUserId(userId);
    try {
      setIsDetailLoading(true);
      const detail = await api.getAdminUserDetail(userId);
      setUserDetail(detail);
    } catch (err: any) {
      console.error('Failed to load user detail:', err);
      setActionFeedback({ type: 'error', message: 'Failed to load detailed profile.' });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!roleChangeUser) return;
    try {
      await api.updateUserRole(roleChangeUser.id, targetRole);
      setActionFeedback({ type: 'success', message: `User role changed to ${targetRole} successfully.` });
      setRoleChangeUser(null);
      fetchUsers();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update user role.' });
    }
  };

  const handleStatusToggle = async () => {
    if (!suspendingUser) return;
    const isSuspending = !suspendingUser.isSuspended;
    try {
      await api.updateUserStatus(suspendingUser.id, {
        isSuspended: isSuspending,
        suspensionReason: isSuspending ? suspensionReason : undefined,
      });
      setActionFeedback({
        type: 'success',
        message: isSuspending ? 'User account has been suspended.' : 'User account reactivated.',
      });
      setSuspendingUser(null);
      setSuspensionReason('');
      fetchUsers();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update account status.' });
    }
  };

  const handleDeleteUser = async (userId: string, email: string) => {
    if (!window.confirm(`Are you sure you want to deactivate account for ${email}?`)) return;
    try {
      await api.deleteUser(userId);
      setActionFeedback({ type: 'success', message: `User account ${email} soft-deleted.` });
      fetchUsers();
    } catch (err: any) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to delete user.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform User Management</h1>
          <p className="text-xs text-slate-500 mt-1">Manage user roles, inspect account activity, suspend policy violators, and maintain security authorization.</p>
        </div>
      </div>

      {actionFeedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            actionFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{actionFeedback.message}</span>
          <button onClick={() => setActionFeedback(null)} className="p-1 hover:bg-slate-200/50 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search user name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-purple-600 outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
            >
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="INSTRUCTOR">Instructors</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 outline-none"
            >
              <option value="active font-medium">Active Users</option>
              <option value="deleted">Deactivated Users</option>
            </select>

            <Button type="submit" variant="default" size="sm">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">User Profile</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Activity Stats</th>
                <th className="px-4 py-3.5">Joined Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading platform user database...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0 overflow-hidden">
                          {u.avatarUrl ? (
                            <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                          ) : (
                            u.name.substring(0, 2).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 flex items-center gap-1.5">
                            {u.name}
                            {u.id === currentUser?.id && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 font-bold px-1.5 py-0.5 rounded">You</span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : u.role === 'INSTRUCTOR'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-blue-100 text-blue-800 border border-blue-300'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="px-4 py-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md">
                          <ShieldAlert className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-[11px]">
                      <div>{u.enrollmentCount} Enrollments</div>
                      {u.role === 'INSTRUCTOR' && <div className="text-amber-700 font-medium">{u.courseCount} Authored Courses</div>}
                    </td>

                    <td className="px-4 py-4 text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => openUserDetail(u.id)} title="View User Detail">
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setRoleChangeUser(u);
                            setTargetRole(u.role);
                          }}
                          disabled={u.id === currentUser?.id}
                          title="Change Role"
                        >
                          <Shield className="w-3.5 h-3.5 text-purple-600" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSuspendingUser(u);
                            setSuspensionReason(u.suspensionReason || '');
                          }}
                          disabled={u.id === currentUser?.id}
                          title={u.isSuspended ? 'Reactivate User' : 'Suspend User'}
                        >
                          {u.isSuspended ? <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> : <UserX className="w-3.5 h-3.5 text-rose-600" />}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          disabled={u.id === currentUser?.id}
                          title="Soft Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
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

      {/* USER DETAIL MODAL */}
      {selectedUserId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[85vh] flex flex-col p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setSelectedUserId(null);
                setUserDetail(null);
              }}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            {isDetailLoading || !userDetail ? (
              <div className="py-16 text-center">
                <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs text-slate-400 mt-2">Loading user dossier...</p>
              </div>
            ) : (
              <div className="space-y-6 overflow-y-auto pr-2">
                <div className="flex items-center gap-4 border-b pb-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-xl font-black">
                    {userDetail.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">{userDetail.name}</h3>
                    <p className="text-xs text-slate-500">{userDetail.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white uppercase">{userDetail.role}</span>
                      {userDetail.isSuspended ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">Suspended</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">Active</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enrolled Courses */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Enrolled Courses ({userDetail.enrollments?.length || 0})</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-xl p-3 bg-slate-50 text-xs">
                    {userDetail.enrollments?.length > 0 ? (
                      userDetail.enrollments.map((e: any) => (
                        <div key={e.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                          <span className="font-semibold text-slate-800">{e.course?.title}</span>
                          <span className="text-[11px] text-purple-700 font-bold">{e.progress}% complete</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-400">No enrollments.</p>
                    )}
                  </div>
                </div>

                {/* Authored Courses (if instructor) */}
                {userDetail.role === 'INSTRUCTOR' && (
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">Authored Courses ({userDetail.authoredCourses?.length || 0})</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto border rounded-xl p-3 bg-slate-50 text-xs">
                      {userDetail.authoredCourses?.length > 0 ? (
                        userDetail.authoredCourses.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-2 bg-white rounded-lg border">
                            <span className="font-semibold text-slate-800">{c.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-purple-50 text-purple-700">
                              {c.isPublished ? 'Published' : 'Draft'} (${c.price})
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400">No authored courses.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ROLE CHANGE MODAL */}
      {roleChangeUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">Change User Role</h3>
            <p className="text-xs text-slate-500">
              Modifying permission level for <span className="font-bold text-slate-900">{roleChangeUser.email}</span>.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select New Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
              >
                <option value="STUDENT">STUDENT (Standard Learner)</option>
                <option value="INSTRUCTOR">INSTRUCTOR (Course Creator)</option>
                <option value="ADMIN">ADMIN (Full Governance)</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRoleChangeUser(null)}>
                Cancel
              </Button>
              <Button variant="default" size="sm" onClick={handleRoleUpdate}>
                Update Role
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* SUSPENSION MODAL */}
      {suspendingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              {suspendingUser.isSuspended ? 'Reactivate Account' : 'Suspend Account'}
            </h3>
            <p className="text-xs text-slate-500">
              Target user: <span className="font-bold text-slate-900">{suspendingUser.email}</span>
            </p>

            {!suspendingUser.isSuspended && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Suspension</label>
                <textarea
                  rows={3}
                  value={suspensionReason}
                  onChange={(e) => setSuspensionReason(e.target.value)}
                  placeholder="E.g., Violating platform terms of service or copyright infringement..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setSuspendingUser(null)}>
                Cancel
              </Button>
              <Button
                variant={suspendingUser.isSuspended ? 'default' : 'destructive'}
                size="sm"
                onClick={handleStatusToggle}
              >
                {suspendingUser.isSuspended ? 'Confirm Reactivation' : 'Confirm Suspension'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
