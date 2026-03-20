import React, { useState } from "react";
import { supabase } from "../supabaseClient";

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

    const { data, error: dbError } = await supabase
      .from("sessions")
      .select("code, is_active")
      .eq("code", trimmedCode)
      .single();

    if (dbError || !data) {
      setLoading(false);
      setError("Código de sesión no encontrado.");
      return;
    }
    if (!data.is_active) {
      setLoading(false);
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
      setLoading(false);
      setError("Ese nombre ya está en uso en esta sesión.");
      return;
    }

    // Reserve the username slot immediately
    const { error: insertError } = await supabase.from("scores").insert({
      username: trimmedName,
      session_code: trimmedCode,
    });

    setLoading(false);

    if (insertError) {
      // Unique constraint violation means someone registered the name just now
      if (insertError.code === "23505") {
        setError("Ese nombre ya está en uso en esta sesión.");
      } else {
        setError("Error al conectar. Inténtalo de nuevo.");
      }
      return;
    }

    onStart(trimmedName, trimmedCode);
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h3>MÉTODO SHERLOCK</h3>
        <p style={{ marginBottom: 16 }}>Introduce estos datos para empezar</p>
        <form onSubmit={handleSubmit}>
          <label className="input-label">Tu nombre</label>
          <input
            className="username-input"
            type="text"
            maxLength={40}
            placeholder="Nombre..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <label className="input-label" style={{ marginTop: 12 }}>Código de sesión</label>
          <input
            className="username-input"
            type="text"
            maxLength={20}
            placeholder="Ej: TALLER2026"
            value={sessionCode}
            onChange={(e) => { setSessionCode(e.target.value); setError(null); }}
          />
          {error && (
            <div className="session-error">{error}</div>
          )}
          <button
            className="btn btn-next"
            type="submit"
            disabled={!name.trim() || !sessionCode.trim() || loading}
            style={{ marginTop: 16, width: "100%" }}
          >
            {loading ? "COMPROBANDO..." : "EMPEZAR"}
          </button>
        </form>
      </div>
    </div>
  );
}
