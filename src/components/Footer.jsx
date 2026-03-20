import React from "react";

export default function Footer({ onPrev, onNext, progressText, username, sessionCode }) {
  return (
    <div className="bottom-bar footer">
      <div className="footer-nav">
        <button className="btn btn-nav" onClick={onPrev}>
          Anterior
        </button>
        <div className="progress">{progressText}</div>
        <button className="btn btn-nav" onClick={onNext}>
          Siguiente
        </button>
      </div>
      {(username || sessionCode) && (
        <div className="footer-user">
          {username && <span className="footer-username">{username}</span>}
          {sessionCode && <span className="footer-session">{sessionCode}</span>}
        </div>
      )}
    </div>
  );
}
