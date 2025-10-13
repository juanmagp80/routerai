'use client';

import RolePromotionButton from "@/components/admin/RolePromotionButton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatsService } from '@/lib/stats-service';
import { Edit, Mail, Plus, Search, Trash2, User, Users as UsersIcon } from "lucide-react";
import Image from 'next/image';
import { useEffect, useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  status: 'active' | 'inactive' | 'pending';
  lastActive: Date;
  apiKeysCount: number;
  totalRequests: number;
  joinedAt: Date;
  department?: string;
  avatar?: string;
}

interface CreateUserData {
  name: string;
  email: string;
  role: 'admin' | 'developer' | 'viewer';
  department?: string;
  sendInvite: boolean;
}

interface Invitation {
  id: string;
  email: string;
  name: string;
  token: string;
  created_at: string;
  expires_at: string;
  resend_count: number;
  is_used: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [demoUserIds, setDemoUserIds] = useState<Set<string>>(new Set());
  const [hideDemoUsers, setHideDemoUsers] = useState<boolean>(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [message, setMessage] = useState<string>('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [createData, setCreateData] = useState<CreateUserData>({
    name: '',
    email: '',
    role: 'developer',
    department: '',
    sendInvite: true,
  });

  // Load users data
  useEffect(() => {
    loadUsers();

    // If debug flag is enabled, fetch dashboard stats to get debug_active_users
    async function loadDebugIds() {
      if (process.env.NEXT_PUBLIC_STATS_DEBUG === 'true') {
        try {
          const stats = await StatsService.getDashboardStats();
          const debugList = (stats as unknown as { debug_active_users?: Array<{ id: string }> })?.debug_active_users;
          if (debugList && debugList.length > 0) {
            const ids = new Set(debugList.map(d => d.id));
            setDemoUserIds(ids);
            // Default to hide demo users when debug is active
            setHideDemoUsers(true);
          }
        } catch {
          // ignore
        }
      }
    }

    loadDebugIds();
  }, []);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Load users
      const usersResponse = await fetch('/api/admin/users');
      const usersData = await usersResponse.json();

      // Load pending invitations
      const invitationsResponse = await fetch('/api/admin/invitations');
      const invitationsData = await invitationsResponse.json();

      if (usersResponse.ok) {
        setAccessDenied(false);
        setUsers(usersData.users || []);

        // If API returned debug_active_users (server-side), populate demoUserIds
        const dbg = usersData.debug_active_users as Array<{ id: string }> | undefined;
        if (dbg && dbg.length > 0) {
          setDemoUserIds(new Set(dbg.map(d => d.id)));
          setHideDemoUsers(true);
        }
      } else {
        if (usersResponse.status === 401 || usersResponse.status === 403) {
          setAccessDenied(true);
        }
        console.error('Error loading users:', usersData.error);
      }

      if (invitationsResponse.ok) {
        setInvitations(invitationsData.invitations || []);
      } else {
        console.error('Error loading invitations:', invitationsData.error);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    // Excluir usuarios demo en modo debug si el toggle está activo
    if (hideDemoUsers && demoUserIds.has(user.id)) return false;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Create new user
  const handleCreateUser = async () => {
    if (!createData.name.trim() || !createData.email.trim()) {
      alert('Name and email are required');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createData),
      });

      const result = await response.json();

