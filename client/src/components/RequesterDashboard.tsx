import React, { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.js";

interface TicketSummary {
  id: number;
  ticketNumber: string;
  summary: string;
  status: string;
  itPriority?: string;
  updatedAt: string;
}

interface RequesterMetrics {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  waitingForRequester?: number;
}

interface DashboardData {
  metrics: RequesterMetrics;
  recentTickets: TicketSummary[];
}

interface Props {
  onTicketClick: (ticketId: number) => void;
  onCreateTicket: () => void;
  onViewAll: (filterStatus?: string) => void;
}

export function RequesterDashboard({ onTicketClick, onCreateTicket, onViewAll }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = () => {
    setLoading(true);
    setError("");
    try {
      const p = fetch("/api/dashboards/requester", { method: "GET" });
      if (!p || typeof p.then !== "function") {
        setData({
          metrics: { open: 0, inProgress: 0, resolved: 0, closed: 0, waitingForRequester: 0 },
          recentTickets: []
        });
        setLoading(false);
        return;
      }
      p.then((res) => {
        if (!res.ok) throw new Error("Failed to load requester dashboard");
        return res.json();
      })
        .then((json) => {
          setData({
            metrics: json.metrics || {
              open: json.data?.length || 0,
              inProgress: 0,
              resolved: 0,
              closed: 0,
              waitingForRequester: 0
            },
            recentTickets: json.recentTickets || []
          });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Error loading dashboard");
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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
        return <span className="badge bg-danger bg-opacity-10 text-danger border border-danger">Critical</span>;
      case "High":
        return <span className="badge bg-warning bg-opacity-10 text-dark border border-warning">High</span>;
      case "Medium":
        return <span className="badge bg-primary bg-opacity-10 text-primary border border-primary">Medium</span>;
      case "Low":
        return <span className="badge bg-secondary bg-opacity-10 text-secondary border border-secondary">Low</span>;
      default:
        return <span className="badge bg-light text-muted">Normal</span>;
    }
  };

  const metrics = data?.metrics || { open: 0, inProgress: 0, resolved: 0, closed: 0, waitingForRequester: 0 };
  const recentTickets = data?.recentTickets || [];

  return (
    <div className="requester-dashboard">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h2 className="h4 mb-1 fw-bold text-dark">
            Welcome, {user?.name || "Requester"}!
          </h2>
          <p className="text-muted small mb-0">
            Here's the latest status of your service requests.
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
            <span className="visually-hidden">Loading dashboard metrics...</span>
          </div>
        </div>
      ) : (
        <>
          {/* Metric Cards Row */}
          <div className="row g-3 mb-4">
            <div className="col-6 col-md-3">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #006B3C" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">My Open</span>
                    <i className="bi bi-folder2-open text-success fs-5"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-dark my-2" data-testid="metric-open">
                    {metrics.open}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-success text-decoration-none fw-medium small"
                    onClick={() => onViewAll("Open")}
                    aria-label="View all open tickets"
                  >
                    View all &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #F59E0B" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">In Progress</span>
                    <i className="bi bi-hourglass-split text-warning fs-5"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-dark my-2" data-testid="metric-in-progress">
                    {metrics.inProgress}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-warning text-decoration-none fw-medium small"
                    onClick={() => onViewAll("In Progress")}
                    aria-label="View all in progress tickets"
                  >
                    View all &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #0B7A46" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">Resolved</span>
                    <i className="bi bi-check-circle text-success fs-5"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-dark my-2" data-testid="metric-resolved">
                    {metrics.resolved}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-success text-decoration-none fw-medium small"
                    onClick={() => onViewAll("Resolved")}
                    aria-label="View all resolved tickets"
                  >
                    View all &rarr;
                  </button>
                </div>
              </div>
            </div>

            <div className="col-6 col-md-3">
              <div
                className="card h-100 shadow-sm border-0"
                style={{ backgroundColor: "#FFFFFF", borderLeft: "4px solid #6c757d" }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted small fw-semibold text-uppercase">Closed</span>
                    <i className="bi bi-lock text-secondary fs-5"></i>
                  </div>
                  <h3 className="display-6 fw-bold text-dark my-2" data-testid="metric-closed">
                    {metrics.closed}
                  </h3>
                  <button
                    className="btn btn-sm btn-link p-0 text-secondary text-decoration-none fw-medium small"
                    onClick={() => onViewAll("Closed")}
                    aria-label="View all closed tickets"
                  >
                    View all &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Section */}
          <div className="row g-4">
            {/* Left Column: Recent Tickets */}
            <div className="col-lg-8">
              <div className="card shadow-sm border-0 p-4">
                <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
                  <h5 className="mb-0 fw-bold text-dark">
                    <i className="bi bi-clock-history me-2 text-success"></i>My Recent Tickets
                  </h5>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    onClick={() => onViewAll()}
                    aria-label="View all tickets"
                  >
                    View All Tickets
                  </button>
                </div>

                {recentTickets.length === 0 ? (
                  <div className="text-center py-5 text-muted bg-light rounded-3">
                    <i className="bi bi-inbox fs-2 mb-2 d-block text-muted"></i>
                    <p className="mb-2 fw-medium">You haven't submitted any tickets yet.</p>
                    <p className="small mb-3 text-muted">Need help with something? Submit a new ticket to IT.</p>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={onCreateTicket}
                      aria-label="Create your first ticket"
                    >
                      <i className="bi bi-plus-circle me-1"></i> Create Ticket
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Desktop / Tablet Table */}
                    <div className="table-responsive d-none d-md-block">
                      <table className="table table-hover align-middle mb-0">
                        <thead className="table-light">
                          <tr className="small text-muted text-uppercase">
                            <th scope="col" style={{ width: "22%" }}>Ticket ID</th>
                            <th scope="col" style={{ width: "38%" }}>Summary</th>
                            <th scope="col" style={{ width: "20%" }}>Status</th>
                            <th scope="col" style={{ width: "20%" }} className="text-end">Last Updated</th>
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
                                <div className="text-dark fw-medium text-truncate" style={{ maxWidth: 280 }}>
                                  {t.summary}
                                </div>
                              </td>
                              <td>{getStatusBadge(t.status)}</td>
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
                            <span>{getPriorityBadge(t.itPriority)}</span>
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
              <div className="card shadow-sm border-0 p-4 mb-4">
                <h5 className="mb-3 fw-bold text-dark border-bottom pb-2">
                  <i className="bi bi-lightning-charge me-2 text-warning"></i>Quick Actions
                </h5>
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-success text-start py-2 d-flex align-items-center gap-2"
                    onClick={onCreateTicket}
                    aria-label="Create a new ticket"
                  >
                    <i className="bi bi-plus-circle fs-5"></i>
                    <div>
                      <div className="fw-bold">Create New Ticket</div>
                      <small className="text-white-50">Report an issue or make a request</small>
                    </div>
                  </button>

                  <button
                    className="btn btn-outline-secondary text-start py-2 d-flex align-items-center gap-2"
                    onClick={() => onViewAll()}
                    aria-label="View all my tickets"
                  >
                    <i className="bi bi-card-list fs-5 text-success"></i>
                    <div>
                      <div className="fw-bold text-dark">View My Tickets</div>
                      <small className="text-muted">Browse your complete history</small>
                    </div>
                  </button>
                </div>
              </div>

              {/* Service Desk Information Card */}
              <div className="card shadow-sm border-0 p-3 bg-light">
                <h6 className="fw-bold text-success mb-2">
                  <i className="bi bi-info-circle me-1"></i> Need Urgent Help?
                </h6>
                <p className="small text-muted mb-0">
                  For critical system outages or security incidents, please contact the IT Helpdesk directly at extension <strong>x4357</strong>.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
