import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeadlineCard from "./components/HeadlineCard";
import ResultsSummaryModal from "./components/ResultsSummaryModal";
import Footer from "./components/Footer";
import headlinesData from "../headlines.json";

// Use a public path to the image to avoid importing the binary directly (uppercase .PNG caused import-analysis error)
const logoPath = "/images/logo_sin_fondo.PNG";

export default function App() {
  const [headlines] = useState(headlinesData || []);
  const [idx, setIdx] = useState(0);
  const h = headlines[idx];
  const [resultsOpen, setResultsOpen] = useState(false);

  useEffect(() => {
    if (headlines.length && idx >= headlines.length) setIdx(0);
  }, [headlines, idx]);

  function storageKey(id) {
    return `ms_vote_${id}`;
  }

  function getStored(id) {
    try {
      return localStorage.getItem(storageKey(id));
    } catch (e) {
      return null;
    }
  }

  function setStored(id, v) {
    try {
      localStorage.setItem(storageKey(id), v);
    } catch (e) {}
  }

  function handleVote(choice) {
    if (!h) return;
    setStored(h.id, choice);
  }

  function goNext() {
    setIdx((idx + 1) % headlines.length);
  }

  function hasVotedAll() {
    if (!headlines || !headlines.length) return false;
    return headlines.every((c) => !!getStored(c.id));
  }

  function openResults() {
    if (hasVotedAll()) setResultsOpen(true);
  }

  function closeResults() {
    setResultsOpen(false);
  }

  return (
    <div className="root-app">
      <Header
        caseNumber={h ? `CASO ${idx + 1}` : "CASO"}
        title={h ? `${h.topic}` : ""}
        logo={logoPath}
        resultsEnabled={hasVotedAll()}
        onShowResults={openResults}
      />
      <main className="container">
        <HeadlineCard
          headline={h}
          onVote={handleVote}
          storedVote={h ? getStored(h.id) : null}
          resultsEnabled={hasVotedAll()}
        />
      </main>
      <Footer
        onPrev={() => setIdx((idx - 1 + headlines.length) % headlines.length)}
        onNext={() => setIdx((idx + 1) % headlines.length)}
        progressText={
          headlines.length ? `${idx + 1} / ${headlines.length}` : "0 / 0"
        }
      />

      {resultsOpen && (
        <ResultsSummaryModal
          headlines={headlines}
          getStored={getStored}
          onClose={closeResults}
        />
      )}
    </div>
  );
}