      if (response.ok) {
        setShowCreateModal(false);
        setCreateData({
          name: '',
          email: '',
          role: 'developer',
          department: '',
          sendInvite: true,
        });

        // Show appropriate success message
        if (createData.sendInvite) {
          alert(`Invitation sent successfully to ${createData.email}. The user will receive an email to accept the invitation.`);
        } else {
          alert('User created successfully');
        }

        await loadUsers();
      } else {
        alert(result.error || 'Error creating user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Error creating user');
    } finally {
      setIsCreating(false);
    }
  };

  // Update user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedUser.role,
          status: selectedUser.status,
          department: selectedUser.department,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setShowEditModal(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        alert(result.error || 'Error updating user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Error updating user');
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        await loadUsers();
      } else {
        alert(result.error || 'Error deleting user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    } finally {
      setIsDeleting(false);
    }
  };

  // Promote user role
  const handlePromoteUser = async (userId: string, newRole: 'admin' | 'developer' | 'viewer') => {
    try {
      const response = await fetch('/api/admin/users/promote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, newRole }),
      });

      const result = await response.json();

      if (response.ok) {
        // Actualizar la lista de usuarios localmente
        setUsers(users.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        ));
        alert(`User role updated to ${newRole} successfully`);
      } else {
        alert(result.error || 'Error updating user role');
      }
    } catch (error) {
      console.error('Error promoting user:', error);
      alert('Error updating user role');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }
  if (accessDenied) {
    return (
      <div className="flex-1 space-y-6 p-8 pt-6">
        <div className="p-8 bg-yellow-50 rounded-md">
          <h3 className="text-lg font-semibold">Access denied</h3>
          <p className="text-sm text-muted-foreground mt-2">You do not have permission to view the users list.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">
            Manage team members and their access permissions
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      {/* Status Message */}
      {message && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative">
          <span className="block sm:inline">{message}</span>
          <span
            className="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer"
            onClick={() => setMessage('')}
          >
            <svg className="fill-current h-4 w-4" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
            </svg>
          </span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground">
              {users.filter(u => u.status === 'active').length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admins</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-xs text-muted-foreground">
              System administrators
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Developers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.role === 'developer').length}
            </div>
            <p className="text-xs text-muted-foreground">
              API developers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {users.filter(u => u.status === 'pending').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting invitation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Invitations */}
      {invitations.length > 0 && (
        <div className="mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Invitaciones Pendientes ({invitations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{invitation.name}</div>
                      <div className="text-sm text-gray-600">{invitation.email}</div>
                      <div className="text-xs text-gray-500">
                        Enviada: {new Date(invitation.created_at).toLocaleDateString('es-ES')} |
                        Expira: {new Date(invitation.expires_at).toLocaleDateString('es-ES')} |
                        Reenvíos: {invitation.resend_count}/5
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/api/invites/accept?token=${invitation.token}`);
                          // Could add a toast notification here
                        }}
                      >
                        Copiar Link
                      </Button>
                      {invitation.resend_count < 5 && (
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              const response = await fetch('/api/admin/users/invite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  email: invitation.email,
                                  name: invitation.name,
                                  role: 'user'
                                })
                              });

                              if (response.ok) {
                                await loadUsers(); // Reload to update resend count
                                setMessage('Invitación reenviada exitosamente');
                              } else {
                                const data = await response.json();
                                setMessage(data.error || 'Error al reenviar invitación');
                              }
                            } catch {
                              setMessage('Error al reenviar invitación');
                            }
                          }}
                        >
                          Reenviar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="developer">Developer</SelectItem>
            <SelectItem value="viewer">Viewer</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
        {/* Debug: toggle to hide demo users discovered by stats-service */}
        {process.env.NEXT_PUBLIC_STATS_DEBUG === 'true' && (
          <div className="flex items-center space-x-2">
            <label className="text-sm">Hide demo users</label>
            <input type="checkbox" checked={hideDemoUsers} onChange={(e) => setHideDemoUsers(e.target.checked)} />
          </div>
        )}
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No users found</p>
                <p className="text-xs mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.avatar ? (
                        <Image src={user.avatar} alt={user.name} width={40} height={40} className="w-10 h-10 rounded-full" />
                      ) : (
                        <User className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      {user.department && (
                        <p className="text-xs text-muted-foreground">{user.department}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right text-sm">
                      <p>{user.apiKeysCount} API Keys</p>
                      <p className="text-muted-foreground">{user.totalRequests.toLocaleString()} requests</p>
                    </div>
                    <div className="flex space-x-2">
                      <RolePromotionButton
                        currentRole={user.role}
                        onRoleChange={(newRole) => handlePromoteUser(user.id, newRole)}
                      />
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                    </div>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      {/* Resend invite for pending users */}
                      {user.status === 'pending' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const res = await fetch('/api/admin/users/invite', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ email: user.email, name: user.name, resendToUserId: user.id }),
                              });
                              if (res.ok) {
                                alert('Invitation resent');
                              } else {
                                const data = await res.json();
                                alert(data.error || 'Failed to resend invitation');
                              }
                            } catch (e) {
                              console.error('Error resending invite', e);
                              alert('Error resending invite');
                            }
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Invite a new team member to your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={createData.name}
                onChange={(e) => setCreateData({ ...createData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={createData.email}
                onChange={(e) => setCreateData({ ...createData, email: e.target.value })}
                placeholder="john@company.com"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={createData.role} onValueChange={(value: 'admin' | 'developer' | 'viewer') => setCreateData({ ...createData, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  <SelectItem value="developer">Developer - API access</SelectItem>
                  <SelectItem value="admin">Admin - Full access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="department">Department (Optional)</Label>
              <Input
                id="department"
                value={createData.department}
                onChange={(e) => setCreateData({ ...createData, department: e.target.value })}
                placeholder="Engineering, Marketing, etc."
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendInvite"
                checked={createData.sendInvite}
                onChange={(e) => setCreateData({ ...createData, sendInvite: e.target.checked })}
                className="rounded border-gray-300"
              />
              <Label htmlFor="sendInvite" className="text-sm">
                Send invitation email
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateUser} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user role and permissions
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input value={selectedUser.name} disabled />
              </div>
              <div>
                <Label>Email Address</Label>
                <Input value={selectedUser.email} disabled />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: 'admin' | 'developer' | 'viewer') => setSelectedUser({ ...selectedUser, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                    <SelectItem value="developer">Developer - API access</SelectItem>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={selectedUser.status}
                  onValueChange={(value: 'active' | 'inactive') => setSelectedUser({ ...selectedUser, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-department">Department</Label>
                <Input
                  id="edit-department"
                  value={selectedUser.department || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, department: e.target.value })}
                  placeholder="Engineering, Marketing, etc."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser} disabled={isUpdating}>
              {isUpdating ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-gray-600">{selectedUser.email}</p>
              <p className="text-sm text-red-600 mt-2">
                This will revoke all API keys and remove access to the platform.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}