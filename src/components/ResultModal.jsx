import React from "react";
export default function ResultModal({ headline, storedVote, onClose, onNext }) {
  if (!headline) return null;
  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target.classList.contains("modal")) onClose();
      }}
    >
      <div className="modal-content">
        <h3>Resultado</h3>
        <p>La información es:</p>
        <div className={`result-badge ${headline.truth ? "true" : "false"}`}>
          {headline.truth ? "VERDADERA" : "FALSA"}
        </div>
        <button className="btn btn-next" onClick={onNext}>
          Siguiente noticia
        </button>
      </div>
    </div>
  );
}
