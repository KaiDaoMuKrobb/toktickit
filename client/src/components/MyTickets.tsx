import { useState, useEffect } from "react";
import { Category } from "../api.js";

interface Ticket {
  id: number;
  ticketNumber: string;
  summary: string;
  currentStatus: string;
  updatedAt: string;
  category: { id: number; name: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface Props {
  requesterId: number;
}

export function MyTickets({ requesterId }: Props) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [meta, setMeta] = useState<Meta>({ total: 0, page: 1, limit: 10, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  // Fetch reference categories
  useEffect(() => {
    fetch("http://localhost:3000/api/categories")
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

    fetch(`http://localhost:3000/api/tickets?${params.toString()}`, {
      headers: { "X-Development-Requester-Id": String(requesterId) }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch tickets");
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
  }, [requesterId, page, categoryFilter, statusFilter]);

  // Handle Search submit explicitly to prevent re-fetching on every keystroke
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to page 1 on new search
    fetchTickets();
  };

  return (
    <div className="card shadow-sm border-0">
      <div className="card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center">
        <h2 className="h4 mb-0" style={{ color: "#006B3C" }}>My Tickets</h2>
      </div>
      
      <div className="card-body bg-light">
        <form className="row g-2 mb-4" onSubmit={handleSearch}>
          <div className="col-md-5">
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search by summary..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <select className="form-select" value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}>
              <option value="">All Categories</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="col-md-2">
            <select className="form-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              <option value="New">New</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
          <div className="col-md-2 d-grid">
            <button type="submit" className="btn text-white" style={{ backgroundColor: "#006B3C" }}>Search</button>
          </div>
        </form>

        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-5 bg-white rounded border">
            <p className="text-muted mb-0">
              {search || categoryFilter || statusFilter 
                ? "No matching tickets found." 
                : "You haven't submitted any tickets yet. Click '+ Create Ticket' to get started."}
            </p>
          </div>
        ) : (
          <div className="table-responsive bg-white rounded border">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Ticket No.</th>
                  <th>Summary</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map(ticket => (
                  <tr key={ticket.id} style={{ cursor: "pointer" }}>
                    <td className="fw-bold text-success">{ticket.ticketNumber}</td>
                    <td>{ticket.summary}</td>
                    <td>{ticket.category?.name}</td>
                    <td>
                      <span className={`badge ${ticket.currentStatus === 'New' ? 'bg-primary' : 'bg-secondary'}`}>
                        {ticket.currentStatus}
                      </span>
                    </td>
                    <td>{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="d-flex justify-content-between align-items-center mt-4">
            <p className="text-muted mb-0 small">
              Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} tickets
            </p>
            <nav>
              <ul className="pagination mb-0">
                <li className={`page-item ${meta.page === 1 ? 'disabled' : ''}`}>
                  <button className="page-link text-success" onClick={() => setPage(p => Math.max(1, p - 1))}>Previous</button>
                </li>
                {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (
                  <li key={p} className={`page-item ${p === meta.page ? 'active' : ''}`}>
                    <button 
                      className={`page-link ${p === meta.page ? 'bg-success border-success text-white' : 'text-success'}`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${meta.page === meta.totalPages ? 'disabled' : ''}`}>
                  <button className="page-link text-success" onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}>Next</button>
                </li>
              </ul>
            </nav>
          </div>
        )}
      </div>
    </div>
  );
}
