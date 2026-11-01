import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
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
  LineChart,
  Line,
} from 'recharts';
import { useAuth } from '../../context/AuthContext';
import { apiFetch, safeJson } from '../../utils/api';

export const AnalyticsPage: React.FC = () => {
  const { token } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/dashboard/admin', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => safeJson(r))
      .then((d) => setData(d))
      .catch((err) => console.error('Failed to load analytics:', err));
  }, [token]);

  const resolutionTrend = [
    { day: 'Mon', resolved: 4, received: 5 },
    { day: 'Tue', resolved: 6, received: 4 },
    { day: 'Wed', resolved: 8, received: 7 },
    { day: 'Thu', resolved: 5, received: 6 },
    { day: 'Fri', resolved: 9, received: 8 },
    { day: 'Sat', resolved: 4, received: 3 },
    { day: 'Sun', resolved: 2, received: 2 },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#8968FF]">
          <BarChart3 className="w-3.5 h-3.5" />
          <span>SLA AUDIT & PERFORMANCE TELEMETRY</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Municipal Operations Analytics & Reports
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor ward response rates, resolution efficiency, and Citizen Charter SLA milestones.
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-slate-400 uppercase">Average Redressal Time</span>
          <p className="text-3xl font-bold font-mono text-white">36.4 Hours</p>
          <p className="text-[11px] text-emerald-400">Within 72h charter mandate</p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-emerald-400 uppercase">SLA Compliance Rate</span>
          <p className="text-3xl font-bold font-mono text-emerald-400">94.2%</p>
          <p className="text-[11px] text-slate-400">+2.4% from previous quarter</p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-[#38D9E6] uppercase">First-Time Fix Rate</span>
          <p className="text-3xl font-bold font-mono text-[#38D9E6]">88.6%</p>
          <p className="text-[11px] text-slate-400">Zero duplicate reopens</p>
        </div>
        <div className="glass-card p-5 rounded-2xl space-y-1">
          <span className="text-xs font-mono text-purple-400 uppercase">Citizen Satisfaction</span>
          <p className="text-3xl font-bold font-mono text-purple-400">4.7 / 5.0</p>
          <p className="text-[11px] text-slate-400">Based on resolved feedback</p>
        </div>
      </div>

      {/* Resolution Speed Line Chart */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/[0.1] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Weekly Grievance Inflow vs Resolution Trend</h3>
            <p className="text-xs text-slate-400">Daily intake matched against closed work orders.</p>
          </div>
          <span className="text-xs font-mono text-emerald-400">Healthy Clearance Velocity</span>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={resolutionTrend}>
              <XAxis dataKey="day" stroke="#64748B" fontSize={11} />
              <YAxis stroke="#64748B" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#080B12', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="received" stroke="#F97316" strokeWidth={2} name="Received" />
              <Line type="monotone" dataKey="resolved" stroke="#10B981" strokeWidth={2} name="Resolved" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
