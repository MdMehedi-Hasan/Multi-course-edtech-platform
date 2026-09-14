import React, { useEffect, useState } from 'react';
import { Shield, Search, Filter, Code, Eye, Clock } from 'lucide-react';
import { api } from '../../lib/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMeta, setSelectedMeta] = useState<any>(null);

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter]);

  const fetchAuditLogs = async () => {
    try {
      setIsLoading(true);
      const data = await api.getAdminAuditLogs({
        action: actionFilter || undefined,
        search: searchQuery || undefined,
      });
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchAuditLogs();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Security Audit Trail & System Logs</h1>
        <p className="text-xs text-slate-400 mt-1">Immutable administrative action history tracking logins, privilege escalation, status suspensions, and settings changes.</p>
      </div>

      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search actor email, target or action keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900/60 border border-slate-700/50 rounded-xl text-xs font-bold text-slate-100 outline-none"
          >
            <option value="">All Action Types</option>
            <option value="USER_LOGIN">USER_LOGIN</option>
            <option value="USER_ROLE_CHANGE">USER_ROLE_CHANGE</option>
            <option value="USER_SUSPENDED">USER_SUSPENDED</option>
            <option value="INSTRUCTOR_APPROVED">INSTRUCTOR_APPROVED</option>
            <option value="COURSE_PUBLISH">COURSE_PUBLISH</option>
            <option value="CATEGORY_CREATE">CATEGORY_CREATE</option>
            <option value="SETTINGS_UPDATE">SETTINGS_UPDATE</option>
          </select>

          <Button type="submit" variant="default" size="sm">Search</Button>
        </form>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-400">
            <thead className="bg-slate-900 text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3.5">Action Badge</th>
                <th className="px-4 py-3.5">Actor (Admin/User)</th>
                <th className="px-4 py-3.5">Target Resource</th>
                <th className="px-4 py-3.5">Timestamp</th>
                <th className="px-5 py-3.5 text-right">Metadata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">Loading security log ledger...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-slate-400">No audit log entries matching filter.</td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-700/40 transition-colors font-mono text-[11px]">
                    <td className="px-5 py-4 font-sans">
                      <span className="font-mono text-[10px] font-extrabold bg-purple-950 text-purple-300 border border-purple-500/40 px-2.5 py-1 rounded-md">
                        {log.action}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-bold text-slate-100">
                      {log.actorEmail}
                    </td>

                    <td className="px-4 py-4 text-purple-400 font-medium">
                      {log.target}
                    </td>

                    <td className="px-4 py-4 text-slate-400 font-sans">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="px-5 py-4 text-right font-sans">
                      {log.metadata ? (
                        <Button variant="ghost" size="sm" onClick={() => setSelectedMeta(log)}>
                          <Code className="w-3.5 h-3.5 text-purple-400 mr-1" /> View JSON
                        </Button>
                      ) : (
                        <span className="text-slate-400 text-[10px]">None</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* JSON Metadata Viewer Modal */}
      {selectedMeta && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-extrabold text-slate-100 text-sm">Audit Payload Metadata</h3>
                <p className="text-[11px] text-slate-400 font-mono">{selectedMeta.action} → {selectedMeta.target}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedMeta(null)}>Close</Button>
            </div>

            <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl text-xs font-mono overflow-x-auto max-h-80 border border-slate-800">
              {JSON.stringify(selectedMeta.metadata, null, 2)}
            </pre>
          </Card>
        </div>
      )}
    </div>
  );
};
