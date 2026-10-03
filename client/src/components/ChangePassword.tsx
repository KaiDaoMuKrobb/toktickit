import React, { useState } from "react";
import { useAuth } from "../AuthContext.js";

export function ChangePassword() {
  const { user, fetchUser, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      if (res.ok) {
        // Refetch user to clear mustChangePassword flag
        await fetchUser();
      } else {
        const data = await res.json();
        setError(data.message || "Failed to change password.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow-sm border-0" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="h4 text-warning mb-2">Password Update Required</h1>
            <p className="text-muted small">
              Welcome, {user?.name}. Please change your initial password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="currentPassword" className="form-label fw-bold">Current Password</label>
              <input 
                id="currentPassword"
                type="password" 
                className="form-control" 
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="mb-3">
              <label htmlFor="newPassword" className="form-label fw-bold">New Password</label>
              <input 
                id="newPassword"
                type="password" 
                className="form-control" 
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
              <div className="form-text">Minimum 8 characters.</div>
            </div>

            <div className="mb-4">
              <label htmlFor="confirmPassword" className="form-label fw-bold">Confirm New Password</label>
              <input 
                id="confirmPassword"
                type="password" 
                className="form-control" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="alert alert-danger py-2" role="alert">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-success w-100 mb-2" 
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
            <button 
              type="button" 
              className="btn btn-link text-decoration-none text-muted w-100" 
              onClick={logout}
              disabled={loading}
            >
              Cancel and Logout
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
