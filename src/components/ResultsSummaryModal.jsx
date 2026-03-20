import React from "react";

// Pure helpers — module-level to avoid recreation on every render
const VOTE_LABELS = { true: "VERDADERA", false: "FALSA", doubt: "DUDOSA" };
function mapVoteLabel(v) {
  return v ? (VOTE_LABELS[v] ?? v.toString().toUpperCase()) : "—";
}

function AvgBlock({ label, avg, pct, comparison }) {
  return (
    <div className="avg-block">
      <div className="avg-label">{label}</div>
      <div className="avg-value">{avg != null ? `${avg}%` : "—"}</div>
      {avg != null && (
        <div className={`avg-diff ${pct >= avg ? "above" : "below"}`}>
          {pct >= avg ? `+${pct - avg}` : `${pct - avg}`} vs {comparison}
        </div>
      )}
    </div>
  );
}

export default function ResultsSummaryModal({
  headlines = [],
  getStored,
  username,
  sessionCode,
  sessionAvg,
  globalAvg,
  onClose,
}) {
  if (!headlines.length) return null;

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
          <AvgBlock
            label={`Esta sesión${sessionCode ? ` (${sessionCode})` : ""}`}
            avg={sessionAvg}
            pct={pct}
            comparison="sesión"
          />
          <div className="avg-divider" />
          <AvgBlock
            label="Media global"
            avg={globalAvg}
            pct={pct}
            comparison="global"
          />
        </div>

        <div className="modal-close-row">
          <button className="btn btn-next" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
