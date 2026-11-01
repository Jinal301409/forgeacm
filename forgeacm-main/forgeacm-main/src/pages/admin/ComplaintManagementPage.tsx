import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock,
  UserCheck,
  Search,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CivicReport, User } from '../../types';

export const ComplaintManagementPage: React.FC = () => {
  const { token, user } = useAuth();
  const [reports, setReports] = useState<CivicReport[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Manage drawer state
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadReports();
    loadOfficers();
  }, [statusFilter, severityFilter, token]);

  const loadReports = async () => {
    try {
      const url = new URL('/api/reports', window.location.origin);
      if (statusFilter !== 'All') url.searchParams.set('status', statusFilter);
      if (severityFilter !== 'All') url.searchParams.set('severity', severityFilter);
      if (searchQuery) url.searchParams.set('search', searchQuery);

      const res = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setReports(data.reports || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const loadOfficers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=officer', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setOfficers(data.users || []);
    } catch (err) {
      console.error('Failed to load officers:', err);
    }
  };

  const handleAssignOfficer = async () => {
    if (!selectedReport || !selectedOfficerId) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/assign`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ officerId: selectedOfficerId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports((prev) => prev.map((r) => (r.id === data.report.id ? data.report : r)));
      setSelectedReport(data.report);
      alert('Officer successfully assigned.');
    } catch (err: any) {
      alert(err.message || 'Failed to assign officer.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !newStatus) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: newStatus,
          remarks: statusRemarks || `Admin updated status to ${newStatus}`,
          resolutionNotes: newStatus === 'Resolved' ? resolutionNotes : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setReports((prev) => prev.map((r) => (r.id === data.report.id ? data.report : r)));
      setSelectedReport(data.report);
      setStatusRemarks('');
      setResolutionNotes('');
      alert('Status updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-orange-400">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>MUNICIPAL COMPLAINT REDRESSAL</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Civic Complaint Management & Dispatch
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Review reported grievances, assign ward engineers, update resolution stages, and log SLA remarks.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#080B12] border border-white/[0.1] rounded-xl px-3 py-2 text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-[#080B12] border border-white/[0.1] rounded-xl px-3 py-2 text-white"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); loadReports(); }} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search complaint ID or title..."
            className="bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#477BFF] text-white text-xs font-semibold">
            Filter
          </button>
        </form>
      </div>

      {/* Grid: Directory (7 cols) & Management Action Drawer (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-7 glass-panel rounded-3xl border border-white/[0.1] overflow-hidden">
          <div className="p-4 border-b border-white/[0.08] text-xs font-mono uppercase text-slate-400 flex justify-between">
            <span>Complaints ({reports.length})</span>
            <span>Click to Manage</span>
          </div>

          <div className="divide-y divide-white/[0.06] max-h-[700px] overflow-y-auto">
            {reports.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => {
                    setSelectedReport(rep);
                    setNewStatus(rep.status);
                  }}
                  className={`p-4 cursor-pointer transition-all space-y-2 ${
                    isSelected ? 'bg-[#477BFF]/15 border-l-4 border-l-[#477BFF]' : 'hover:bg-white/[0.02]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white">{rep.reportId}</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={rep.severity} type="severity" size="sm" />
                      <StatusBadge status={rep.status} size="sm" />
                    </div>
                  </div>
                  <h4 className="text-sm font-semibold text-white">{rep.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-1">{rep.location}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Management Action Drawer */}
        <div className="lg:col-span-5">
          {selectedReport ? (
            <div className="glass-panel p-6 rounded-3xl border border-white/[0.1] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <span className="text-xs font-mono font-bold text-white block">{selectedReport.reportId}</span>
                  <span className="text-xs text-slate-400">{selectedReport.category}</span>
                </div>
                <Link
                  to={`/reports/${selectedReport.reportId}`}
                  className="text-xs font-semibold text-[#38D9E6] hover:underline flex items-center gap-1"
                >
                  <span>Public View</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              {/* Status Update Form */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                <span className="font-bold text-white font-mono uppercase tracking-wider block">
                  Change Status
                </span>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-3 py-2 text-white"
                >
                  <option value="Submitted">Submitted</option>
                  <option value="Under Review">Under Review</option>
                  <option value="Assigned">Assigned</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>

                <textarea
                  rows={2}
                  value={statusRemarks}
                  onChange={(e) => setStatusRemarks(e.target.value)}
                  placeholder="Official dispatch remarks / SLA explanation..."
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl p-2.5 text-white"
                />

                {newStatus === 'Resolved' && (
                  <textarea
                    rows={2}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Resolution notes: Work completed, materials used, inspection verification..."
                    className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl p-2.5 text-white"
                  />
                )}

                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={isUpdating}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#477BFF] hover:bg-[#386df0]"
                >
                  {isUpdating ? 'Saving...' : 'Apply Status Update'}
                </button>
              </div>

              {/* Officer Assignment */}
              <div className="space-y-3 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] text-xs">
                <span className="font-bold text-white font-mono uppercase tracking-wider block">
                  Assign Authorized Officer
                </span>
                <select
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-3 py-2 text-white"
                >
                  <option value="">Select Officer / Ward Engineer</option>
                  {officers.map((off) => (
                    <option key={off.id} value={off.id}>
                      {off.name} ({off.city || 'Municipal Corp'})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleAssignOfficer}
                  disabled={isUpdating || !selectedOfficerId}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-[#8968FF] hover:bg-[#7854f7] disabled:opacity-50"
                >
                  Assign to Field Officer
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 glass-card rounded-3xl text-xs">
              Select a complaint on the left to dispatch officers or update status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
