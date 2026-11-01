import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Upload,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { PolicyDocument } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';

export const PolicyManagementPage: React.FC = () => {
  const { token } = useAuth();
  const [policies, setPolicies] = useState<PolicyDocument[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [authority, setAuthority] = useState('');
  const [category, setCategory] = useState('Public Administration');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/policies')
      .then((r) => r.json())
      .then((d) => setPolicies(d.policies || []))
      .catch((err) => console.error('Failed to load policies:', err));
  }, []);

  const handleCreatePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/policies/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          authority,
          category,
          content,
          sourceUrl,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPolicies([data.policy, ...policies]);
      setShowAddModal(false);
      setTitle('');
      setAuthority('');
      setContent('');
      setSourceUrl('');
      alert('Policy successfully published to gazette repository.');
    } catch (err: any) {
      alert(err.message || 'Failed to publish policy.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
            <FileText className="w-3.5 h-3.5" />
            <span>GAZETTE & CIRCULAR MANAGEMENT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Policy & Document Repository Vault
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish official government orders, circulars, and notifications for AI semantic ingestion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] rounded-xl shadow-lg shadow-[#477BFF]/25 hover:opacity-95 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Policy</span>
        </button>
      </div>

      {/* Policy Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-mono uppercase">
                <th className="py-3.5 px-4">Title & Authority</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Published Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {policies.map((p) => (
                <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{p.title}</p>
                    <p className="text-[11px] text-slate-400">{p.authority}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono">{p.category}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">{p.notificationDate}</td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={p.verificationStatus || 'Official'} size="sm" />
                  </td>
                  <td className="py-3.5 px-4 font-mono">{p.views || 0}</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/policies/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#38D9E6] font-semibold inline-flex items-center gap-1"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Explain</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0F172A] border border-white/[0.1] rounded-3xl p-6 sm:p-8 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <h3 className="text-base font-bold text-white">Publish Policy to Repository</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-xs">
                ✕ Close
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Policy Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. National Urban Clean Air Action Guidelines"
                  className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Issuing Ministry</label>
                  <input
                    type="text"
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    placeholder="e.g. Ministry of Environment"
                    className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl px-4 py-2 text-white"
                  >
                    <option value="Energy & Sustainability">Energy & Sustainability</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Digital Governance & Privacy">Digital Governance & Privacy</option>
                    <option value="Urban Infrastructure">Urban Infrastructure</option>
                    <option value="Public Administration">Public Administration</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Full Notification Text *</label>
                <textarea
                  rows={6}
                  required
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Paste gazette directives here..."
                  className="w-full bg-[#11182B] border border-white/[0.1] rounded-xl p-3 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-400">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl font-semibold text-white bg-[#477BFF] hover:bg-[#386df0]"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish Document'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
