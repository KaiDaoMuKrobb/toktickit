import { useState, useEffect } from "react";
import { Category } from "../api.js";

interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  currentStatus: string;
  requestedPriority: string;
  itPriority: string;
  updatedAt: string;
  category: { id: number; name: string };
  owner: { id: number; name: string } | null;
  requester: { id: number; name: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  onTicketClick: (ticketId: number) => void;
}

export function StaffTicketQueue({ onTicketClick }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [page, setPage] = useState(1);

  // Fetch reference categories
  useEffect(() => {
    fetch("/api/categories")
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(console.error);
  }, []);

  // Fetch tickets
  const fetchTickets = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.append("page", String(page));
    params.append("limit", "10");
    if (search) params.append("search", search);
    if (categoryFilter) params.append("category", categoryFilter);
    if (statusFilter) params.append("status", statusFilter);
    if (priorityFilter) params.append("priority", priorityFilter);

    fetch(`/api/tickets/queue?${params.toString()}`, {
      method: "GET"
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch queue");
        return res.json();
      })
      .then(data => {
        setTickets(data.data);
        setMeta(data.meta);
        setError("");
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryFilter, statusFilter, priorityFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTickets();
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0" style={{ color: "#006B3C" }}>IT Staff Ticket Queue</h2>
      </div>
      
      <div className="card-body bg-light">
        <form className="row g-2 mb-4" onSubmit={handleSearch}>
          <div className="col-md-3">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search ticket no or summary..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-2">
            <select className="form-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Waiting for Requester">Waiting for Requester</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value); setPage(1); }}>
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          <div className="col-md-3 d-flex gap-2">
            <button type="submit" className="btn btn-success flex-grow-1">Search</button>
            <button type="button" className="btn btn-outline-secondary" onClick={() => {
              setSearch(""); setCategoryFilter(""); setStatusFilter(""); setPriorityFilter(""); setPage(1);
              setTimeout(fetchTickets, 0);
            }}>Clear</button>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="card shadow-sm border-0 mb-4">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-0">No tickets found.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">Ticket No.</th>
                    <th>Created</th>
                    <th>Summary</th>
                    <th>Category</th>
                    <th>IT Priority</th>
                    <th>Status</th>
                    <th className="pe-4">Owner</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map(ticket => (
                    <tr 
                      key={ticket.id} 
                      onClick={() => onTicketClick(ticket.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td className="ps-4 fw-bold text-success">{ticket.ticketNumber}</td>
                      <td className="text-muted small">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                      <td className="fw-medium">{ticket.summary}</td>
                      <td>{ticket.category?.name}</td>
                      <td>
                        <span className={`badge ${ticket.itPriority === 'High' || ticket.itPriority === 'Critical' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {ticket.itPriority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${ticket.currentStatus === 'New' ? 'bg-primary' : ticket.currentStatus === 'Closed' ? 'bg-secondary' : 'bg-success'}`}>
                          {ticket.currentStatus}
                        </span>
                      </td>
                      <td className="pe-4">
                        {ticket.owner ? (
                          <div className="d-flex align-items-center">
                            <div className="bg-success text-white rounded-circle d-flex justify-content-center align-items-center me-2" style={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                              {ticket.owner.name.charAt(0)}
                            </div>
                            <span className="small">{ticket.owner.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted fst-italic small">Unassigned</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {meta.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-3">
            <span className="text-muted small">
              Showing page {meta.page} of {meta.totalPages} (Total {meta.total} tickets)
            </span>
            <div className="btn-group">
              <button 
                className="btn btn-sm btn-outline-secondary" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                &laquo; Prev
              </button>
              <button 
                className="btn btn-sm btn-outline-secondary" 
                disabled={page === meta.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next &raquo;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
