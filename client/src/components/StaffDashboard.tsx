import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.js";

interface TicketSummary {
  id: number;
  ticketNumber: string;
  summary: string;
  status: string;
  itPriority?: string;
  updatedAt: string;
  owner?: { id: number; name: string } | null;
  requester?: { id: number; name: string } | null;
}

interface StaffMetrics {
  unassigned: number;
  myAssigned: number;
  new: number;
  open: number;
  inProgress: number;
  waitingForRequester: number;
  resolved: number;
  closed: number;
}

interface PriorityCounts {
  Critical: number;
  High: number;
  Medium: number;
  Low: number;
}

interface UserMetrics {
  total: number;
  activeRequesters: number;
  activeStaff: number;
  activeAdmins: number;
  inactive: number;
}

interface DashboardData {
  metrics: StaffMetrics;
  byPriority?: PriorityCounts;
  userMetrics?: UserMetrics;
  recentTickets: TicketSummary[];
}

interface Props {
  onTicketClick: (ticketId: number) => void;
  onViewQueue: (filter?: string) => void;
  onViewAdmin?: () => void;
}

export function StaffDashboard({ onTicketClick, onViewQueue, onViewAdmin }: Props) {
  const { user } = useAuth();
  const isAdmin = user?.role === "Administrator";
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = () => {
    setLoading(true);
    setError("");
    const endpoint = isAdmin ? "/api/dashboards/admin" : "/api/dashboards/staff";
    try {
      const p = fetch(endpoint, { method: "GET" });
      if (!p || typeof p.then !== "function") {
        setData({
          metrics: {
            unassigned: 0,
            myAssigned: 0,
            new: 0,
            open: 0,
            inProgress: 0,
            waitingForRequester: 0,
            resolved: 0,
            closed: 0
          },
          recentTickets: []
        });
        setLoading(false);
        return;
      }
      p.then((res) => {
        if (!res.ok) throw new Error("Failed to load staff dashboard");
        return res.json();
      })
        .then((json) => {
          setData({
            metrics: json.metrics || {
              unassigned: 0,
              myAssigned: 0,
              new: 0,
              open: 0,
              inProgress: 0,
              waitingForRequester: 0,
              resolved: 0,
              closed: 0
            },
            byPriority: json.byPriority,
            userMetrics: json.userMetrics,
            recentTickets: json.recentTickets || []
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Error loading staff dashboard");
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [isAdmin]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "New":
        return <span className="badge bg-secondary">● New</span>;
      case "Open":
        return <span className="badge bg-primary">○ Open</span>;
      case "In Progress":
        return <span className="badge bg-warning text-dark">⏳ In Progress</span>;
      case "Waiting for Requester":
        return <span className="badge bg-info text-dark">💬 Waiting</span>;
      case "Resolved":
        return <span className="badge bg-success">✓ Resolved</span>;
      case "Closed":
        return <span className="badge bg-dark">🔒 Closed</span>;
      case "Cancelled":
        return <span className="badge bg-danger">✕ Cancelled</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    switch (priority) {
      case "Critical":
        return <span className="badge bg-danger">Critical</span>;
      case "High":
        return <span className="badge bg-warning text-dark">High</span>;
      case "Medium":
        return <span className="badge bg-primary">Medium</span>;
      case "Low":
        return <span className="badge bg-secondary">Low</span>;
      default:
        return <span className="badge bg-light text-muted">Normal</span>;
    }
  };

  const metrics = data?.metrics || {
    unassigned: 0,
    myAssigned: 0,
    new: 0,
    open: 0,
    inProgress: 0,
    waitingForRequester: 0,
    resolved: 0,
    closed: 0
  };
  const recentTickets = data?.recentTickets || [];
  const byPriority = data?.byPriority;
  const userMetrics = data?.userMetrics;

  return (
    <div className="staff-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 mb-1 fw-bold text-dark">
            Welcome back, {user?.name || "Staff"}!
          </h2>
          <p className="text-muted small mb-0">
            Here's what's happening with your queue today.
          </p>
        </div>
        <button
          className="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
          onClick={fetchDashboard}
          disabled={loading}
          aria-label="Refresh Dashboard"
        >
          <i className="bi bi-arrow-clockwise"></i> Refresh
        </button>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-center py-5" aria-live="polite">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading operational dashboard...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Operational Metrics Row */}
          <div className="row g-3 mb-4">
            {/* Unassigned */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #DC2626" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">Unassigned</span>
                    <i className="bi bi-person-x text-danger fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-unassigned">
                    {metrics.unassigned}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-danger text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("Unassigned")}
                    aria-label="Filter queue by unassigned tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* My Assigned */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #006B3C" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">My Assigned</span>
                    <i className="bi bi-person-check text-success fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-my-assigned">
                    {metrics.myAssigned}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-success text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("My Assigned")}
                    aria-label="View my assigned tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* New */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #6c757d" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">New</span>
                    <i className="bi bi-star text-secondary fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-new">
                    {metrics.new}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-secondary text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("New")}
                    aria-label="View new tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Open */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #2563EB" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">Open</span>
                    <i className="bi bi-folder2-open text-primary fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-open">
                    {metrics.open}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-primary text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("Open")}
                    aria-label="View open tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* In Progress */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #F59E0B" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">In Progress</span>
                    <i className="bi bi-hourglass-split text-warning fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-in-progress">
                    {metrics.inProgress}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-warning text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("In Progress")}
                    aria-label="View in progress tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>

            {/* Waiting for Requester */}
            <div className="col-6 col-md-4 col-lg">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #6366F1" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">Waiting Req.</span>
                    <i className="bi bi-chat-dots text-info fs-5"></i>
                  </div>
                  <h3 className="h2 fw-bold text-dark my-2" data-testid="metric-waiting">
                    {metrics.waitingForRequester}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-info text-decoration-none fw-medium small"
                    onClick={() => onViewQueue("Waiting for Requester")}
                    aria-label="View waiting for requester tickets"
                  >
                    View All &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Administrator User Metrics Section (If Admin) */}
          {isAdmin && userMetrics && (
            <div className="card shadow-sm border-0 p-4 mb-4" style={{ backgroundColor: "#F8FAFC", borderLeft: "4px solid #37474F" }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fw-bold text-dark">
                  <i className="bi bi-people me-2 text-dark"></i>Administrator Overview: User Accounts
                </h5>
                {onViewAdmin && (
                  <button className="btn btn-sm btn-outline-dark" onClick={onViewAdmin} aria-label="Go to User Management">
                    User Management &rarr;
                  </button>
                )}
              </div>
              <div className="row g-3 text-center">
                <div className="col-4 col-md">
                  <div className="p-2 border rounded bg-white">
                    <small className="text-muted text-uppercase fw-semibold d-block">Total Users</small>
                    <span className="fs-4 fw-bold text-dark" data-testid="user-total">{userMetrics.total}</span>
                  </div>
                </div>
                <div className="col-4 col-md">
                  <div className="p-2 border rounded bg-white">
                    <small className="text-muted text-uppercase fw-semibold d-block">Active Requesters</small>
                    <span className="fs-4 fw-bold text-primary" data-testid="user-requesters">{userMetrics.activeRequesters}</span>
                  </div>
                </div>
                <div className="col-4 col-md">
                  <div className="p-2 border rounded bg-white">
                    <small className="text-muted text-uppercase fw-semibold d-block">Active Staff</small>
                    <span className="fs-4 fw-bold text-success" data-testid="user-staff">{userMetrics.activeStaff}</span>
                  </div>
                </div>
                <div className="col-6 col-md">
                  <div className="p-2 border rounded bg-white">
                    <small className="text-muted text-uppercase fw-semibold d-block">Active Admins</small>
                    <span className="fs-4 fw-bold text-dark" data-testid="user-admins">{userMetrics.activeAdmins}</span>
                  </div>
                </div>
                <div className="col-6 col-md">
                  <div className="p-2 border rounded bg-white">
                    <small className="text-muted text-uppercase fw-semibold d-block">Inactive Accounts</small>
                    <span className="fs-4 fw-bold text-secondary" data-testid="user-inactive">{userMetrics.inactive}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Priority Breakdown Bar (Optional IT Staff Operational Summary) */}
          {byPriority && (
            <div className="card shadow-sm border-0 p-3 mb-4 bg-white">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small text-muted fw-bold text-uppercase">
                  <i className="bi bi-filter-circle me-1"></i>Active Queue By Priority:
                </span>
              </div>
              <div className="d-flex gap-3 flex-wrap">
                <span className="badge bg-danger bg-opacity-10 text-danger border border-danger px-3 py-2 fs-6">
                  Critical: <strong>{byPriority.Critical}</strong>
                </span>
                <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 fs-6">
                  High: <strong>{byPriority.High}</strong>
                </span>
                <span className="badge bg-primary bg-opacity-10 text-primary border border-primary px-3 py-2 fs-6">
                  Medium: <strong>{byPriority.Medium}</strong>
                </span>
                <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary px-3 py-2 fs-6">
                  Low: <strong>{byPriority.Low}</strong>
                </span>
              </div>
            </div>
          )}

          {/* Main 2-Column Section */}
          <div className="row g-4">
            {/* Left Column: Recent Active Tickets */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 p-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-activity me-2 text-success"></i>Recent Active Tickets
                  </h5>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => onViewQueue()}
                    aria-label="View full ticket queue"
                  >
                    View Full Queue
                  </button>
                </div>

                {recentTickets.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light rounded-3">
                    <i className="bi bi-check2-circle fs-2 mb-2 d-block text-success"></i>
                    <p className="mb-0 fw-medium">All caught up! No active tickets in the queue.</p>
                  </div>
                ) : (
                  <div>
                    {/* Desktop / Tablet Table */}
                    <div className="table-responsive d-none d-md-block">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr className="small text-muted text-uppercase">
                            <th scope="col" style={{ width: "20%" }}>Ticket ID</th>
                            <th scope="col" style={{ width: "35%" }}>Summary</th>
                            <th scope="col" style={{ width: "15%" }}>Status</th>
                            <th scope="col" style={{ width: "15%" }}>Assigned To</th>
                            <th scope="col" style={{ width: "15%" }} className="text-end">Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentTickets.map((t) => (
                            <tr
                              key={t.id}
                              style={{ cursor: "pointer" }}
                              onClick={() => onTicketClick(t.id)}
                              tabIndex={0}
                              role="button"
                              aria-label={`Open ticket ${t.ticketNumber}`}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  onTicketClick(t.id);
                                }
                              }}
                            >
                              <td className="fw-bold text-success">{t.ticketNumber}</td>
                              <td>
                                <div className="text-dark fw-medium text-truncate" style={{ maxWidth: 260 }}>
                                  {t.summary}
                                </div>
                              </td>
                              <td>{getStatusBadge(t.status)}</td>
                              <td>
                                {t.owner ? (
                                  <span className="badge bg-success bg-opacity-10 text-success">
                                    {t.owner.name}
                                  </span>
                                ) : (
                                  <span className="badge bg-danger bg-opacity-10 text-danger">
                                    Unassigned
                                  </span>
                                )}
                              </td>
                              <td className="text-end small text-muted">
                                {new Date(t.updatedAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Stacked Card List */}
                    <div className="d-md-none d-flex flex-column gap-2">
                      {recentTickets.map((t) => (
                        <div
                          key={t.id}
                          className="card border p-3 bg-white shadow-sm"
                          style={{ cursor: "pointer" }}
                          onClick={() => onTicketClick(t.id)}
                          tabIndex={0}
                          role="button"
                          aria-label={`Open ticket ${t.ticketNumber}`}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <span className="fw-bold text-success">{t.ticketNumber}</span>
                            {getStatusBadge(t.status)}
                          </div>
                          <p className="fw-medium text-dark mb-2">{t.summary}</p>
                          <div className="d-flex justify-content-between align-items-center small text-muted">
                            <span>
                              {t.owner ? `Assigned: ${t.owner.name}` : "Unassigned"}
                            </span>
                            <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Quick Actions */}
            <div className="col-lg-4">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="mb-3 fw-bold text-dark border-bottom pb-2">
                  <i className="bi bi-lightning-charge me-2 text-warning"></i>Quick Actions
                </h5>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-success text-start py-2 d-flex align-items-center gap-2"
                    onClick={() => onViewQueue("My Assigned")}
                    aria-label="View My Assigned Queue"
                  >
                    <i className="bi bi-person-check fs-5"></i>
                    <div>
                      <div className="fw-bold">My Assigned Queue</div>
                      <small className="text-white-50">Tickets currently assigned to you</small>
                    </div>
                  </button>

                  <button
                    className="btn btn-outline-danger text-start py-2 d-flex align-items-center gap-2"
                    onClick={() => onViewQueue("Unassigned")}
                    aria-label="View Unassigned Tickets"
                  >
                    <i className="bi bi-person-x fs-5"></i>
                    <div>
                      <div className="fw-bold text-danger">Unassigned Tickets</div>
                      <small className="text-muted">Tickets waiting for an owner</small>
                    </div>
                  </button>

                  <button
                    className="btn btn-outline-secondary text-start py-2 d-flex align-items-center gap-2"
                    onClick={() => onViewQueue()}
                    aria-label="Browse full service queue"
                  >
                    <i className="bi bi-card-checklist fs-5 text-success"></i>
                    <div>
                      <div className="fw-bold text-dark">Full Ticket Queue</div>
                      <small className="text-muted">All active tickets across the team</small>
                    </div>
                  </button>

                  {isAdmin && onViewAdmin && (
                    <button
                      className="btn btn-outline-dark text-start py-2 d-flex align-items-center gap-2 mt-2 border-2"
                      onClick={onViewAdmin}
                      aria-label="Manage Users"
                    >
                      <i className="bi bi-people-fill fs-5"></i>
                      <div>
                        <div className="fw-bold">Manage Users</div>
                        <small className="text-muted">Configure staff and requester accounts</small>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
