import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle2,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  Filter,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CivicReport } from '../../types';
import { apiFetch, safeJson } from '../../utils/api';

export const CivicTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const [reports, setReports] = useState<CivicReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Officer / Admin status update form
  const [statusRemarks, setStatusRemarks] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [targetStatus, setTargetStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const statuses = ['All', 'Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Closed'];

  useEffect(() => {
    loadReports();
  }, [statusFilter, categoryFilter, token]);

  const loadReports = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'All') params.set('status', statusFilter);
      if (categoryFilter !== 'All') params.set('category', categoryFilter);
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/api/reports${queryStr}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await safeJson(res);
      setReports(data.reports || []);

      if (id) {
        const found = data.reports.find((r: CivicReport) => r.id === id || r.reportId === id);
        if (found) setSelectedReport(found);
      } else if (data.reports && data.reports.length > 0 && !selectedReport) {
        setSelectedReport(data.reports[0]);
      }
    } catch (err) {
      console.error('Failed to load reports:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedReport || !token) return;

    setIsSubmittingComment(true);
    try {
      const res = await apiFetch(`/api/reports/${selectedReport.id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: newComment }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);

      // Append comment locally
      const updated = {
        ...selectedReport,
        comments: [...selectedReport.comments, data.comment],
      };
      setSelectedReport(updated);
      setReports((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setNewComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedReport || !token) return;

    setIsUpdatingStatus(true);
    try {
      const res = await apiFetch(`/api/reports/${selectedReport.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status,
          remarks: statusRemarks || `Officer progressed status to ${status}`,
          resolutionNotes: status === 'Resolved' ? resolutionNotes || 'Repaired and verified.' : undefined,
        }),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);

      setSelectedReport(data.report);
      setReports((prev) => prev.map((r) => (r.id === data.report.id ? data.report : r)));
      setStatusRemarks('');
      setResolutionNotes('');
      setTargetStatus('');
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const isOfficerOrAdmin = user && (user.role === 'officer' || user.role === 'admin');

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
            <Clock className="w-3.5 h-3.5" />
            <span>SLA TIMELINE & DISPATCH LOGS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Civic Issue Tracking & Resolution Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track real-time remediation progress, officer comments, and photographic verification.
          </p>
        </div>

        <Link
          to="/reports/new"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:opacity-95 transition-all self-start md:self-auto"
        >
          <span>File New Grievance</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-mono uppercase mr-1">Status:</span>
        {statuses.map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
              statusFilter === st
                ? 'bg-[#477BFF] text-white shadow-sm'
                : 'bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 border border-white/[0.08]'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Main Grid: Directory (4 cols) & Report Timeline (8 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Complaint Directory */}
        <div className="lg:col-span-4 space-y-3 max-h-[800px] overflow-y-auto pr-1">
          {reports.map((report) => {
            const isSelected = selectedReport?.id === report.id;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                  isSelected
                    ? 'bg-gradient-to-r from-[#477BFF]/20 to-[#8968FF]/10 border-[#477BFF]/40 shadow-lg shadow-[#477BFF]/10'
                    : 'glass-card border-white/[0.06] hover:border-white/[0.15]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-white">{report.reportId}</span>
                  <StatusBadge status={report.status} size="sm" />
                </div>
                <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{report.title}</h3>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[180px]">
                    <MapPin className="w-3 h-3 text-[#477BFF] shrink-0" />
                    <span className="truncate">{report.location}</span>
                  </span>
                  <StatusBadge status={report.severity} type="severity" size="sm" />
                </div>
              </div>
            );
          })}

          {reports.length === 0 && (
            <div className="p-8 text-center text-slate-400 glass-card rounded-2xl text-xs">
              No reports match this status filter.
            </div>
          )}
        </div>

        {/* Right Column: Deep Tracking Details */}
        <div className="lg:col-span-8">
          {selectedReport ? (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-8">
              {/* Header */}
              <div className="space-y-3 pb-6 border-b border-white/[0.08]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-bold text-white bg-white/[0.05] px-3 py-1 rounded-lg border border-white/[0.1]">
                      {selectedReport.reportId}
                    </span>
                    <StatusBadge status={selectedReport.severity} type="severity" size="sm" />
                  </div>
                  <StatusBadge status={selectedReport.status} size="md" />
                </div>

                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  {selectedReport.title}
                </h2>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#477BFF]" />
                    {selectedReport.location}
                  </span>
                  <span>•</span>
                  <span>Reported on: {new Date(selectedReport.createdAt).toLocaleDateString()}</span>
                  {selectedReport.assignedOfficer && (
                    <>
                      <span>•</span>
                      <span className="text-[#38D9E6] font-mono">
                        Officer: {selectedReport.assignedOfficer.name} ({selectedReport.assignedOfficer.department})
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Photo Evidence & AI Analysis Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Photo */}
                <div className="space-y-2">
                  <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                    Site Evidence
                  </span>
                  <div className="aspect-video rounded-2xl overflow-hidden bg-[#11182B] border border-white/[0.1]">
                    <img
                      src={selectedReport.imageUrls[0]}
                      alt="Grievance Evidence"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* AI Triage Card */}
                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.06] space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-[#38D9E6] font-mono font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Gemini 3.8 AI Triage
                    </span>
                    <span className="text-emerald-400">
                      {Math.round((selectedReport.aiAnalysis.confidence || 0.9) * 100)}% Conf
                    </span>
                  </div>

                  <p className="text-slate-300 leading-relaxed">
                    {selectedReport.aiAnalysis.summary}
                  </p>

                  <div className="space-y-1 pt-2 border-t border-white/[0.06] text-[11px] text-slate-400">
                    <p><strong className="text-white">Responsible Dept:</strong> {selectedReport.aiAnalysis.suggestedDepartment}</p>
                    <p><strong className="text-white">Recommended Action:</strong> {selectedReport.aiAnalysis.recommendedAction}</p>
                  </div>
                </div>
              </div>

              {/* Officer / Admin Control Panel (if officer or admin) */}
              {isOfficerOrAdmin && (
                <div className="p-5 rounded-2xl bg-[#477BFF]/10 border border-[#477BFF]/20 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-[#38D9E6]" />
                      Officer Command Desk
                    </span>
                    <span className="text-[11px] text-slate-300">Authorized Personnel Only</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Under Review', 'Assigned', 'In Progress', 'Resolved'].map((st) => (
                      <button
                        key={st}
                        onClick={() => handleUpdateStatus(st)}
                        disabled={isUpdatingStatus || selectedReport.status === st}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                          selectedReport.status === st
                            ? 'bg-[#477BFF] text-white opacity-50 cursor-not-allowed'
                            : 'bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.1]'
                        }`}
                      >
                        Set: {st}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Progression Timeline */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#477BFF]" />
                  Status Progression & Audit History
                </h3>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-white/[0.1]">
                  {(selectedReport.statusHistory || []).map((step, idx) => (
                    <div key={idx} className="relative space-y-1 text-xs">
                      <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#477BFF] ring-4 ring-[#0B1020]" />
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">{step.newStatus}</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(step.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-400">{step.remarks}</p>
                      <p className="text-[11px] text-slate-500 font-mono">By: {step.updatedBy}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Comments & Updates Conversation Thread */}
              <div className="pt-6 border-t border-white/[0.08] space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#38D9E6]" />
                  Official Communication Thread
                </h3>

                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {(selectedReport.comments || []).map((comm) => (
                    <div
                      key={comm.id}
                      className={`p-3.5 rounded-2xl text-xs space-y-1 ${
                        comm.userRole === 'citizen'
                          ? 'bg-[#477BFF]/15 border border-[#477BFF]/20 ml-8'
                          : 'bg-white/[0.03] border border-white/[0.06] mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                        <span className="font-bold text-white">
                          {comm.userName} ({comm.userRole.toUpperCase()})
                        </span>
                        <span>{new Date(comm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{comm.message}</p>
                    </div>
                  ))}

                  {(!selectedReport.comments || selectedReport.comments.length === 0) && (
                    <p className="text-xs text-slate-500 italic">No comments yet in this thread.</p>
                  )}
                </div>

                {token && (
                  <form onSubmit={handleAddComment} className="flex gap-2">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Type official inquiry or field crew update..."
                      className="flex-1 bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#477BFF]"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="px-4 py-2.5 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0] disabled:opacity-50 text-xs flex items-center gap-1.5 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Post</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              Select a grievance on the left to review its status timeline.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
