import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { users as initialUsers, User } from '@/lib/mockData';
import { Plus, X, Edit2, History } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'sales' as 'admin' | 'sales',
    commissionRate: 10,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: String(users.length + 1),
      name: formData.name,
      username: formData.username,
      role: formData.role,
      commissionRate: formData.commissionRate,
      status: 'active',
      avatar: formData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      rateHistory: [{ date: new Date().toISOString().split('T')[0], rate: formData.commissionRate }],
    };
    setUsers([...users, newUser]);
    setShowModal(false);
    setFormData({ name: '', username: '', password: '', role: 'sales', commissionRate: 10 });
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(users.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
  };

  const toggleUserStatus = (userId: string) => {
    setUsers(users.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'inactive' as const : 'active' as const } : u
    ));
  };

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

        <div className="dashboard-card overflow-hidden p-0">
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
                {users.map((user) => (
                  <tr key={user.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                          {user.avatar}
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
                      <span className="font-bold text-lg text-primary">{user.commissionRate}%</span>
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
                ))}
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
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1">
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Drawer */}
      <Sheet open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
        <SheetContent className="bg-card sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Edit User</SheetTitle>
          </SheetHeader>
          
          {editingUser && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-xl font-medium text-primary">
                  {editingUser.avatar}
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
                  <label className="form-label">New Password (leave blank to keep)</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="form-input"
                  />
                </div>

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

                {/* Rate History */}
                {editingUser.rateHistory && editingUser.rateHistory.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <label className="form-label mb-0">Rate History</label>
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {editingUser.rateHistory.map((history, index) => (
                        <div key={index} className="flex justify-between text-sm p-2 rounded bg-secondary/50">
                          <span className="text-muted-foreground">{history.date}</span>
                          <span className="font-medium text-primary">{history.rate}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={handleUpdateUser} className="btn-primary w-full">
                Save Changes
              </button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
};

export default UsersPage;
