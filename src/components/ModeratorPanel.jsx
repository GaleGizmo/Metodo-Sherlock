import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export default function ModeratorPanel() {
  const [sessions, setSessions] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, code, is_active, created_at")
      .order("created_at", { ascending: false });
    if (data) setSessions(data);
  }

  async function createSession(e) {
    e.preventDefault();
    const code = newCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    setMessage(null);
    const { error } = await supabase.from("sessions").insert({ code, is_active: false });
    setLoading(false);
    if (error) {
      setMessage(error.message.includes("unique") ? "Ese código ya existe." : error.message);
    } else {
      setNewCode("");
      await loadSessions();
      setMessage(`Sesión "${code}" creada.`);
    }
  }

  async function toggleActive(session) {
    setMessage(null);
    if (!session.is_active) {
      // Deactivate all first, then activate this one
      await supabase.from("sessions").update({ is_active: false }).neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("sessions").update({ is_active: true }).eq("id", session.id);
      setMessage(`Sesión "${session.code}" activada.`);
    } else {
      await supabase.from("sessions").update({ is_active: false }).eq("id", session.id);
      setMessage(`Sesión "${session.code}" desactivada.`);
    }
    await loadSessions();
  }

  async function deleteSession(session) {
    if (!window.confirm(`¿Borrar sesión "${session.code}"? Se perderán sus datos de partidas.`)) return;
    await supabase.from("scores").delete().eq("session_code", session.code);
    await supabase.from("sessions").delete().eq("id", session.id);
    await loadSessions();
    setMessage(`Sesión "${session.code}" eliminada.`);
  }

  return (
    <div className="mod-panel">
      <h2>Panel del moderador</h2>

      <form className="mod-create-form" onSubmit={createSession}>
        <input
          className="username-input"
          type="text"
          maxLength={20}
          placeholder="Ej: TALLER2026"
          value={newCode}
          onChange={(e) => setNewCode(e.target.value)}
        />
        <button className="btn btn-next" type="submit" disabled={loading || !newCode.trim()}>
          {loading ? "..." : "CREAR SESIÓN"}
        </button>
      </form>

      {message && <div className="mod-message">{message}</div>}

      <div className="mod-session-list">
        {sessions.length === 0 && (
          <p className="mod-empty">Sin sesiones creadas aún.</p>
        )}
        {sessions.map((s) => (
          <div key={s.id} className={`mod-session-card ${s.is_active ? "is-active" : ""}`}>
            <div className="mod-card-top">
              <span className="mod-code">{s.code}</span>
              <span className={`mod-status ${s.is_active ? "active" : "inactive"}`}>
                {s.is_active ? "ACTIVA" : "INACTIVA"}
              </span>
            </div>
            <div className="mod-card-actions">
              <button
                className={`btn ${s.is_active ? "btn-false" : "btn-true"}`}
                onClick={() => toggleActive(s)}
              >
                {s.is_active ? "DESACTIVAR" : "ACTIVAR"}
              </button>
              <button className="btn mod-btn-delete" onClick={() => deleteSession(s)}>
                BORRAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
