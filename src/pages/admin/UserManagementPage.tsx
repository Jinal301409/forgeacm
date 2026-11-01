import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Shield,
  CheckCircle,
  AlertCircle,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { User } from '../../types';
import { apiFetch, safeJson } from '../../utils/api';

export const UserManagementPage: React.FC = () => {
  const { token, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadUsers();
  }, [roleFilter, token]);

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'All') params.set('role', roleFilter);
      if (search) params.set('search', search);
      const queryStr = params.toString() ? `?${params.toString()}` : '';

      const res = await apiFetch(`/api/admin/users${queryStr}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await safeJson(res);
      setUsers(data.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await apiFetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.error);

      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u)));
      setMessage(`Role updated to ${newRole} for user.`);
      setTimeout(() => setMessage(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      <div className="pb-4 border-b border-white/[0.08]">
        <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold text-[#38D9E6]">
          <Users className="w-3.5 h-3.5" />
          <span>ACCESS CONTROL & ROLES</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Citizen & Civic Officer Directory
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Manage roles (Citizen, Authorized Civic Officer, Administrator) with real backend authorization enforcement.
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{message}</span>
        </div>
      )}

      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setRoleFilter('All')}
            className={`px-3 py-1.5 rounded-full font-medium ${
              roleFilter === 'All' ? 'bg-[#477BFF] text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            All Roles
          </button>
          <button
            onClick={() => setRoleFilter('citizen')}
            className={`px-3 py-1.5 rounded-full font-medium ${
              roleFilter === 'citizen' ? 'bg-[#477BFF] text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Citizens
          </button>
          <button
            onClick={() => setRoleFilter('officer')}
            className={`px-3 py-1.5 rounded-full font-medium ${
              roleFilter === 'officer' ? 'bg-[#477BFF] text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Civic Officers
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-3 py-1.5 rounded-full font-medium ${
              roleFilter === 'admin' ? 'bg-[#477BFF] text-white' : 'bg-white/[0.04] text-slate-400 hover:text-white'
            }`}
          >
            Administrators
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); loadUsers(); }} className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, or city..."
            className="bg-[#080B12] border border-white/[0.1] rounded-xl px-4 py-2 text-xs text-white"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-[#477BFF] text-white text-xs font-semibold">
            Search
          </button>
        </form>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-3xl border border-white/[0.1] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.08] text-slate-400 font-mono uppercase">
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact & Location</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4 text-right">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] text-slate-300">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-[11px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <p>{u.city}, {u.state}</p>
                    <p className="text-[11px] text-slate-400">{u.phone || 'No phone'}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono text-[11px] font-semibold ${
                        u.role === 'admin'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : u.role === 'officer'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <select
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={currentUser?.id === u.id}
                      className="bg-[#080B12] border border-white/[0.1] rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none cursor-pointer disabled:opacity-40"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="officer">Civic Officer</option>
                      <option value="admin">Administrator</option>
                    </select>
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
