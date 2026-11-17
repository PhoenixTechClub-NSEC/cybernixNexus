'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck,
  Search,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Lock,
  UserCheck,
  UserX,
  Loader2,
  Sparkles,
} from 'lucide-react';

interface UserItem {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: 'STUDENT' | 'ADMIN' | 'SUPERADMIN';
  isBanned: boolean;
  createdAt: string;
  student?: {
    id: string;
    name: string;
    username: string | null;
    rollNumber: string | null;
    department: string;
    graduationYear: number;
    profileComplete: boolean;
    stats?: {
      totalScore: number;
      ranking: number | null;
      departmentRanking: number | null;
    } | null;
    _count?: {
      contestRegistrations: number;
      editorials: number;
    };
  } | null;
}

interface RoleCounts {
  all: number;
  students: number;
  admins: number;
  superadmins: number;
}

interface AdminUsersProps {
  currentUserId: string;
  viewerRole: 'STUDENT' | 'ADMIN' | 'SUPERADMIN';
  isSuperAdmin: boolean;
  onShowToast: (message: string, type?: 'success' | 'error') => void;
}

export function AdminUsers({
  currentUserId,
  viewerRole: _viewerRole,
  isSuperAdmin,
  onShowToast,
}: AdminUsersProps) {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [counts, setCounts] = useState<RoleCounts>({ all: 0, students: 0, admins: 0, superadmins: 0 });
  const [selectedRoleTab, setSelectedRoleTab] = useState<'ALL' | 'STUDENT' | 'ADMIN' | 'SUPERADMIN'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states for role change confirmation
  const [roleChangeModal, setRoleChangeModal] = useState<{
    isOpen: boolean;
    user: UserItem | null;
    targetRole: 'STUDENT' | 'ADMIN';
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    targetRole: 'ADMIN',
    isSubmitting: false,
  });

  // Modal states for editing user details
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    user: UserItem | null;
    name: string;
    email: string;
    department: string;
    rollNumber: string;
    graduationYear: number;
    isBanned: boolean;
    isSubmitting: boolean;
  }>({
    isOpen: false,
    user: null,
    name: '',
    email: '',
    department: 'CSE',
    rollNumber: '',
    graduationYear: 2026,
    isBanned: false,
    isSubmitting: false,
  });

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedRoleTab !== 'ALL') params.set('role', selectedRoleTab);
      if (debouncedSearch) params.set('q', debouncedSearch);
      params.set('page', String(currentPage));
      params.set('limit', '10');

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch users: ${res.statusText}`);
      }
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setCounts(data.counts);
        setTotalPages(data.pagination.totalPages);
        setTotalUsers(data.pagination.total);
      }
    } catch (err) {
      console.error(err);
      onShowToast('Could not load user list from server', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [selectedRoleTab, debouncedSearch, currentPage, onShowToast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Role Change Submission
  const handleConfirmRoleChange = async () => {
    if (!roleChangeModal.user) return;
    setRoleChangeModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch(`/api/admin/users/${roleChangeModal.user.id}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: roleChangeModal.targetRole }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update administrative role');
      }

      onShowToast(data.message || 'User role updated successfully!', 'success');
      setRoleChangeModal({ isOpen: false, user: null, targetRole: 'ADMIN', isSubmitting: false });
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update role';
      onShowToast(msg, 'error');
      setRoleChangeModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  // Handle Edit User Submission
  const handleConfirmEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModal.user) return;
    setEditModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      const res = await fetch(`/api/admin/users/${editModal.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editModal.name,
          email: editModal.email,
          department: editModal.department,
          rollNumber: editModal.rollNumber,
          graduationYear: editModal.graduationYear,
          isBanned: editModal.isBanned,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update user profile');
      }

      onShowToast('User profile updated successfully!', 'success');
      setEditModal({
        isOpen: false,
        user: null,
        name: '',
        email: '',
        department: 'CSE',
        rollNumber: '',
        graduationYear: 2026,
        isBanned: false,
        isSubmitting: false,
      });
      fetchUsers();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update user details';
      onShowToast(msg, 'error');
      setEditModal((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Sub-Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Role Tabs */}
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/70 rounded-2xl border border-onyx/10 shadow-xs">
          <button
            type="button"
            onClick={() => {
              setSelectedRoleTab('ALL');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRoleTab === 'ALL'
                ? 'bg-onyx text-golden-sand shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>All Users</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedRoleTab === 'ALL' ? 'bg-white/20 text-white' : 'bg-onyx/10 text-onyx'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleTab('STUDENT');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRoleTab === 'STUDENT'
                ? 'bg-onyx text-golden-sand shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <span>Regular Users</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedRoleTab === 'STUDENT' ? 'bg-white/20 text-white' : 'bg-onyx/10 text-onyx'
            }`}>
              {counts.students}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleTab('ADMIN');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRoleTab === 'ADMIN'
                ? 'bg-pine-teal text-white shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admins</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedRoleTab === 'ADMIN' ? 'bg-white/20 text-white' : 'bg-pine-teal/20 text-pine-teal'
            }`}>
              {counts.admins}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRoleTab('SUPERADMIN');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
              selectedRoleTab === 'SUPERADMIN'
                ? 'bg-dark-amethyst text-golden-sand shadow-sm'
                : 'text-onyx/70 hover:bg-black/5'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-golden-sand" />
            <span>Superadmins</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              selectedRoleTab === 'SUPERADMIN' ? 'bg-white/20 text-white' : 'bg-dark-amethyst/10 text-dark-amethyst'
            }`}>
              {counts.superadmins}
            </span>
          </button>
        </div>

        {/* Live Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-onyx/40 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, email, roll..."
            className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-onyx/10 text-xs font-bold text-onyx placeholder:text-onyx/40 focus:outline-none focus:ring-2 focus:ring-tomato-jam/30 focus:border-tomato-jam shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-onyx/40 hover:text-onyx cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Role Permission Context Notice */}
      {!isSuperAdmin && (
        <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>
            <strong>Admin View Active:</strong> You can view all registered users and edit student details. Granting or revoking administrative privileges is restricted strictly to Superadmins.
          </span>
        </div>
      )}

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-onyx/10 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FFFDF8] border-b border-onyx/10 text-onyx/60 font-black uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-6">User</th>
                <th className="py-4 px-6">Department &amp; Roll</th>
                <th className="py-4 px-6">Account Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Joined Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-onyx/5">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-onyx/50 font-bold">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-tomato-jam" />
                      <span>Loading user records...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-onyx/50 font-bold">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  const isSuper = u.role === 'SUPERADMIN';
                  const isAdminRole = u.role === 'ADMIN';

                  return (
                    <tr key={u.id} className="hover:bg-golden-sand/5 transition-colors">
                      {/* User Info */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={u.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                            alt={u.name || 'User'}
                            className="w-9 h-9 rounded-full object-cover border border-onyx/10 shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="font-extrabold text-sm text-onyx truncate flex items-center gap-1.5">
                              <span>{u.name || 'Unnamed User'}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold text-tomato-jam bg-tomato-jam/10 px-1.5 py-0.2 rounded-md">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-onyx/60 font-medium truncate">
                              {u.email || 'No email associated'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Roll */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-onyx">
                          {u.student?.department || 'Unassigned'}
                        </div>
                        <div className="text-[11px] text-onyx/60 font-mono">
                          {u.student?.rollNumber || 'No Roll #'}
                        </div>
                      </td>

                      {/* Account Role Badge */}
                      <td className="py-4 px-6">
                        {isSuper ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-dark-amethyst text-golden-sand border border-golden-sand/30 shadow-xs">
                            <Sparkles className="w-3 h-3 text-golden-sand" />
                            Superadmin
                          </span>
                        ) : isAdminRole ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-pine-teal/15 text-pine-teal border border-pine-teal/30">
                            <ShieldCheck className="w-3 h-3" />
                            Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-onyx/10 text-onyx/80">
                            Student
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {u.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-red-100 text-red-700">
                            Suspended
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase bg-emerald-100 text-emerald-700">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-4 px-6 text-onyx/60 font-medium">
                        {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          {/* Superadmin RBAC Privilege Management Controls */}
                          {isSuperAdmin ? (
                            isSuper ? (
                              <span
                                title="Superadmin accounts cannot be modified or demoted"
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-onyx/40 px-2 py-1 bg-onyx/5 rounded-xl cursor-default"
                              >
                                <Lock className="w-3 h-3" />
                                Protected
                              </span>
                            ) : isAdminRole ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setRoleChangeModal({
                                    isOpen: true,
                                    user: u,
                                    targetRole: 'STUDENT',
                                    isSubmitting: false,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-extrabold text-xs transition-all border border-red-200 cursor-pointer flex items-center gap-1.5"
                                title="Revoke admin privileges and restore user to regular student"
                              >
                                <UserX className="w-3.5 h-3.5" />
                                <span>Revoke Admin</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  setRoleChangeModal({
                                    isOpen: true,
                                    user: u,
                                    targetRole: 'ADMIN',
                                    isSubmitting: false,
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-pine-teal/10 hover:bg-pine-teal/20 text-pine-teal font-extrabold text-xs transition-all border border-pine-teal/30 cursor-pointer flex items-center gap-1.5"
                                title="Grant administrative privileges to this user"
                              >
                                <UserCheck className="w-3.5 h-3.5" />
                                <span>Promote to Admin</span>
                              </button>
                            )
                          ) : (
                            /* Admin viewer: cannot change privileges */
                            <span className="text-[11px] text-onyx/40 font-semibold px-2">
                              {isSuper ? 'Superadmin' : isAdminRole ? 'Admin' : 'Regular User'}
                            </span>
                          )}

                          {/* Edit User Details Button */}
                          <button
                            type="button"
                            onClick={() =>
                              setEditModal({
                                isOpen: true,
                                user: u,
                                name: u.name || '',
                                email: u.email || '',
                                department: u.student?.department || 'CSE',
                                rollNumber: u.student?.rollNumber || '',
                                graduationYear: u.student?.graduationYear || 2026,
                                isBanned: u.isBanned,
                                isSubmitting: false,
                              })
                            }
                            disabled={!isSuperAdmin && isSuper}
                            className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/70 hover:text-onyx transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Edit user details"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="py-3 px-6 bg-[#FFFDF8] border-t border-onyx/10 flex items-center justify-between text-xs font-bold text-onyx/60">
          <div>
            Showing {users.length} of {totalUsers} users
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-xl border border-onyx/10 bg-white hover:bg-onyx/5 text-onyx font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="px-2 text-onyx font-black">
              {currentPage} / {totalPages || 1}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-xl border border-onyx/10 bg-white hover:bg-onyx/5 text-onyx font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog for Role Modification */}
      {roleChangeModal.isOpen && roleChangeModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-onyx/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
              <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                  roleChangeModal.targetRole === 'ADMIN'
                    ? 'bg-pine-teal/15 text-pine-teal'
                    : 'bg-red-50 text-red-600'
                }`}>
                  {roleChangeModal.targetRole === 'ADMIN' ? (
                    <ShieldCheck className="w-5 h-5" />
                  ) : (
                    <UserX className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">
                    {roleChangeModal.targetRole === 'ADMIN' ? 'Promote to Administrator' : 'Revoke Administrator Privileges'}
                  </h3>
                  <p className="text-xs text-onyx/50 font-medium">Role-Based Access Control</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRoleChangeModal({ isOpen: false, user: null, targetRole: 'ADMIN', isSubmitting: false })}
                className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/50 hover:text-onyx cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed text-onyx/80">
              <p>
                Are you sure you want to change the role of{' '}
                <strong className="text-onyx font-black">{roleChangeModal.user.name || roleChangeModal.user.email}</strong> to{' '}
                <span className={`font-black ${roleChangeModal.targetRole === 'ADMIN' ? 'text-pine-teal' : 'text-red-700'}`}>
                  {roleChangeModal.targetRole === 'ADMIN' ? 'Admin' : 'Regular Student'}
                </span>
                ?
              </p>

              {roleChangeModal.targetRole === 'ADMIN' ? (
                <div className="p-3 rounded-2xl bg-pine-teal/10 border border-pine-teal/20 text-pine-teal font-medium space-y-1">
                  <p className="font-bold">Privileges granted upon confirmation:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Full access to the Admin Dashboard</li>
                    <li>Ability to create, edit, and delete contests</li>
                    <li>Ability to manage participants and mark attendance</li>
                    <li>Read-only access to user directories (cannot manage staff)</li>
                  </ul>
                </div>
              ) : (
                <div className="p-3 rounded-2xl bg-red-50 border border-red-200 text-red-800 font-medium space-y-1">
                  <p className="font-bold">Privileges revoked upon confirmation:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                    <li>Immediate revocation of Admin Dashboard access</li>
                    <li>User will be restored to regular student permissions</li>
                    <li>Takes effect immediately across server and database</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={roleChangeModal.isSubmitting}
                onClick={() => setRoleChangeModal({ isOpen: false, user: null, targetRole: 'ADMIN', isSubmitting: false })}
                className="px-4 py-2.5 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={roleChangeModal.isSubmitting}
                onClick={handleConfirmRoleChange}
                className={`px-5 py-2.5 rounded-2xl font-black text-xs text-white transition-all shadow-md cursor-pointer flex items-center gap-2 ${
                  roleChangeModal.targetRole === 'ADMIN'
                    ? 'bg-pine-teal hover:bg-pine-teal/90'
                    : 'bg-tomato-jam hover:bg-tomato-jam/90'
                }`}
              >
                {roleChangeModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>
                  {roleChangeModal.targetRole === 'ADMIN' ? 'Confirm Promotion' : 'Confirm Revocation'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Details Modal */}
      {editModal.isOpen && editModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-onyx/15 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-onyx/10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-golden-sand/30 flex items-center justify-center text-onyx">
                  <Edit2 className="w-4 h-4 text-amber-700" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-onyx">Edit User Details</h3>
                  <p className="text-xs text-onyx/50 font-medium">Update account and student information</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModal({ ...editModal, isOpen: false, user: null })}
                className="p-1.5 rounded-xl hover:bg-onyx/5 text-onyx/50 hover:text-onyx cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmEditUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Full Name</label>
                  <input
                    type="text"
                    value={editModal.name}
                    onChange={(e) => setEditModal({ ...editModal, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Email Address</label>
                  <input
                    type="email"
                    value={editModal.email}
                    onChange={(e) => setEditModal({ ...editModal, email: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none focus:ring-2 focus:ring-tomato-jam/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Department</label>
                  <select
                    value={editModal.department}
                    onChange={(e) => setEditModal({ ...editModal, department: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  >
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="AI&DS">AI&DS</option>
                    <option value="EE">EE</option>
                    <option value="ME">ME</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Roll Number</label>
                  <input
                    type="text"
                    value={editModal.rollNumber}
                    onChange={(e) => setEditModal({ ...editModal, rollNumber: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-extrabold text-onyx">Graduation Year</label>
                  <input
                    type="number"
                    value={editModal.graduationYear}
                    onChange={(e) => setEditModal({ ...editModal, graduationYear: parseInt(e.target.value, 10) || 2026 })}
                    className="w-full px-3 py-2 rounded-xl bg-onyx/5 border border-onyx/10 font-bold text-onyx focus:outline-none"
                  />
                </div>
              </div>

              {/* Suspension / Ban Toggle */}
              <div className="pt-2 border-t border-onyx/5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editModal.isBanned}
                    onChange={(e) => setEditModal({ ...editModal, isBanned: e.target.checked })}
                    className="w-4 h-4 rounded text-tomato-jam focus:ring-tomato-jam"
                  />
                  <div className="space-y-0.5">
                    <span className="font-black text-onyx">Suspend User Account</span>
                    <p className="text-[11px] text-onyx/50">Suspended users are blocked from logging in or registering for events.</p>
                  </div>
                </label>
              </div>

              <div className="pt-3 border-t border-onyx/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={editModal.isSubmitting}
                  onClick={() => setEditModal({ ...editModal, isOpen: false, user: null })}
                  className="px-4 py-2.5 rounded-2xl bg-onyx/5 hover:bg-onyx/10 text-onyx font-bold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editModal.isSubmitting}
                  className="px-5 py-2.5 rounded-2xl bg-onyx hover:bg-onyx/90 font-black text-xs text-golden-sand transition-all shadow-md cursor-pointer flex items-center gap-2"
                >
                  {editModal.isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
