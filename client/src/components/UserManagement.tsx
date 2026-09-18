import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext";

export function UserManagement() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filter states
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Requester",
    isActive: true,
    password: "" // Only for create/reset
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.append("search", search);
      if (roleFilter) query.append("role", roleFilter);

      const res = await fetch(`/api/users?${query.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create user");
      }
      setShowCreateModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive
        })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update user");
      }
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: formData.password })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to reset password");
      }
      setShowResetModal(false);
      alert("Password reset successfully.");
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleActive = async (userToToggle: any) => {
    if (userToToggle.id === user?.id && userToToggle.isActive) {
      alert("Cannot deactivate your own account");
      return;
    }
    try {
      const res = await fetch(`/api/users/${userToToggle.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !userToToggle.isActive })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to toggle activation");
      }
      fetchUsers();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openCreateModal = () => {
    setFormData({ name: "", email: "", role: "Requester", isActive: true, password: "" });
    setShowCreateModal(true);
  };

  const openEditModal = (u: any) => {
    setSelectedUser(u);
    setFormData({ ...formData, name: u.name, email: u.email, role: u.role, isActive: u.isActive });
    setShowEditModal(true);
  };

  const openResetModal = (u: any) => {
    setSelectedUser(u);
    setFormData({ ...formData, password: "" });
    setShowResetModal(true);
  };

  if (user?.role !== "Administrator") {
    return <div className="alert alert-danger mt-4">Access Denied: Administrators only.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administrator User Management</h2>
        <button className="btn btn-primary" onClick={openCreateModal}>+ Create New User</button>
      </div>

      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            <option value="Requester">Requester</option>
            <option value="IT Staff">IT Staff</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <span className={`badge ${u.isActive ? "bg-success" : "bg-danger"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEditModal(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-warning me-2" onClick={() => openResetModal(u)}>Reset PW</button>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-outline-danger' : 'btn-outline-success'}`}
                      onClick={() => handleToggleActive(u)}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-muted">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleCreate}>
              <div className="modal-header">
                <h5 className="modal-title">Create New User</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Requester">Requester</option>
                    <option value="IT Staff">IT Staff</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Initial Password</label>
                  <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="isActiveCheck" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                  <label className="form-check-label" htmlFor="isActiveCheck">Active Account</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleEdit}>
              <div className="modal-header">
                <h5 className="modal-title">Edit User ({selectedUser.email})</h5>
                <button type="button" className="btn-close" onClick={() => setShowEditModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Requester">Requester</option>
                    <option value="IT Staff">IT Staff</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div className="form-check">
                  <input type="checkbox" className="form-check-input" id="isActiveCheckEdit" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                  <label className="form-check-label" htmlFor="isActiveCheckEdit">Active Account</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResetModal && selectedUser && (
        <div className="modal d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <form className="modal-content" onSubmit={handleResetPassword}>
              <div className="modal-header">
                <h5 className="modal-title">Reset Password for {selectedUser.email}</h5>
                <button type="button" className="btn-close" onClick={() => setShowResetModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">New Password</label>
                  <input type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
                  <small className="text-muted">User will be required to change this upon next login.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowResetModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-danger">Reset Password</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
