import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
export function MyTickets({ requesterId, onTicketClick }) {
    const [tickets, setTickets] = useState([]);
    const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState([]);
    // Filters
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
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
        if (search)
            params.append("search", search);
        if (categoryFilter)
            params.append("category", categoryFilter);
        if (statusFilter)
            params.append("status", statusFilter);
        fetch(`/api/tickets?${params.toString()}`, {
            method: "GET"
        })
            .then(res => {
            if (!res.ok)
                throw new Error("Failed to fetch tickets");
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
    const handleSearch = (e) => {
        e.preventDefault();
        setPage(1); // Reset to page 1 on new search
        fetchTickets();
    };
    return (_jsxs("div", { className: "card shadow-sm border-0", children: [_jsx("div", { className: "card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center", children: _jsx("h2", { className: "h4 mb-0", style: { color: "#006B3C" }, children: "My Tickets" }) }), _jsxs("div", { className: "card-body bg-light", children: [_jsxs("form", { className: "row g-2 mb-4", onSubmit: handleSearch, children: [_jsx("div", { className: "col-md-5", children: _jsx("input", { type: "text", className: "form-control", placeholder: "Search by summary...", value: search, onChange: e => setSearch(e.target.value) }) }), _jsx("div", { className: "col-md-3", children: _jsxs("select", { className: "form-select", value: categoryFilter, onChange: e => { setCategoryFilter(e.target.value); setPage(1); }, children: [_jsx("option", { value: "", children: "All Categories" }), categories.map(c => _jsx("option", { value: c.id, children: c.name }, c.id))] }) }), _jsx("div", { className: "col-md-2", children: _jsxs("select", { className: "form-select", value: statusFilter, onChange: e => { setStatusFilter(e.target.value); setPage(1); }, children: [_jsx("option", { value: "", children: "All Statuses" }), _jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Resolved", children: "Resolved" })] }) }), _jsx("div", { className: "col-md-2 d-grid", children: _jsx("button", { type: "submit", className: "btn text-white", style: { backgroundColor: "#006B3C" }, children: "Search" }) })] }), error && _jsx("div", { className: "alert alert-danger", children: error }), loading ? (_jsx("div", { className: "text-center py-5", children: _jsx("div", { className: "spinner-border text-success", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Loading..." }) }) })) : tickets.length === 0 ? (_jsx("div", { className: "text-center py-5 bg-white rounded border", children: _jsx("p", { className: "text-muted mb-0", children: search || categoryFilter || statusFilter
                                ? "No matching tickets found."
                                : "You haven't submitted any tickets yet. Click '+ Create Ticket' to get started." }) })) : (_jsx("div", { className: "table-responsive bg-white rounded border", children: _jsxs("table", { className: "table table-hover align-middle mb-0", children: [_jsx("thead", { className: "table-light", children: _jsxs("tr", { children: [_jsx("th", { children: "Ticket No." }), _jsx("th", { children: "Summary" }), _jsx("th", { children: "Category" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Last Updated" })] }) }), _jsx("tbody", { children: tickets.map(ticket => (_jsxs("tr", { style: { cursor: "pointer" }, onClick: () => onTicketClick?.(ticket.id), children: [_jsx("td", { className: "fw-bold text-success", children: ticket.ticketNumber }), _jsx("td", { children: ticket.summary }), _jsx("td", { children: ticket.category?.name }), _jsx("td", { children: _jsx("span", { className: `badge ${ticket.currentStatus === 'New' ? 'bg-primary' : 'bg-secondary'}`, children: ticket.currentStatus }) }), _jsx("td", { children: new Date(ticket.updatedAt).toLocaleDateString() })] }, ticket.id))) })] }) })), meta.totalPages > 1 && (_jsxs("div", { className: "d-flex justify-content-between align-items-center mt-4", children: [_jsxs("p", { className: "text-muted mb-0 small", children: ["Showing ", (meta.page - 1) * meta.limit + 1, " to ", Math.min(meta.page * meta.limit, meta.total), " of ", meta.total, " tickets"] }), _jsx("nav", { children: _jsxs("ul", { className: "pagination mb-0", children: [_jsx("li", { className: `page-item ${meta.page === 1 ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link text-success", onClick: () => setPage(p => Math.max(1, p - 1)), children: "Previous" }) }), Array.from({ length: meta.totalPages }, (_, i) => i + 1).map(p => (_jsx("li", { className: `page-item ${p === meta.page ? 'active' : ''}`, children: _jsx("button", { className: `page-link ${p === meta.page ? 'bg-success border-success text-white' : 'text-success'}`, onClick: () => setPage(p), children: p }) }, p))), _jsx("li", { className: `page-item ${meta.page === meta.totalPages ? 'disabled' : ''}`, children: _jsx("button", { className: "page-link text-success", onClick: () => setPage(p => Math.min(meta.totalPages, p + 1)), children: "Next" }) })] }) })] }))] })] }));
}
