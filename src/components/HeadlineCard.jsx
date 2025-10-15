import React, { useState, useEffect } from "react";

export default function HeadlineCard({ headline, onVote, storedVote }) {
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

  const [localVote, setLocalVote] = useState(null);

  // reset optimistic local vote when a new headline is shown
  useEffect(() => {
    setLocalVote(null);
  }, [headline && headline.id]);

  function handleClick(choice){
    // optimistic disable locally so buttons respond immediately
    setLocalVote(choice);
    try{ onVote(choice); } catch(e){}
  }

  return (
    <div className="card">
      <img
        className="news-image"
        src={imagePath}
        alt={headline.topic || "titular"}
      />

      <div id="voteArea">
        <div className="buttons">
          <button
            className="btn btn-true"
            onClick={() => handleClick("true")}
            disabled={!!storedVote || !!localVote}
          >
            VERDADERO
          </button>
          <button
            className="btn btn-false"
            onClick={() => handleClick("false")}
            disabled={!!storedVote || !!localVote}
          >
            FALSO
          </button>
          <button
            className="btn btn-doubt"
            onClick={() => handleClick("doubt")}
            disabled={!!storedVote || !!localVote}
          >
            DUDOSO
          </button>
        </div>

        {storedVote && (
          <div
            className="post-vote"
            style={{ marginTop: 12, justifyContent: "center" }}
          >
            <div className="your-vote">
              Tu voto:{" "}
              <strong>
                {storedVote === "true"
                  ? "VERDADERO"
                  : storedVote === "false"
                  ? "FALSO"
                  : "DUDOSO"}
              </strong>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
