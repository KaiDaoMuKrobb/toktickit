import React, { useState } from "react";
import { useAuth } from "../AuthContext.js";

export function Login() {
  const { fetchUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      if (res.ok) {
        await fetchUser();
      } else {
        const data = await res.json();
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh" }}>
      <div className="card shadow-sm border-0" style={{ maxWidth: "400px", width: "100%" }}>
        <div className="card-body p-4">
          <div className="text-center mb-4">
            <h1 className="h3">
              TokTickIT <span className="text-success">Login</span>
            </h1>
            <p className="text-muted">Sign in to the IT Service Desk</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-bold">Email address</label>
              <input 
                id="email"
                type="email" 
                className="form-control" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-bold">Password</label>
              <input 
                id="password"
                type="password" 
                className="form-control" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              className="btn btn-success w-100" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
