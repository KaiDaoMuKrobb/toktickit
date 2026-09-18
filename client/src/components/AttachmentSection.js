import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useRef, useState } from "react";
export function AttachmentSection({ ticketId, requesterId, attachments, onAttachmentChanged }) {
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);
    const activeAttachments = attachments.filter(a => !a.isRemoved);
    const handleUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file)
            return;
        if (file.size > 5 * 1024 * 1024) {
            alert("File is too large. Maximum size is 5MB.");
            if (fileInputRef.current)
                fileInputRef.current.value = "";
            return;
        }
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
                method: "POST",
                body: formData
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to upload file");
            }
            onAttachmentChanged();
        }
        catch (err) {
            alert(err.message);
        }
        finally {
            setUploading(false);
            if (fileInputRef.current)
                fileInputRef.current.value = "";
        }
    };
    const handleDownload = (attachmentId, originalName) => {
        fetch(`/api/attachments/${attachmentId}/download`)
            .then(res => {
            if (!res.ok)
                throw new Error("File not found or removed");
            return res.blob();
        })
            .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = originalName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        })
            .catch(err => alert(err.message));
    };
    const handleRemove = async (attachmentId) => {
        const reason = prompt("Please provide a reason for removing this file:");
        if (reason === null)
            return; // User cancelled
        if (reason.trim() === "") {
            alert("A reason is required to remove an attachment.");
            return;
        }
        try {
            const res = await fetch(`/api/tickets/${ticketId}/attachments/${attachmentId}`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ reason: reason.trim() })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to remove file");
            }
            onAttachmentChanged();
        }
        catch (err) {
            alert(err.message);
        }
    };
    return (_jsxs("div", { className: "bg-white p-4 rounded border h-100 d-flex flex-column", children: [_jsxs("h5", { className: "border-bottom pb-2 mb-3 d-flex justify-content-between align-items-center", children: ["Attachments", _jsxs("span", { className: "badge bg-light text-dark border", children: [activeAttachments.length, "/5"] })] }), _jsxs("div", { className: "mb-4", children: [_jsx("input", { type: "file", className: "form-control form-control-sm mb-2", ref: fileInputRef, onChange: handleUpload, disabled: uploading || activeAttachments.length >= 5, accept: ".jpg,.jpeg,.png,.webp,.pdf", "aria-label": "Upload attachment" }), _jsx("small", { className: "text-muted", children: "Max 5 files (JPG, PNG, WEBP, PDF), 5MB each." }), uploading && _jsx("div", { className: "mt-2 text-success small", children: "Uploading..." })] }), _jsx("div", { className: "flex-grow-1 overflow-auto", style: { maxHeight: "300px" }, children: attachments.length === 0 ? (_jsx("p", { className: "text-muted small text-center py-4 bg-light rounded border-dashed", children: "No attachments" })) : (_jsx("ul", { className: "list-group list-group-flush", children: attachments.map(att => (_jsx("li", { className: "list-group-item px-2 py-3 bg-transparent", children: _jsxs("div", { className: "d-flex justify-content-between align-items-center", children: [_jsxs("div", { className: "text-truncate me-2", style: { maxWidth: "150px" }, title: att.originalName, children: [_jsx("span", { className: att.isRemoved ? "text-decoration-line-through text-muted" : "fw-medium", children: att.originalName }), _jsx("br", {}), _jsxs("small", { className: "text-muted", children: [(att.size / 1024).toFixed(1), " KB"] })] }), _jsxs("div", { className: "btn-group btn-group-sm", children: [!att.isRemoved && (_jsxs(_Fragment, { children: [_jsx("button", { "aria-label": "Download attachment", className: "btn btn-outline-success", onClick: () => handleDownload(att.id, att.originalName), children: "Download" }), _jsx("button", { "aria-label": "Remove attachment", className: "btn btn-outline-danger", onClick: () => handleRemove(att.id), children: "Remove" })] })), att.isRemoved && (_jsx("span", { className: "badge bg-secondary", children: "Removed" }))] })] }) }, att.id))) })) })] }));
}
