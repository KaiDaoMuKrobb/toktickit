import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from "react";
export function CreateTicket({ requesterId, onSuccess, onCancel }) {
    const [categories, setCategories] = useState([]);
    const [systems, setSystems] = useState([]);
    const [loadingCats, setLoadingCats] = useState(true);
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [relatedSystemId, setRelatedSystemId] = useState("");
    const [requesterName, setRequesterName] = useState("Loading...");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [attemptedSubmit, setAttemptedSubmit] = useState(false);
    // Validation checks
    const isSummaryValid = summary.length >= 5 && summary.length <= 100;
    const isDescValid = description.length >= 10 && description.length <= 1000;
    const isFormValid = isSummaryValid && isDescValid && categoryId && relatedSystemId;
    useEffect(() => {
        fetch("/api/categories")
            .then(res => res.json())
            .then(data => {
            setCategories(data);
        })
            .catch(() => { });
        fetch("/api/systems")
            .then(res => res.json())
            .then(data => {
            setSystems(data);
            setLoadingCats(false);
        })
            .catch(() => setLoadingCats(false));
        // Fetch requester name for display
        fetch("/api/requesters")
            .then(res => res.json())
            .then(data => {
            const req = data.find((r) => r.id === requesterId);
            if (req)
                setRequesterName(req.name);
        })
            .catch(() => { });
    }, [requesterId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setAttemptedSubmit(true);
        if (!isFormValid || submitting)
            return;
        setSubmitting(true);
        setError("");
        try {
            const res = await fetch("/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    summary,
                    description,
                    categoryId: Number(categoryId),
                    relatedSystemId: Number(relatedSystemId)
                })
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Failed to create ticket");
            }
            onSuccess(data.ticketNumber);
        }
        catch (err) {
            setError(err.message);
            setSubmitting(false); // Enable button again, preserve data (BR-10)
        }
    };
    return (_jsxs("div", { className: "card shadow-sm", children: [_jsx("div", { className: "card-header bg-white py-3 border-bottom-0", children: _jsx("h2", { className: "h4 mb-0", style: { color: "#006B3C" }, children: "Create New Ticket" }) }), _jsxs("div", { className: "card-body bg-light", children: [error && _jsx("div", { className: "alert alert-danger", children: error }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Requester ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { type: "text", className: "form-control bg-light", value: requesterName, disabled: true })] }), _jsxs("div", { className: "row mb-3", children: [_jsxs("div", { className: "col-md-6", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Category ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: "form-select", value: categoryId, onChange: e => setCategoryId(e.target.value), disabled: loadingCats || submitting, children: [_jsx("option", { value: "", children: "Select a category..." }), categories.map(c => (_jsx("option", { value: c.id, children: c.name }, c.id)))] })] }), _jsxs("div", { className: "col-md-6", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Related System ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsxs("select", { className: "form-select", value: relatedSystemId, onChange: e => setRelatedSystemId(e.target.value), disabled: loadingCats || submitting, children: [_jsx("option", { value: "", children: "Select a system..." }), systems.map(s => (_jsx("option", { value: s.id, children: s.name }, s.id)))] })] })] }), _jsxs("div", { className: "mb-3", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Summary ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("input", { type: "text", className: `form-control ${(attemptedSubmit || summary) && !isSummaryValid ? 'is-invalid' : ''}`, placeholder: "Brief description of the issue", value: summary, onChange: e => setSummary(e.target.value), disabled: submitting }), (attemptedSubmit || summary) && !isSummaryValid && (_jsx("div", { className: "invalid-feedback", children: "Summary must be between 5 and 100 characters." }))] }), _jsxs("div", { className: "mb-4", children: [_jsxs("label", { className: "form-label fw-bold", children: ["Description ", _jsx("span", { className: "text-danger", children: "*" })] }), _jsx("textarea", { className: `form-control ${(attemptedSubmit || description) && !isDescValid ? 'is-invalid' : ''}`, rows: 5, placeholder: "Detailed description of the issue...", value: description, onChange: e => setDescription(e.target.value), disabled: submitting }), (attemptedSubmit || description) && !isDescValid && (_jsx("div", { className: "invalid-feedback", children: "Description must be between 10 and 1000 characters." }))] }), _jsxs("div", { className: "d-flex justify-content-end gap-2", children: [_jsx("button", { type: "button", className: "btn btn-outline-secondary", onClick: onCancel, disabled: submitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "btn text-white", style: { backgroundColor: "#006B3C" }, disabled: submitting, children: submitting ? "Submitting..." : "Submit Ticket" })] })] })] })] }));
}
