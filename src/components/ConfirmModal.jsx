import React from "react";

/**
 * Generic confirmation dialog.
 * Props:
 *   message   – main question text
 *   detail    – secondary detail line (optional)
 *   confirmLabel  – text for the confirm button (default "CONFIRMAR")
 *   confirmClass  – extra CSS class for the confirm button (default "mod-btn-delete")
 *   onConfirm – called when user confirms
 *   onCancel  – called when user cancels or clicks backdrop
 */
export default function ConfirmModal({
  message,
  detail,
  confirmLabel = "CONFIRMAR",
  confirmClass = "mod-btn-delete",
  onConfirm,
  onCancel,
}) {
  return (
    <div className="modal mod-confirm-backdrop" onClick={(e) => { if (e.target.classList.contains("mod-confirm-backdrop")) onCancel(); }}>
      <div className="modal-content mod-confirm-box">
        <p className="mod-confirm-message">{message}</p>
        {detail && <p className="mod-confirm-detail">{detail}</p>}
        <div className="mod-confirm-actions">
          <button className="btn mod-confirm-cancel" onClick={onCancel}>
            CANCELAR
          </button>
          <button className={`btn ${confirmClass}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
