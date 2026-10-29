import { useState, useEffect } from "react";
import { useAuth } from "../AuthContext.js";

export interface ActionTaken {
  id: number;
  ticketId: number;
  actionDateTime: string;
  description: string;
  result: string;
  performedById: number;
  performedBy: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
  followUpRequired: boolean;
  followUpNote: string | null;
  attachmentNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Props {
  ticketId: number;
  onActionChanged?: () => void;
}

export function ActionsTakenSection({ ticketId, onActionChanged }: Props) {
  const { user } = useAuth();
  const [actions, setActions] = useState<ActionTaken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingActionId, setEditingActionId] = useState<number | null>(null);
  const [actionDateTime, setActionDateTime] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState("");
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpNote, setFollowUpNote] = useState("");
  const [attachmentNotes, setAttachmentNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isStaff = user?.role === "IT Staff" || user?.role === "Administrator";

  const fetchActions = () => {
    try {
      const promise = fetch(`/api/tickets/${ticketId}/actions`, { method: "GET" });
      if (!promise || typeof promise.then !== "function") {
        setLoading(false);
        return;
      }
      promise
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load Actions Taken");
          return res.json();
        })
        .then((data) => {
          setActions(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    } catch {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActions();
  }, [ticketId]);

  const openCreateModal = () => {
    setEditingActionId(null);
    const now = new Date();
    // format as local datetime string YYYY-MM-DDTHH:mm
    const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setActionDateTime(localIso);
    setDescription("");
    setResult("");
    setFollowUpRequired(false);
    setFollowUpNote("");
    setAttachmentNotes("");
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (action: ActionTaken) => {
    setEditingActionId(action.id);
    const dt = new Date(action.actionDateTime);
    const localIso = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setActionDateTime(localIso);
    setDescription(action.description);
    setResult(action.result);
    setFollowUpRequired(action.followUpRequired);
    setFollowUpNote(action.followUpNote || "");
    setAttachmentNotes(action.attachmentNotes || "");
    setFormError("");
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingActionId(null);
    setFormError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!description.trim() || description.trim().length < 3) {
      setFormError("Action Description is required (at least 3 characters).");
      return;
    }
    if (!result.trim() || result.trim().length < 3) {
      setFormError("Result is required (at least 3 characters).");
      return;
    }
    if (followUpRequired && (!followUpNote || !followUpNote.trim())) {
      setFormError("Follow-up Note is required when Follow-up Required is checked.");
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingActionId
        ? `/api/tickets/${ticketId}/actions/${editingActionId}`
        : `/api/tickets/${ticketId}/actions`;
      const method = editingActionId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          actionDateTime: actionDateTime ? new Date(actionDateTime).toISOString() : new Date().toISOString(),
          description: description.trim(),
          result: result.trim(),
          followUpRequired,
          followUpNote: followUpRequired ? followUpNote.trim() : null,
          attachmentNotes: attachmentNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save Action Taken");
      }

      closeModal();
      fetchActions();
      if (onActionChanged) onActionChanged();
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3 flex-wrap gap-2">
        <h5 className="mb-0 text-success fw-bold">
          <i className="bi bi-tools me-2"></i>Actions Taken
        </h5>
        {isStaff && (
          <button
            className="btn btn-sm btn-success fw-medium"
            onClick={openCreateModal}
            aria-label="Add Action Taken"
          >
            <i className="bi bi-plus-circle me-1"></i> Add Action Taken
          </button>
        )}
      </div>

      {loading && (
        <div className="text-center py-4" aria-live="polite">
          <div className="spinner-border spinner-border-sm text-success" role="status">
            <span className="visually-hidden">Loading Actions Taken...</span>
          </div>
        </div>
      )}

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {!loading && !error && actions.length === 0 && (
        <div className="text-center py-4 text-muted bg-light rounded-3">
          <p className="mb-0">
            <i className="bi bi-info-circle me-2"></i>No actions recorded yet. IT Staff will log diagnostic and repair steps here.
          </p>
        </div>
      )}

      {!loading && actions.length > 0 && (
        <div>
          {/* Desktop / Tablet Table View */}
          <div className="table-responsive d-none d-md-block">
            <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate" }}>
              <thead className="table-light">
                <tr className="small text-muted text-uppercase">
                  <th scope="col" style={{ width: "16%" }}>Date / Time</th>
                  <th scope="col" style={{ width: "28%" }}>Action Description</th>
                  <th scope="col" style={{ width: "24%" }}>Result</th>
                  <th scope="col" style={{ width: "16%" }}>Performed By</th>
                  <th scope="col" style={{ width: "16%" }}>Follow-up</th>
                  {isStaff && <th scope="col" className="text-end" style={{ width: "8%" }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {actions.map((act) => (
                  <tr key={act.id}>
                    <td className="small text-nowrap fw-medium">
                      {new Date(act.actionDateTime).toLocaleString()}
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{act.description}</div>
                      {act.attachmentNotes && (
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-paperclip me-1"></i>Ref: {act.attachmentNotes}
                        </small>
                      )}
                    </td>
                    <td>
                      <span className="text-secondary">{act.result}</span>
                    </td>
                    <td>
                      <span className="badge bg-success bg-opacity-10 text-success fw-bold px-2 py-1">
                        {act.performedBy?.name || `Staff #${act.performedById}`}
                      </span>
                    </td>
                    <td>
                      {act.followUpRequired ? (
                        <div>
                          <span className="badge bg-warning text-dark px-2 py-1">
                            <i className="bi bi-exclamation-circle me-1"></i>Follow-up
                          </span>
                          {act.followUpNote && (
                            <small className="d-block text-dark mt-1 bg-warning bg-opacity-10 p-1 rounded">
                              {act.followUpNote}
                            </small>
                          )}
                        </div>
                      ) : (
                        <span className="badge bg-light text-muted px-2 py-1">None</span>
                      )}
                    </td>
                    {isStaff && (
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => openEditModal(act)}
                          aria-label={`Edit action ${act.id}`}
                        >
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Stacked Card View */}
          <div className="d-md-none d-flex flex-column gap-3">
            {actions.map((act) => (
              <div key={act.id} className="card border p-3 bg-white shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-success bg-opacity-10 text-success fw-bold">
                    {act.performedBy?.name || `Staff #${act.performedById}`}
                  </span>
                  <small className="text-muted">{new Date(act.actionDateTime).toLocaleString()}</small>
                </div>
                <div className="mb-2">
                  <label className="small text-muted fw-bold text-uppercase d-block mb-1">Description</label>
                  <p className="mb-1 text-dark fw-medium">{act.description}</p>
                </div>
                <div className="mb-2">
                  <label className="small text-muted fw-bold text-uppercase d-block mb-1">Result</label>
                  <p className="mb-1 text-secondary">{act.result}</p>
                </div>
                {act.followUpRequired && (
                  <div className="mb-2 bg-warning bg-opacity-10 p-2 rounded">
                    <span className="badge bg-warning text-dark mb-1">Follow-up Required</span>
                    <p className="small mb-0 text-dark">{act.followUpNote}</p>
                  </div>
                )}
                {act.attachmentNotes && (
                  <div className="small text-muted mb-2">
                    <i className="bi bi-paperclip me-1"></i>{act.attachmentNotes}
                  </div>
                )}
                {isStaff && (
                  <div className="text-end pt-2 border-top">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openEditModal(act)}
                    >
                      Edit Action
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-success text-white py-3">
                <h5 className="modal-title fw-bold">
                  {editingActionId ? "Edit Action Taken" : "Add Action Taken"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={closeModal}
                  disabled={isSubmitting}
                ></button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  {formError && (
                    <div className="alert alert-danger py-2 mb-3" role="alert">
                      {formError}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label htmlFor="actionDateTime" className="form-label fw-medium small">
                        Action Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        id="actionDateTime"
                        className="form-control form-control-sm"
                        value={actionDateTime}
                        onChange={(e) => setActionDateTime(e.target.value)}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label htmlFor="performedBy" className="form-label fw-medium small">
                        Performed By (auto)
                      </label>
                      <input
                        type="text"
                        id="performedBy"
                        className="form-control form-control-sm bg-light"
                        value={`${user?.name || "Current User"} (${user?.role || "IT Staff"})`}
                        disabled
                        readOnly
                      />
                    </div>

                    <div className="col-12">
                      <label htmlFor="description" className="form-label fw-medium small">
                        Action Description <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="description"
                        className="form-control"
                        rows={3}
                        placeholder="Detail the diagnosis, testing, hardware replacement, or configuration work performed..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <label htmlFor="result" className="form-label fw-medium small">
                        Result <span className="text-danger">*</span>
                      </label>
                      <textarea
                        id="result"
                        className="form-control"
                        rows={2}
                        placeholder="State the observed outcome or current status following the action..."
                        value={result}
                        onChange={(e) => setResult(e.target.value)}
                        required
                      ></textarea>
                    </div>

                    <div className="col-12">
                      <div className="form-check form-switch mt-2">
                        <input
                          type="checkbox"
                          id="followUpRequired"
                          className="form-check-input"
                          checked={followUpRequired}
                          onChange={(e) => setFollowUpRequired(e.target.checked)}
                        />
                        <label htmlFor="followUpRequired" className="form-check-label fw-medium small">
                          Follow-Up Required?
                        </label>
                      </div>
                    </div>

                    {followUpRequired && (
                      <div className="col-12">
                        <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded">
                          <label htmlFor="followUpNote" className="form-label fw-bold text-dark small">
                            Follow-up Note <span className="text-danger">*</span>
                          </label>
                          <textarea
                            id="followUpNote"
                            className="form-control"
                            rows={2}
                            placeholder="Specify what follow-up is needed (e.g. check tomorrow morning, order part)..."
                            value={followUpNote}
                            onChange={(e) => setFollowUpNote(e.target.value)}
                            required
                          ></textarea>
                        </div>
                      </div>
                    )}

                    <div className="col-12">
                      <label htmlFor="attachmentNotes" className="form-label fw-medium small">
                        Attachment Notes (optional)
                      </label>
                      <input
                        type="text"
                        id="attachmentNotes"
                        className="form-control form-control-sm"
                        placeholder="e.g. See battery_diagnostic.png or multimeter reading above"
                        value={attachmentNotes}
                        onChange={(e) => setAttachmentNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary"
                    onClick={closeModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-sm btn-success px-4"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span>
                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                        Saving...
                      </span>
                    ) : editingActionId ? (
                      "Update Action"
                    ) : (
                      "Save Action"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
