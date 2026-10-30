import React, { useState, useEffect } from 'react';
import {
  ScrollText,
  Search,
  Filter,
  Shield,
  Clock,
  User,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuditLog } from '../../types';

export const AuditLogsPage: React.FC = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('All');

  useEffect(() => {
    if (!token) return;
    loadLogs();
  }, [actionFilter, token]);

  const loadLogs = async () => {
    try {
      const url = new URL('/api/admin/audit-logs', window.location.origin);
      if (actionFilter !== 'All') url.searchParams.set('action', actionFilter);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.auditLogs || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    }
  };

  const actions = [
    'All',
    'SUBMIT_CIVIC_REPORT',
    'UPDATE_REPORT_STATUS',
    'ASSIGN_OFFICER',
    'POLICY_UPLOAD',
    'GENERATE_POLICY_EXPLANATION',
    'RUN_FACT_CHECK',
    'UPDATE_USER_ROLE',
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
          <ScrollText className="w-3.5 h-3.5" />
          <span>CRYPTOGRAPHIC GOVERNANCE TRAIL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System Audit & Accountability Logs
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Immutable event log of all complaint submissions, status transitions, officer dispatches, and policy uploads.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400 font-mono">Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#11182B] border border-white/[0.1] rounded-xl px-3 py-1.5 text-white"
          >
            {actions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); loadLogs(); }} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user, entity, or details..."
            className="bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#477BFF] text-white text-xs font-semibold">
            Search
          </button>
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 uppercase">
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Action Event</th>
                <th className="py-3.5 px-4">Entity Target</th>
                <th className="py-3.5 px-4">Audit Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-sans font-semibold text-white whitespace-nowrap">
                    {log.userName}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-white/[0.06] text-[#38D9E6] border border-white/[0.1]">
                      {log.action}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-purple-300 whitespace-nowrap">
                    {log.entityType} ({log.entityId})
                  </td>
                  <td className="py-3.5 px-4 font-sans text-slate-300 max-w-md">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
