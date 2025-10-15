import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeadlineCard from "./components/HeadlineCard";
import ResultModal from "./components/ResultModal";
import Footer from "./components/Footer";
import headlinesData from '../headlines.json';

// Use a public path to the image to avoid importing the binary directly (uppercase .PNG caused import-analysis error)
const logoPath = '/assets/images/logo_sin_fondo.PNG';

export default function App() {
  const [headlines] = useState(headlinesData || []);
  const [idx, setIdx] = useState(0);
  const h = headlines[idx];
  const [modalOpen, setModalOpen] = useState(false);

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
    setModalOpen(true);
  }

  function showStats() {
    setModalOpen(true);
  }

  function goNext() {
    setModalOpen(false);
    setIdx((idx + 1) % headlines.length);
  }

  return (
    <div className="root-app">
      <Header
        caseNumber={h ? `CASO ${idx + 1}` : "CASO"}
        title={h ? `${h.topic}` : ""}
        logo={logoPath}
      />
      <main className="container">
        <HeadlineCard
          headline={h}
          onVote={handleVote}
          storedVote={h ? getStored(h.id) : null}
        />
      </main>
      <Footer onPrev={() => setIdx((idx - 1 + headlines.length) % headlines.length)} onNext={() => setIdx((idx + 1) % headlines.length)} progressText={headlines.length ? `${idx + 1} / ${headlines.length}` : "0 / 0"} />

      {modalOpen && h && (
        <ResultModal
          headline={h}
          storedVote={getStored(h.id)}
          onClose={() => setModalOpen(false)}
          onNext={goNext}
        />
      )}
    </div>
  );
}
