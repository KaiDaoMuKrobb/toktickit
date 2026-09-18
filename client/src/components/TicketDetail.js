import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { AttachmentSection } from "./AttachmentSection.js";
import { useAuth } from "../AuthContext.js";
export function TicketDetail({ ticketId, requesterId, onBack }) {
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [communications, setCommunications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newComment, setNewComment] = useState("");
    const [newNote, setNewNote] = useState("");
    // IT Staff Edit States
    const [editStatus, setEditStatus] = useState("");
    const [editPriority, setEditPriority] = useState("");
    const [isUpdating, setIsUpdating] = useState(false);
    const isStaff = user?.role === "IT Staff" || user?.role === "Administrator";
    const isRequester = user?.role === "Requester";
    const fetchTicket = () => {
        fetch(`/api/tickets/${ticketId}`, { method: "GET" })
            .then(res => {
            if (!res.ok)
                throw new Error("Failed to load ticket");
            return res.json();
        })
            .then(data => {
            setTicket(data);
            setEditStatus(data.currentStatus);
            setEditPriority(data.itPriority);
            setLoading(false);
        })
            .catch(err => {
            setError(err.message);
            setLoading(false);
        });
    };
    const fetchCommunications = () => {
        fetch(`/api/tickets/${ticketId}/communications`, { method: "GET" })
            .then(res => {
            if (!res.ok)
                throw new Error("Failed to load communications");
            return res.json();
        })
            .then(data => setCommunications(data))
            .catch(console.error);
    };
    useEffect(() => {
        fetchTicket();
        fetchCommunications();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ticketId]);
    const handleUpdateTicket = async (updates) => {
        setIsUpdating(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updates)
            });
            if (!res.ok)
                throw new Error("Failed to update ticket");
            fetchTicket();
        }
        catch (err) {
            alert(err instanceof Error ? err.message : "Error updating ticket");
        }
        finally {
            setIsUpdating(false);
        }
    };
    const handleClaimTicket = () => {
        if (!user)
            return;
        handleUpdateTicket({ ownerId: user.id });
    };
    const handleStatusChange = (e) => {
        const newStatus = e.target.value;
        setEditStatus(newStatus);
        handleUpdateTicket({ status: newStatus });
    };
    const handlePriorityChange = (e) => {
        const newPriority = e.target.value;
        setEditPriority(newPriority);
        handleUpdateTicket({ itPriority: newPriority });
    };
    const handlePostComment = async (isResolution = false) => {
        if (!newComment.trim() && !isResolution)
            return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    content: newComment || (isResolution ? "The requester has indicated this problem appears resolved." : ""),
                    isResolutionIndication: isResolution
                })
            });
            if (!res.ok)
                throw new Error("Failed to post comment");
            setNewComment("");
            fetchCommunications();
            if (isResolution)
                fetchTicket();
        }
        catch (err) {
            alert("Error posting comment");
        }
    };
    const handlePostNote = async () => {
        if (!newNote.trim())
            return;
        try {
            const res = await fetch(`/api/tickets/${ticketId}/notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content: newNote })
            });
            if (!res.ok)
                throw new Error("Failed to post note");
            setNewNote("");
            fetchCommunications();
        }
        catch (err) {
            alert("Error posting note");
        }
    };
    if (loading) {
        return (_jsx("div", { className: "text-center py-5", children: _jsx("div", { className: "spinner-border text-success", role: "status", children: _jsx("span", { className: "visually-hidden", children: "Loading..." }) }) }));
    }
    if (error || !ticket) {
        return (_jsxs("div", { className: "alert alert-danger", children: [error || "Ticket not found", _jsx("div", { className: "mt-3", children: _jsx("button", { className: "btn btn-outline-danger", onClick: onBack, children: "Back to List" }) })] }));
    }
    return (_jsxs("div", { className: "card shadow-sm border-0", children: [_jsxs("div", { className: "card-header bg-white py-3 border-bottom-0 d-flex justify-content-between align-items-center flex-wrap gap-2", children: [_jsxs("div", { children: [_jsx("button", { className: "btn btn-sm btn-outline-secondary me-3", onClick: onBack, children: "\u2190 Back" }), _jsxs("h2", { className: "h4 d-inline mb-0", style: { color: "#006B3C" }, children: ["Ticket: ", ticket.ticketNumber] })] }), _jsxs("div", { className: "d-flex align-items-center gap-2", children: [ticket.requesterResolved && (_jsx("span", { className: "badge bg-warning text-dark me-2", children: "Appears Resolved" })), isStaff ? (_jsxs("select", { className: `form-select form-select-sm fw-bold ${editStatus === 'New' ? 'text-primary' : 'text-secondary'}`, value: editStatus, onChange: handleStatusChange, disabled: isUpdating, style: { width: 'auto' }, children: [_jsx("option", { value: "New", children: "New" }), _jsx("option", { value: "Open", children: "Open" }), _jsx("option", { value: "In Progress", children: "In Progress" }), _jsx("option", { value: "Waiting for Requester", children: "Waiting for Requester" }), _jsx("option", { value: "Resolved", children: "Resolved" }), _jsx("option", { value: "Closed", children: "Closed" }), _jsx("option", { value: "Reopened", children: "Reopened" }), _jsx("option", { value: "Cancelled", children: "Cancelled" })] })) : (_jsx("span", { className: `badge ${ticket.currentStatus === 'New' ? 'bg-primary' : 'bg-secondary'}`, children: ticket.currentStatus }))] })] }), _jsx("div", { className: "card-body bg-light", children: _jsxs("div", { className: "row g-4", children: [_jsxs("div", { className: "col-lg-8", children: [_jsxs("div", { className: "bg-white p-4 rounded border mb-4", children: [_jsxs("h5", { className: "border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center", children: ["Ticket Information", isStaff && (_jsxs("div", { className: "d-flex align-items-center gap-2 fs-6 fw-normal", children: [_jsx("label", { className: "text-muted small mb-0", children: "Owner:" }), ticket.ownerId ? (_jsx("span", { className: "badge bg-light text-dark border", children: ticket.owner?.name || `User ID ${ticket.ownerId}` })) : (_jsx("button", { className: "btn btn-sm btn-outline-success py-0", onClick: handleClaimTicket, disabled: isUpdating, children: "Claim" }))] }))] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "fw-bold text-muted small text-uppercase", children: "Summary" }), _jsx("p", { className: "fs-5", children: ticket.summary })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { className: "fw-bold text-muted small text-uppercase", children: "Description" }), _jsx("p", { className: "bg-light p-3 rounded text-break", style: { whiteSpace: "pre-wrap" }, children: ticket.description })] }), _jsxs("div", { className: "row", children: [_jsxs("div", { className: "col-sm-4 mb-3", children: [_jsx("label", { className: "fw-bold text-muted small text-uppercase", children: "Category" }), _jsx("p", { children: ticket.category?.name })] }), _jsxs("div", { className: "col-sm-4 mb-3", children: [_jsx("label", { className: "fw-bold text-muted small text-uppercase", children: "Related System" }), _jsx("p", { children: ticket.relatedSystem?.name })] }), _jsxs("div", { className: "col-sm-4 mb-3", children: [_jsx("label", { className: "fw-bold text-muted small text-uppercase", children: "IT Priority" }), isStaff ? (_jsxs("select", { className: "form-select form-select-sm", value: editPriority, onChange: handlePriorityChange, disabled: isUpdating, children: [_jsx("option", { value: "Low", children: "Low" }), _jsx("option", { value: "Medium", children: "Medium" }), _jsx("option", { value: "High", children: "High" }), _jsx("option", { value: "Critical", children: "Critical" })] })) : (_jsx("p", { children: ticket.itPriority || ticket.requestedPriority || "Medium" }))] })] })] }), _jsxs("div", { className: "bg-white p-4 rounded border mb-4", children: [_jsx("h5", { className: "border-bottom pb-2 mb-3", children: "Communications" }), _jsx("div", { className: "mb-4", style: { maxHeight: '400px', overflowY: 'auto' }, children: communications.length === 0 ? (_jsx("p", { className: "text-muted text-center py-4", children: "No comments or notes yet." })) : (communications.map((comm) => (_jsxs("div", { className: `p-3 rounded mb-3 border ${comm.type === 'internal_note' ? 'bg-warning bg-opacity-10 border-warning' : 'bg-light'}`, children: [_jsxs("div", { className: "d-flex justify-content-between align-items-center mb-2", children: [_jsxs("div", { children: [_jsx("strong", { className: "me-2", children: comm.author.name }), _jsx("span", { className: `badge ${comm.author.role === 'IT Staff' ? 'bg-success bg-opacity-10 text-success' : comm.author.role === 'Administrator' ? 'bg-dark bg-opacity-10 text-dark' : 'bg-primary bg-opacity-10 text-primary'}`, children: comm.author.role }), comm.type === 'internal_note' && _jsx("span", { className: "badge bg-warning text-dark ms-2", children: "Internal Note" })] }), _jsx("small", { className: "text-muted", children: new Date(comm.createdAt).toLocaleString() })] }), _jsx("p", { className: "mb-0", style: { whiteSpace: "pre-wrap" }, children: comm.content })] }, `${comm.type}-${comm.id}`)))) }), _jsxs("div", { className: "border-top pt-3", children: [_jsxs("ul", { className: "nav nav-pills mb-3", id: "pills-tab", role: "tablist", children: [_jsx("li", { className: "nav-item", role: "presentation", children: _jsx("button", { className: "nav-link active py-1 px-3", id: "pills-comment-tab", "data-bs-toggle": "pill", "data-bs-target": "#pills-comment", type: "button", role: "tab", children: "Add Public Comment" }) }), isStaff && (_jsx("li", { className: "nav-item", role: "presentation", children: _jsx("button", { className: "nav-link py-1 px-3 text-warning-emphasis", id: "pills-note-tab", "data-bs-toggle": "pill", "data-bs-target": "#pills-note", type: "button", role: "tab", children: "Add Internal Note" }) }))] }), _jsxs("div", { className: "tab-content", id: "pills-tabContent", children: [_jsxs("div", { className: "tab-pane fade show active", id: "pills-comment", role: "tabpanel", children: [_jsx("textarea", { className: "form-control mb-2", rows: 3, placeholder: "Type a public comment visible to everyone...", value: newComment, onChange: e => setNewComment(e.target.value) }), _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsx("button", { className: "btn btn-success", onClick: () => handlePostComment(false), disabled: !newComment.trim(), children: "Post Comment" }), isRequester && !ticket.requesterResolved && (_jsx("button", { className: "btn btn-outline-success", onClick: () => {
                                                                                if (window.confirm("Mark this problem as resolved? This will notify IT Staff.")) {
                                                                                    handlePostComment(true);
                                                                                }
                                                                            }, children: "Problem Appears Resolved" }))] })] }), isStaff && (_jsxs("div", { className: "tab-pane fade", id: "pills-note", role: "tabpanel", children: [_jsx("textarea", { className: "form-control mb-2 border-warning bg-warning bg-opacity-10", rows: 3, placeholder: "Type an internal note visible only to IT Staff and Admins...", value: newNote, onChange: e => setNewNote(e.target.value) }), _jsx("button", { className: "btn btn-warning", onClick: handlePostNote, disabled: !newNote.trim(), children: "Save Internal Note" })] }))] })] })] })] }), _jsx("div", { className: "col-lg-4", children: _jsx(AttachmentSection, { ticketId: ticketId, requesterId: requesterId, attachments: ticket.attachments, onAttachmentChanged: fetchTicket }) })] }) })] }));
}
