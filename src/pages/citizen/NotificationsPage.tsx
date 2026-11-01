import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  CheckCircle,
  AlertCircle,
  Info,
  Clock,
  ArrowRight,
  CheckCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Notification } from '../../types';
import { apiFetch, safeJson } from '../../utils/api';

export const NotificationsPage: React.FC = () => {
  const { token } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!token) return;
    apiFetch('/api/notifications', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => safeJson(r))
      .then((d) => setNotifications(d.notifications || []))
      .catch((err) => console.error('Failed to load notifications:', err));
  }, [token]);

  const markAsRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiFetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const filtered = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
            <Bell className="w-3.5 h-3.5" />
            <span>REAL-TIME CITIZEN ALERTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Notifications & Escalations
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Status updates on your civic complaints, scheme approvals, and policy alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-all"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Mark All Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${
            filter === 'all'
              ? 'bg-[#477BFF] text-white'
              : 'bg-white/[0.04] text-slate-400 hover:text-white'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-full font-medium transition-all ${
            filter === 'unread'
              ? 'bg-[#477BFF] text-white'
              : 'bg-white/[0.04] text-slate-400 hover:text-white'
          }`}
        >
          Unread ({notifications.filter((n) => !n.read).length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => (
          <div
            key={item.id}
            onClick={() => !item.read && markAsRead(item.id)}
            className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 cursor-pointer ${
              item.read
                ? 'bg-white/[0.02] border-white/[0.05] text-slate-400'
                : 'glass-card border-[#477BFF]/30 text-white'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${item.read ? 'bg-transparent' : 'bg-[#38D9E6]'}`} />
                <h3 className="text-sm font-semibold">{item.title}</h3>
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                {new Date(item.createdAt).toLocaleDateString()}
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed pl-4">{item.message}</p>

            {item.link && (
              <div className="pl-4 pt-1">
                <Link
                  to={item.link}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#477BFF] hover:underline"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-slate-400 glass-card rounded-3xl text-xs">
            No notifications in this view.
          </div>
        )}
      </div>
    </div>
  );
};
