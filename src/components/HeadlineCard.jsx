import React, { useState, useEffect } from "react";

export default function HeadlineCard({ headline, onVote, storedVote, resultsEnabled }) {
  const [localVote, setLocalVote] = useState(null);

  useEffect(() => {
    setLocalVote(null);
  }, [headline && headline.id]);

  function handleClick(choice) {
    setLocalVote(choice);
    try {
      onVote(choice);
    } catch (e) {}
  }

  if (!headline) {
    return (
      <div className="card">
        <div className="headline">Cargando...</div>
      </div>
    );
  }

  // use explicit image if provided, otherwise derive from id (case-N.png)
  let imagePath = headline.image || "/images/case-1.png";
  if (!headline.image && headline.id) {
    const m = headline.id.match(/(\d+)/);
    if (m && m[1]) imagePath = `/images/case-${m[1]}.png`;
  }

  const currentVote = localVote || storedVote;

  return (
    <div className="card">
      <div className="image-wrapper">
        <img
          className="news-image"
          src={imagePath}
          alt={headline.topic || "titular"}
        />

        {/* overlay shown when headline has been voted (optimistic localVote OR storedVote)
            and only visible once the user has voted all cases (resultsEnabled) */}
        {(localVote || storedVote) && resultsEnabled && (
          <div
            className={`result-overlay ${headline.truth ? "true" : "false"}`}
          >
            {headline.truth ? "VERDADERA" : "FALSA"}
          </div>
        )}
      </div>

      <div id="voteArea" className="buttons-container">
        <div className="buttons">
          <button
            className={`btn btn-true${currentVote === "true" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("true")}
            disabled={!!storedVote || !!localVote}
          >
            VERDADERO
          </button>
          <button
            className={`btn btn-false${currentVote === "false" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("false")}
            disabled={!!storedVote || !!localVote}
          >
            FALSO
          </button>
          <button
            className={`btn btn-doubt${currentVote === "doubt" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("doubt")}
            disabled={!!storedVote || !!localVote}
          >
            DUDOSO
          </button>
        </div>
      </div>
    </div>
  );
}
