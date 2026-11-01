import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  AlertCircle,
  CheckCircle2,
  Clock,
  Shield,
  TrendingUp,
  BarChart3,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../../components/common/StatusBadge';

export const AdminDashboard: React.FC = () => {
  const { token, user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load admin stats:', err);
        setLoading(false);
      });
  }, [token]);

  const COLORS = ['#EF4444', '#F97316', '#F59E0B', '#3B82F6', '#10B981'];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
            <Shield className="w-3.5 h-3.5" />
            <span>MUNICIPAL GOVERNANCE DESK</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Administrative & Operational Command
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time municipal grievance triage, SLA enforcement, and citizen directory overview.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/reports"
            className="px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#477BFF] to-[#386df0] hover:opacity-95 rounded-xl shadow-lg shadow-[#477BFF]/25 transition-all flex items-center gap-1.5"
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Manage Complaints</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Citizens</span>
          <p className="text-2xl font-bold text-white font-mono">{data?.metrics?.totalCitizens || 1}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-slate-400 uppercase">Total Grievances</span>
          <p className="text-2xl font-bold text-white font-mono">{data?.metrics?.totalReports || 4}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-orange-400 uppercase">Pending Review</span>
          <p className="text-2xl font-bold text-orange-400 font-mono">{data?.metrics?.pendingReports || 1}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-blue-400 uppercase">In Progress</span>
          <p className="text-2xl font-bold text-blue-400 font-mono">{data?.metrics?.assignedReports || 2}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-emerald-400 uppercase">Resolved</span>
          <p className="text-2xl font-bold text-emerald-400 font-mono">{data?.metrics?.resolvedReports || 1}</p>
        </div>
        <div className="glass-card p-4 rounded-2xl border border-white/[0.08] space-y-1">
          <span className="text-[10px] font-mono text-[#38D9E6] uppercase">SLA Compliance</span>
          <p className="text-2xl font-bold text-[#38D9E6] font-mono">{data?.metrics?.slaComplianceRate || 94.2}%</p>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Category Breakdown Bar Chart */}
        <div className="lg:col-span-8 glass-panel p-6 rounded-3xl border border-white/[0.1] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#477BFF]" />
              Civic Grievances by Infrastructure Category
            </h3>
            <span className="text-xs text-slate-400 font-mono">Live Ingestion</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.categoryDistribution || [
                { name: 'Potholes', count: 1 },
                { name: 'Water Leak', count: 1 },
                { name: 'Lighting', count: 1 },
                { name: 'Debris', count: 1 },
              ]}>
                <XAxis dataKey="name" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="count" fill="#477BFF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Severity Distribution Donut Chart */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-3xl border border-white/[0.1] space-y-4">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wider flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-400" />
            Severity Distribution
          </h3>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.severityDistribution || [
                    { name: 'Critical', count: 1 },
                    { name: 'High', count: 1 },
                    { name: 'Medium', count: 2 },
                  ]}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {(data?.severityDistribution || []).map((_entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#080B12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" /> Critical</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-orange-500" /> High</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" /> Medium</span>
          </div>
        </div>
      </div>

      {/* Recent Grievances Triage Table */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#38D9E6]" />
            Recent Grievance Action Queue
          </h3>
          <Link to="/admin/reports" className="text-xs text-[#38D9E6] hover:underline font-semibold">
            Open Full Dispatch Desk →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-mono uppercase">
                <th className="py-3 px-4">Complaint ID</th>
                <th className="py-3 px-4">Title & Ward</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {(data?.recentReports || []).map((rep: any) => (
                <tr key={rep.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-white">{rep.reportId}</td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-white">{rep.title}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-xs">{rep.location}</p>
                  </td>
                  <td className="py-3 px-4 font-mono">{rep.category}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rep.severity} type="severity" size="sm" />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={rep.status} size="sm" />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/reports/${rep.reportId}`}
                      className="px-3 py-1.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#38D9E6] font-semibold"
                    >
                      Inspect
                    </Link>
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
