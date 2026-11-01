import React from 'react';

interface StatusBadgeProps {
  status: string;
  type?: 'status' | 'severity' | 'verdict';
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'status', size = 'md' }) => {
  const getStyles = () => {
    const s = status.toLowerCase();

    // Verdict badges
    if (type === 'verdict') {
      if (s.includes('supported')) {
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      }
      if (s.includes('contradicted')) {
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      }
      if (s.includes('misleading')) {
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      }
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }

    // Severity badges
    if (type === 'severity') {
      switch (s) {
        case 'critical':
          return 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse';
        case 'high':
          return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'medium':
          return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        case 'low':
          return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
        default:
          return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
      }
    }

    // Report / Application Statuses
    switch (s) {
      case 'submitted':
      case 'draft':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'under review':
      case 'in verification':
        return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
      case 'assigned':
      case 'documents ready':
        return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
      case 'in progress':
      case 'submitted online':
        return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
      case 'resolved':
      case 'approved':
      case 'official':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'closed':
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-300 border-slate-500/30';
    }
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border backdrop-blur-sm ${getStyles()} ${sizeStyles}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
