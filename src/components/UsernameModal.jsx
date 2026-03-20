import React, { useState } from "react";

export default function UsernameModal({ onStart }) {
  const [name, setName] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onStart(trimmed);
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>MÉTODO SHERLOCK</h3>
        <p style={{ marginBottom: 16 }}>Introduce tu nombre para empezar</p>
        <form onSubmit={handleSubmit}>
          <input
            className="username-input"
            type="text"
            maxLength={40}
            placeholder="Tu nombre..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <button
            className="btn btn-next"
            type="submit"
            disabled={!name.trim()}
            style={{ marginTop: 16, width: "100%" }}
          >
            EMPEZAR
          </button>
        </form>
      </div>
    </div>
  );
}
