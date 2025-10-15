import React from "react";

export default function Percentages({ seed, localChoice }) {
  const seedCounts = seed || { true: 10, false: 5, doubt: 3 };
  const local = { true: 0, false: 0, doubt: 0 };
  if (["true", "false", "doubt"].includes(localChoice)) local[localChoice] = 1;
  const totals = {
    true: seedCounts.true + local.true,
    false: seedCounts.false + local.false,
    doubt: seedCounts.doubt + local.doubt,
  };
  const sum = totals.true + totals.false + totals.doubt;
  const rows = [
    { k: "true", label: "VERDADERO", color: "var(--true)" },
    { k: "false", label: "FALSO", color: "var(--false)" },
    { k: "doubt", label: "DUDOSO", color: "var(--doubt)" },
  ];
  return (
    <div className="percentages">
      {rows.map((r) => {
        const pct = sum ? Math.round((totals[r.k] / sum) * 100) : 0;
        return (
          <div className="percent-row" key={r.k}>
            <div className="label">{r.label}</div>
            <div className="bar">
              <i style={{ width: `${pct}%`, background: r.color }}></i>
            </div>
            <div style={{ width: 36, textAlign: "right", fontWeight: 700 }}>
              {pct}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
