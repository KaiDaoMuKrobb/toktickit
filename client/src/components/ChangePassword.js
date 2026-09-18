import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { useAuth } from "../AuthContext.js";
export function ChangePassword() {
    const { user, fetchUser, logout } = useAuth();
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const handleSubmit = async (e) => {
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
            }
            else {
                const data = await res.json();
                setError(data.message || "Failed to change password.");
            }
        }
        catch (err) {
            setError("An unexpected error occurred.");
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsx("div", { className: "container d-flex justify-content-center align-items-center", style: { minHeight: "100vh" }, children: _jsx("div", { className: "card shadow-sm border-0", style: { maxWidth: "400px", width: "100%" }, children: _jsxs("div", { className: "card-body p-4", children: [_jsxs("div", { className: "text-center mb-4", children: [_jsx("h1", { className: "h4 text-warning mb-2", children: "Password Update Required" }), _jsxs("p", { className: "text-muted small", children: ["Welcome, ", user?.name, ". Please change your initial password before continuing."] })] }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "currentPassword", className: "form-label fw-bold", children: "Current Password" }), _jsx("input", { id: "currentPassword", type: "password", className: "form-control", value: currentPassword, onChange: (e) => setCurrentPassword(e.target.value), required: true, autoFocus: true })] }), _jsxs("div", { className: "mb-3", children: [_jsx("label", { htmlFor: "newPassword", className: "form-label fw-bold", children: "New Password" }), _jsx("input", { id: "newPassword", type: "password", className: "form-control", value: newPassword, onChange: (e) => setNewPassword(e.target.value), minLength: 8, required: true }), _jsx("div", { className: "form-text", children: "Minimum 8 characters." })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "confirmPassword", className: "form-label fw-bold", children: "Confirm New Password" }), _jsx("input", { id: "confirmPassword", type: "password", className: "form-control", value: confirmPassword, onChange: (e) => setConfirmPassword(e.target.value), required: true })] }), error && (_jsx("div", { className: "alert alert-danger py-2", role: "alert", children: error })), _jsx("button", { type: "submit", className: "btn btn-success w-100 mb-2", disabled: loading, children: loading ? "Updating..." : "Update Password" }), _jsx("button", { type: "button", className: "btn btn-link text-decoration-none text-muted w-100", onClick: logout, disabled: loading, children: "Cancel and Logout" })] })] }) }) }));
}
