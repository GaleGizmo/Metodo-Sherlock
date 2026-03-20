import React from "react";

export default function ResultsSummaryModal({
  headlines = [],
  getStored,
  username,
  sessionCode,
  sessionAvg,
  globalAvg,
  onClose,
}) {
  if (!headlines || !headlines.length) return null;

  const rows = headlines.map((h) => {
    const vote = getStored(h.id);
    const correct =
      (vote === "true" && h.truth === true) ||
      (vote === "false" && h.truth === false);
    return { id: h.id, vote, truth: !!h.truth, correct };
  });

  const correctCount = rows.filter((r) => r.correct).length;
  const total = rows.length;
  const pct = total ? Math.round((correctCount / total) * 100) : 0;

  const mapVoteLabel = (v) => {
    if (!v) return "—";
    if (v === "true") return "VERDADERA";
    if (v === "false") return "FALSA";
    if (v === "doubt") return "DUDOSA";
    return v.toString().toUpperCase();
  };

  return (
    <div
      className="modal"
      onClick={(e) => {
        if (e.target.classList.contains("modal")) onClose();
      }}
    >
      <div className="modal-content">
        <h3>RESULTADOS</h3>

        <div className="results-list">
          <div className="results-header" aria-hidden>
            <div className="col-title caso">CASO</div>
            <div className="col-title votaste">VOTASTE</div>
            <div className="col-title era">ERA</div>
          </div>

          {rows.map((r, i) => (
            <div key={r.id} className={`result-row ${r.correct ? "row-correct" : "row-wrong"}`}>
              <div className="result-left">{`CASO ${i + 1}`}</div>
              <div className="result-right">
                <div className={`col-value result-badge-small ${r.vote === "true" ? "true" : r.vote === "false" ? "false" : "doubt"}`}>
                  {mapVoteLabel(r.vote)}
                </div>
                <div className={`col-value result-badge-small ${r.truth ? "true" : "false"}`}>
                  {r.truth ? "VERDADERA" : "FALSA"}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="score-summary">
          {username && <div className="score-username">{username}</div>}
          <div className="score-fraction">{correctCount}<span>/{total}</span></div>
          <div className="score-pct">{pct}%</div>
        </div>

        <div className="avg-comparison">
          <div className="avg-block">
            <div className="avg-label">Esta sesión{sessionCode ? ` (${sessionCode})` : ""}</div>
            <div className="avg-value">
              {sessionAvg !== null && sessionAvg !== undefined ? `${sessionAvg}%` : "—"}
            </div>
            {sessionAvg !== null && sessionAvg !== undefined && (
              <div className={`avg-diff ${pct >= sessionAvg ? "above" : "below"}`}>
                {pct >= sessionAvg ? `+${pct - sessionAvg}` : `${pct - sessionAvg}`} vs sesión
              </div>
            )}
          </div>
          <div className="avg-divider" />
          <div className="avg-block">
            <div className="avg-label">Media global</div>
            <div className="avg-value">
              {globalAvg !== null && globalAvg !== undefined ? `${globalAvg}%` : "—"}
            </div>
            {globalAvg !== null && globalAvg !== undefined && (
              <div className={`avg-diff ${pct >= globalAvg ? "above" : "below"}`}>
                {pct >= globalAvg ? `+${pct - globalAvg}` : `${pct - globalAvg}`} vs global
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <button className="btn btn-next" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
