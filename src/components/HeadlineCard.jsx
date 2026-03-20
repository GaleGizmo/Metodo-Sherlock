import React, { useState, useEffect, useCallback, useRef } from "react";

// Pure function — module-level to avoid recreation on every render
function getImagePath(headline) {
  if (headline.image) return headline.image;
  const m = headline.id?.match(/(\d+)/);
  return m ? `/images/case-${m[1]}.png` : "/images/case-1.png";
}

export default function HeadlineCard({ headline, onVote, storedVote, resultsEnabled, onNext, onPrev }) {
  const [localVote, setLocalVote] = useState(null);
  const touchStartX = useRef(null);

  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 50) return;
    if (delta < 0) onNext?.();
    else           onPrev?.();
  }, [onNext, onPrev]);

  // headline?.id is the correct dep — avoids boolean expression in dep array
  useEffect(() => {
    setLocalVote(null);
  }, [headline?.id]);

  const handleClick = useCallback((choice) => {
    setLocalVote(choice);
    try {
      onVote(choice);
    } catch {}
  }, [onVote]);

  if (!headline) {
    return (
      <div className="card">
        <div className="headline">Cargando...</div>
      </div>
    );
  }

  const currentVote = localVote || storedVote;
  const isVoted = !!(localVote || storedVote);

  return (
    <div className="card" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      <div className="image-wrapper">
        <img
          className="news-image"
          src={getImagePath(headline)}
          alt={headline.topic ?? "titular"}
        />

        {/* overlay shown when headline has been voted (optimistic localVote OR storedVote)
            and only visible once the moderator has enabled results (resultsEnabled) */}
        {isVoted && resultsEnabled && (
          <div className={`result-overlay ${headline.truth ? "true" : "false"}`}>
            {headline.truth ? "VERDADERA" : "FALSA"}
          </div>
        )}
      </div>

      <div id="voteArea" className="buttons-container">
        <div className="buttons">
          <button
            className={`btn btn-true${currentVote === "true" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("true")}
            disabled={isVoted}
          >
            VERDADERO
          </button>
          <button
            className={`btn btn-false${currentVote === "false" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("false")}
            disabled={isVoted}
          >
            FALSO
          </button>
          {/* <button
            className={`btn btn-doubt${currentVote === "doubt" ? " btn-voted" : currentVote ? " btn-unvoted" : ""}`}
            onClick={() => handleClick("doubt")}
            disabled={isVoted}
          >
            DUDOSO
          </button> */}
        </div>
      </div>
    </div>
  );
}
