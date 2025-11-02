import React from "react";

export default function Header({ title, logo, caseNumber, resultsEnabled, onShowResults }) {
  return (
    <div className="top-bar">
      <div className="left-controls">
        <button className="btn btn-nav" onClick={onShowResults} disabled={!resultsEnabled}>
          VER RESULTADOS
        </button>
      </div>

      <div className="center-title">{caseNumber}</div>

      <div className="logo-slot">
        <img src={logo} alt="logo" />
      </div>
    </div>
  );
}
