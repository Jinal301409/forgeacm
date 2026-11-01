import React, { useState, useEffect } from 'react';
import {
  FileText,
  CheckCircle2,
  Plus,
  ExternalLink,
  Sparkles,
  Trash2,
  Clock,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';
import { PublicApplication } from '../../types';
import { apiFetch, safeJson } from '../../utils/api';

export const MyApplicationsPage: React.FC = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState<PublicApplication[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [serviceName, setServiceName] = useState('');
  const [department, setDepartment] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [officialPortalUrl, setOfficialPortalUrl] = useState('https://services.india.gov.in');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    loadApplications();
  }, [token]);

  const loadApplications = async () => {
    try {
      const res = await apiFetch('/api/applications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      setApplications(data.applications || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    }
  };

  const toggleChecklistItem = async (app: PublicApplication, checkId: string) => {
    const updatedChecklist = app.checklist.map((c) =>
      c.id === checkId ? { ...c, completed: !c.completed } : c
    );
    const completedCount = updatedChecklist.filter((c) => c.completed).length;
    const progress = Math.round((completedCount / updatedChecklist.length) * 100);
    const status = progress === 100 ? 'Approved' : progress > 50 ? 'In Verification' : 'Documents Ready';

    try {
      const res = await apiFetch(`/api/applications/${app.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ checklist: updatedChecklist, status }),
      });
      const data = await safeJson(res);
      setApplications((prev) => prev.map((a) => (a.id === app.id ? data.application : a)));
    } catch (err) {
      console.error('Error toggling checklist:', err);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (!confirm('Remove this application tracker?')) return;
    try {
      await apiFetch(`/api/applications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setApplications((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      console.error('Error deleting application:', err);
    }
  };

  const handleCreateApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceName) return;

    setIsSubmitting(true);
    try {
      const res = await apiFetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          serviceName,
          department,
          referenceNumber,
          officialPortalUrl,
        }),
      });

      const data = await safeJson(res);
      setApplications([data.application, ...applications]);
      setShowAddModal(false);
      setServiceName('');
      setDepartment('');
      setReferenceNumber('');
    } catch (err) {
      console.error('Failed to add application tracker:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
            <FileText className="w-3.5 h-3.5" />
            <span>PUBLIC SERVICE GUIDED WORKFLOWS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            My Public Service Applications
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track your document checklists, application reference codes, and procedural milestones.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Service</span>
        </button>
      </div>

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {applications.map((app) => (
          <div
            key={app.id}
            className="glass-panel p-6 rounded-3xl border border-white/[0.1] space-y-5 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-mono text-[#38D9E6] uppercase tracking-wider block">
                    Ref: {app.referenceNumber}
                  </span>
                  <h3 className="text-base font-bold text-white leading-snug">{app.serviceName}</h3>
                  <p className="text-xs text-slate-400">{app.department}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={app.status} size="sm" />
                  <button
                    onClick={() => handleDeleteApplication(app.id)}
                    className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                    title="Remove tracker"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono text-slate-300">
                  <span>Milestone Completion</span>
                  <span className="text-[#38D9E6] font-bold">{app.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#477BFF] to-[#38D9E6] rounded-full transition-all duration-300"
                    style={{ width: `${app.progress}%` }}
                  />
                </div>
              </div>

              {/* Interactive Checklist Items */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono font-semibold text-white uppercase tracking-wider">
                  Document Checklist:
                </span>
                <div className="space-y-1.5 text-xs">
                  {app.checklist.map((item) => (
                    <label
                      key={item.id}
                      className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] flex items-center gap-3 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => toggleChecklistItem(app, item.id)}
                        className="rounded bg-[#080B12] border-white/[0.2] text-[#477BFF] w-4 h-4"
                      />
                      <span className={item.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                        {item.item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
              <span className="text-slate-500 font-mono text-[11px]">
                Updated: {new Date(app.updatedAt).toLocaleDateString()}
              </span>
              {app.officialPortalUrl && (
                <a
                  href={app.officialPortalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#477BFF] hover:underline flex items-center gap-1 font-semibold"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="col-span-2 p-12 text-center text-slate-400 glass-card rounded-3xl space-y-3">
            <p className="text-sm">No tracked applications found.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs font-semibold text-[#477BFF] hover:underline"
            >
              Start tracking a public service application
            </button>
          </div>
        )}
      </div>

      {/* Add Application Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#080B12] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Track New Public Service</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Service Name *</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  placeholder="e.g. PM Surya Ghar Solar Subsidy Application"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Issuing Authority / Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Torrent Power & GEDA"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Application Reference Number (Optional)</label>
                <input
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. RTS-2025-99418"
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Official Submission Portal URL</label>
                <input
                  type="url"
                  value={officialPortalUrl}
                  onChange={(e) => setOfficialPortalUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0]"
                >
                  {isSubmitting ? 'Creating...' : 'Create Tracker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
