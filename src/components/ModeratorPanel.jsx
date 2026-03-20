import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import { NULL_UUID } from "../constants";
import ConfirmModal from "./ConfirmModal";

export default function ModeratorPanel() {
  const [sessions, setSessions] = useState([]);
  const [newCode, setNewCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [ranking, setRanking] = useState([]);
  const [rankingSession, setRankingSession] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState(null); // { message, detail, confirmLabel, confirmClass, onConfirm }

  useEffect(() => {
    loadSessions();
  }, []);

  // Realtime subscription for ranking
  useEffect(() => {
    if (!rankingSession) return;
    loadRanking(rankingSession);

    const channel = supabase
      .channel("scores-ranking")
      .on("postgres_changes", {
        event: "*",
        schema: "public",
        table: "scores",
        filter: `session_code=eq.${rankingSession}`,
      }, () => loadRanking(rankingSession))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [rankingSession]);

  async function loadSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, code, is_active, results_enabled, created_at")
      .order("created_at", { ascending: false });
    if (data) {
      setSessions(data);
      // Auto-open ranking for active session
      const active = data.find((s) => s.is_active);
      if (active && !rankingSession) setRankingSession(active.code);
    }
  }

  async function loadRanking(code) {
    const { data } = await supabase
      .from("scores")
      .select("username, pct, correct_count, total")
      .eq("session_code", code)
      .order("pct", { ascending: false, nullsFirst: false });
    if (data) setRanking(data);
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

  async function toggleResults(session) {
    const newValue = !session.results_enabled;
    await supabase.from("sessions").update({ results_enabled: newValue }).eq("id", session.id);
    setMessage(`Resultados ${newValue ? "activados" : "desactivados"} para "${session.code}".`);
    await loadSessions();
  }

  async function toggleActive(session) {
    setMessage(null);
    if (!session.is_active) {
      await supabase.from("sessions").update({ is_active: false }).neq("id", NULL_UUID);
      await supabase.from("sessions").update({ is_active: true }).eq("id", session.id);
      setRankingSession(session.code);
      setMessage(`Sesión "${session.code}" activada.`);
    } else {
      await supabase.from("sessions").update({ is_active: false }).eq("id", session.id);
      setMessage(`Sesión "${session.code}" desactivada.`);
    }
    await loadSessions();
  }

  function resetScores(session) {
    setConfirmDialog({
      message: `¿Reiniciar puntuaciones de "${session.code}"?`,
      detail: "Los usuarios podrán volver a registrarse. Esta acción no se puede deshacer.",
      confirmLabel: "REINICIAR",
      confirmClass: "mod-btn-reset",
      onConfirm: async () => {
        setConfirmDialog(null);
        await supabase.from("scores").delete().eq("session_code", session.code);
        setMessage(`Puntuaciones de "${session.code}" reiniciadas.`);
        if (rankingSession === session.code) loadRanking(session.code);
      },
    });
  }

  function deleteSession(session) {
    setConfirmDialog({
      message: `¿Borrar sesión "${session.code}"?`,
      detail: "Se eliminarán todos los datos de partidas. Esta acción no se puede deshacer.",
      confirmLabel: "BORRAR",
      confirmClass: "mod-btn-delete",
      onConfirm: async () => {
        setConfirmDialog(null);
        await supabase.from("scores").delete().eq("session_code", session.code);
        await supabase.from("sessions").delete().eq("id", session.id);
        if (rankingSession === session.code) { setRankingSession(null); setRanking([]); }
        await loadSessions();
        setMessage(`Sesión "${session.code}" eliminada.`);
      },
    });
  }

  return (
    <>
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
                className={`btn ${s.results_enabled ? "mod-btn-results-on" : "mod-btn-results"}`}
                onClick={() => toggleResults(s)}
              >
                {s.results_enabled ? "OCULTAR RESULTADOS" : "MOSTRAR RESULTADOS"}
              </button>
              <button
                className={`btn ${s.is_active ? "btn-false" : "btn-true"}`}
                onClick={() => toggleActive(s)}
              >
                {s.is_active ? "DESACTIVAR" : "ACTIVAR"}
              </button>
              <button className="btn mod-btn-reset" onClick={() => resetScores(s)}>
                REINICIAR
              </button>
              <button className="btn mod-btn-delete" onClick={() => deleteSession(s)}>
                BORRAR
              </button>
            </div>
          </div>
        ))}
      </div>

      {rankingSession && (
        <div className="mod-ranking">
          <h3 className="mod-ranking-title">Ranking — {rankingSession}</h3>
          {ranking.length === 0 ? (
            <p className="mod-empty">Sin participantes aún.</p>
          ) : (
            <div className="mod-ranking-list">
              {ranking.map((r, i) => (
                <div key={r.username} className={`mod-ranking-row ${i === 0 ? "first" : i === 1 ? "second" : i === 2 ? "third" : ""}`}>
                  <span className="rank-pos">{i + 1}</span>
                  <span className="rank-name">{r.username}</span>
                  <span className="rank-score">
                    {r.pct !== null ? `${r.pct}%` : <span className="rank-pending">en curso</span>}
                  </span>
                  {r.pct !== null && (
                    <span className="rank-fraction">{r.correct_count}/{r.total}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>

      {confirmDialog && (
        <ConfirmModal
          message={confirmDialog.message}
          detail={confirmDialog.detail}
          confirmLabel={confirmDialog.confirmLabel}
          confirmClass={confirmDialog.confirmClass}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(null)}
        />
      )}
    </>
  );
}
