import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { MAX_USERNAME_LENGTH, MAX_CODE_LENGTH, PG_UNIQUE_VIOLATION } from "../constants";

export default function UsernameModal({ onStart }) {
  const [name, setName] = useState("");
  const [sessionCode, setSessionCode] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCode = sessionCode.trim().toUpperCase();
    if (!trimmedName || !trimmedCode) return;

    setLoading(true);
    setError(null);

    try {
      const { data, error: dbError } = await supabase
        .from("sessions")
        .select("code, is_active")
        .eq("code", trimmedCode)
        .single();

      if (dbError || !data) {
        setError("Código de sesión no encontrado.");
        return;
      }
      if (!data.is_active) {
        setError("Esta sesión no está activa actualmente.");
        return;
      }

      // Check for duplicate username in this session
      const { data: existing } = await supabase
        .from("scores")
        .select("username")
        .eq("session_code", trimmedCode)
        .eq("username", trimmedName)
        .maybeSingle();

      if (existing) {
        setError("Ese nombre ya está en uso en esta sesión.");
        return;
      }

      // Reserve the username slot immediately
      const { error: insertError } = await supabase.from("scores").insert({
        username: trimmedName,
        session_code: trimmedCode,
      });

      if (insertError) {
        // Unique constraint violation means someone registered the name just now
        setError(
          insertError.code === PG_UNIQUE_VIOLATION
            ? "Ese nombre ya está en uso en esta sesión."
            : "Error al conectar. Inténtalo de nuevo."
        );
        return;
      }

      onStart(trimmedName, trimmedCode);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>MÉTODO SHERLOCK</h3>
        <p className="modal-intro">Introduce estos datos para empezar</p>
        <form onSubmit={handleSubmit}>
          <label className="input-label">Tu nombre</label>
          <input
            className="username-input"
            type="text"
            maxLength={MAX_USERNAME_LENGTH}
            placeholder="Nombre..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <div className="input-helper">máx. {MAX_USERNAME_LENGTH} caracteres</div>
          <label className="input-label input-label-mt">Código de sesión</label>
          <input
            className="username-input"
            type="text"
            maxLength={MAX_CODE_LENGTH}
            placeholder="Ej: TALLER2026"
            value={sessionCode}
            onChange={(e) => { setSessionCode(e.target.value); setError(null); }}
          />
          {error && (
            <div className="session-error">{error}</div>
          )}
          <button
            className="btn btn-next btn-block"
            type="submit"
            disabled={!name.trim() || !sessionCode.trim() || loading}
          >
            {loading ? "COMPROBANDO..." : "EMPEZAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
