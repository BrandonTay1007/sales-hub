import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { usersApi, type User, type CreateUserData, type UpdateUserData, getErrorMessage } from '@/lib/api';
import { Plus, X, Edit2, Loader2, Filter, Search } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editPassword, setEditPassword] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'sales' as 'admin' | 'sales',
    commissionRate: 10,
  });

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'' | 'admin' | 'sales'>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'active' | 'inactive'>('');

  // Fetch users
  const { data: users = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await usersApi.list();
      if (!response.success) {
        throw new Error(getErrorMessage(response));
      }
      return response.data || [];
    },
  });

  // Create user mutation
  const createMutation = useMutation({
    mutationFn: async (data: CreateUserData) => {
      const response = await usersApi.create(data);
      if (!response.success) {
        throw new Error(getErrorMessage(response));
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowModal(false);
      setFormData({ name: '', username: '', password: '', role: 'sales', commissionRate: 10 });
      toast.success('User created successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to create user', { description: error.message });
    },
  });

  // Update user mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateUserData }) => {
      const response = await usersApi.update(id, data);
      if (!response.success) {
        throw new Error(getErrorMessage(response));
      }
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setEditPassword('');
      toast.success('User updated successfully!');
    },
    onError: (error: Error) => {
      toast.error('Failed to update user', { description: error.message });
    },
  });

  // Delete user mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await usersApi.delete(id);
      if (!response.success) {
        throw new Error(getErrorMessage(response));
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User deleted');
    },
    onError: (error: Error) => {
      toast.error('Failed to delete user', { description: error.message });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      name: formData.name,
      username: formData.username,
      password: formData.password,
      role: formData.role,
      commissionRate: formData.role === 'sales' ? formData.commissionRate : undefined,
    });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setEditPassword('');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;

    const updateData: UpdateUserData = {
      name: editingUser.name,
      username: editingUser.username,
      commissionRate: editingUser.role === 'sales' ? editingUser.commissionRate : undefined,
      status: editingUser.status,
    };

    // Only include password if changed
    if (editPassword) {
      updateData.password = editPassword;
    }

    updateMutation.mutate({ id: editingUser.id, data: updateData });
  };

  // Generate avatar from name
  const getAvatar = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Filter logic
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Search filter (name or username)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(query);
        const matchesUsername = user.username.toLowerCase().includes(query);
        if (!matchesName && !matchesUsername) return false;
      }
      // Role filter
      if (filterRole && user.role !== filterRole) return false;
      // Status filter
      if (filterStatus && user.status !== filterStatus) return false;
      return true;
    });
  }, [users, searchQuery, filterRole, filterStatus]);

  const hasFilters = searchQuery || filterRole || filterStatus;

  const clearFilters = () => {
    setSearchQuery('');
    setFilterRole('');
    setFilterStatus('');
  };

  if (error) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-destructive">Error loading users: {(error as Error).message}</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground mt-1">Manage your sales team and commission rates</p>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            Create User
          </button>
        </div>

        {/* Filters */}
        <div className="dashboard-card">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="font-medium text-foreground">Filters</span>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-primary hover:underline ml-auto">
                Clear all
              </button>
            )}
          </div>
          <div className="flex flex-wrap lg:flex-nowrap gap-3">
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input pl-9"
                  placeholder="Search by name or username..."
                />
              </div>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">Role</label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as '' | 'admin' | 'sales')}
                className="form-select"
              >
                <option value="">All Roles</option>
                <option value="admin">Admin</option>
                <option value="sales">Sales</option>
              </select>
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-0">
              <label className="form-label">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as '' | 'active' | 'inactive')}
                className="form-select"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="dashboard-card overflow-hidden p-0">
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary/20">
            <span className="text-sm text-muted-foreground">
              {filteredUsers.length} users
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50">
                <tr>
                  <th className="table-header">Name</th>
                  <th className="table-header">Username</th>
                  <th className="table-header">Role</th>
                  <th className="table-header">Commission Rate</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <Skeleton className="w-8 h-8 rounded-full" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      </td>
                      <td className="table-cell"><Skeleton className="h-4 w-20" /></td>
                      <td className="table-cell"><Skeleton className="h-5 w-12" /></td>
                      <td className="table-cell"><Skeleton className="h-6 w-10" /></td>
                      <td className="table-cell"><Skeleton className="h-5 w-14" /></td>
                      <td className="table-cell"><Skeleton className="h-6 w-6" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-cell text-center text-muted-foreground py-8">
                      {hasFilters ? 'No users match your filters' : 'No users found'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                            {getAvatar(user.name)}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="table-cell text-muted-foreground">{user.username}</td>
                      <td className="table-cell">
                        <span className={user.role === 'admin' ? 'badge-admin' : 'badge-sales'}>
                          {user.role}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className="font-bold text-lg text-primary">
                          {user.role === 'admin' ? '-' : `${user.commissionRate}%`}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={user.status === 'active' ? 'badge-active' : 'badge-inactive'}>
                          {user.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-1.5 hover:bg-secondary rounded transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-md border border-border">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Create New User</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="form-label">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="form-input"
                  placeholder="john.d"
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="form-input"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'sales' })}
                  className="form-select"
                >
                  <option value="sales">Sales</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {formData.role === 'sales' && (
                <div>
                  <label className="form-label">Commission Rate: {formData.commissionRate}%</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.commissionRate}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" disabled={createMutation.isPending}>
                  {createMutation.isPending ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Drawer */}
      <Sheet open={!!editingUser} onOpenChange={() => { setEditingUser(null); setEditPassword(''); }}>
        <SheetContent className="bg-card sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>

          {editingUser && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium text-primary">
                  {getAvatar(editingUser.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{editingUser.name}</h3>
                  <p className="text-sm text-muted-foreground">@{editingUser.username}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                    className="form-input"
                  />
                </div>
                <div>
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    value={editingUser.username}
                    onChange={(e) => setEditingUser({ ...editingUser, username: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div>
                  <label className="form-label">New Password (leave blank to keep)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="form-input"
                  />
                </div>

                {editingUser.role !== 'admin' && (
                  <div>
                    <label className="form-label">Commission Rate: {editingUser.commissionRate}%</label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={editingUser.commissionRate}
                      onChange={(e) => setEditingUser({ ...editingUser, commissionRate: Number(e.target.value) })}
                      className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                )}
                {editingUser.role === 'admin' && (
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-sm text-muted-foreground">Admins don't have commission rates</p>
                  </div>
                )}

                <div className="flex items-center justify-between py-3 border-y border-border">
                  <div>
                    <p className="font-medium text-foreground">Active Status</p>
                    <p className="text-sm text-muted-foreground">Deactivate user to disable access</p>
                  </div>
                  <Switch
                    checked={editingUser.status === 'active'}
                    onCheckedChange={(checked) => setEditingUser({
                      ...editingUser,
                      status: checked ? 'active' : 'inactive'
                    })}
                  />
                </div>
              </div>

              <button
                onClick={handleUpdateUser}
                className="btn-primary w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default UsersPage;
