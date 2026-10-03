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
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setIsSubmitting(true);
    setErrorMsg("");
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
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg("");
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
      
      if (formData.password) {
        const pwRes = await fetch(`/api/users/${selectedUser.id}/reset-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword: formData.password })
        });
        if (!pwRes.ok) {
          const errorData = await pwRes.json();
          throw new Error("User updated, but failed to reset password: " + (errorData.error || ""));
        }
      }

      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
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
    setErrorMsg("");
    setShowCreateModal(true);
  };

  const openEditModal = (u: any) => {
    setSelectedUser(u);
    setFormData({ ...formData, name: u.name, email: u.email, role: u.role, isActive: u.isActive });
    setErrorMsg("");
    setShowEditModal(true);
  };



  if (user?.role !== "Administrator") {
    return <div className="alert alert-danger mt-4">Access Denied: Administrators only.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Administrator User Management</h2>
        <button className="btn btn-success" onClick={openCreateModal}>+ Create New User</button>
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
        <div className="text-center py-5"><div className="spinner-border text-success" /></div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card shadow-sm border-0 mb-5">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4">ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="pe-4 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="ps-4 text-muted fw-medium">#{u.id}</td>
                    <td className="fw-bold">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      {u.role === 'Requester' && <span className="badge" style={{ backgroundColor: '#E3F2FD', color: '#000' }}>Requester</span>}
                      {u.role === 'IT Staff' && <span className="badge" style={{ backgroundColor: '#0B7A46', color: '#fff' }}>IT Staff</span>}
                      {u.role === 'Administrator' && <span className="badge" style={{ backgroundColor: '#37474F', color: '#fff' }}>Administrator</span>}
                    </td>
                    <td>
                      <div className="form-check form-switch d-inline-block">
                        <input 
                          type="checkbox" 
                          className="form-check-input" 
                          style={{ cursor: "pointer" }}
                          checked={u.isActive} 
                          onChange={() => handleToggleActive(u)} 
                          title={u.isActive ? "Deactivate User" : "Activate User"}
                        />
                      </div>
                    </td>
                    <td className="pe-4 text-end">
                      <button className="btn btn-sm btn-outline-secondary px-3" onClick={() => openEditModal(u)}>Edit</button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
                {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
                <div className="mb-3">
                  <label htmlFor="create-name" className="form-label">Full Name <span className="text-danger">*</span></label>
                  <input id="create-name" type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="create-email" className="form-label">Email Address <span className="text-danger">*</span></label>
                  <input id="create-email" type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="create-role" className="form-label">Role <span className="text-danger">*</span></label>
                  <select id="create-role" className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Requester">Requester</option>
                    <option value="IT Staff">IT Staff</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Active</label>
                  <div className="form-check form-switch fs-5">
                    <input type="checkbox" className="form-check-input" id="isActiveCheck" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                    <label className="form-check-label ms-2 fs-6" htmlFor="isActiveCheck">{formData.isActive ? 'Yes' : 'No'}</label>
                  </div>
                </div>
                <div className="mb-3">
                  <label htmlFor="create-password" className="form-label">Initial Password <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input id="create-password" type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required minLength={8} />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-8) })}>Auto-Generate</button>
                  </div>
                  <small className="text-muted">Must be at least 8 characters. User will be required to change it.</small>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="sendEmailCheck" defaultChecked />
                  <label className="form-check-label" htmlFor="sendEmailCheck">Send password reset email (mock UI)</label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create User"}
                </button>
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
                {errorMsg && <div className="alert alert-danger py-2">{errorMsg}</div>}
                <div className="mb-3">
                  <label htmlFor="edit-name" className="form-label">Full Name <span className="text-danger">*</span></label>
                  <input id="edit-name" type="text" className="form-control" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-email" className="form-label">Email Address <span className="text-danger">*</span></label>
                  <input id="edit-email" type="email" className="form-control" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label htmlFor="edit-role" className="form-label">Role <span className="text-danger">*</span></label>
                  <select id="edit-role" className="form-select" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
                    <option value="Requester">Requester</option>
                    <option value="IT Staff">IT Staff</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Active</label>
                  <div className="form-check form-switch fs-5">
                    <input type="checkbox" className="form-check-input" id="isActiveCheckEdit" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} />
                    <label className="form-check-label ms-2 fs-6" htmlFor="isActiveCheckEdit">{formData.isActive ? 'Yes' : 'No'}</label>
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <label htmlFor="edit-password" className="form-label">Set New Initial Password</label>
                  <div className="input-group">
                    <input id="edit-password" type="password" className="form-control" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} minLength={8} placeholder="Leave blank to keep current password" />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setFormData({ ...formData, password: Math.random().toString(36).slice(-8) })}>Auto-Generate</button>
                  </div>
                  <small className="text-muted">If provided, the user's password will be reset and they must change it upon next login.</small>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-success" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
