import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeadlineCard from "./components/HeadlineCard";
import ResultsSummaryModal from "./components/ResultsSummaryModal";
import UsernameModal from "./components/UsernameModal";
import Footer from "./components/Footer";
import headlinesData from "../headlines.json";
import { supabase } from "./supabaseClient";

// Use a public path to the image to avoid importing the binary directly (uppercase .PNG caused import-analysis error)
const logoPath = "/images/logo_sin_fondo.PNG";

export default function App() {
  const [username, setUsername] = useState(null);
  const [headlines] = useState(headlinesData || []);
  const [idx, setIdx] = useState(0);
  const h = headlines[idx];
  const [resultsOpen, setResultsOpen] = useState(false);
  const [globalAvg, setGlobalAvg] = useState(null);
  // dummy state to trigger re-render after votes are stored in localStorage
  const [votesVersion, setVotesVersion] = useState(0);

  useEffect(() => {
    // Clear results_shown on mount for a fresh session
    sessionStorage.setItem("results_shown", false);
  }, []);

  useEffect(() => {
    if (headlines.length && idx >= headlines.length) setIdx(0);
  }, [headlines, idx]);

  async function submitScoreToSupabase(correctCount, total) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    try {
      await supabase.from("game_sessions").insert({
        username,
        correct_count: correctCount,
        total,
        pct,
      });
      const { data } = await supabase
        .from("game_sessions")
        .select("pct");
      if (data && data.length) {
        const avg = Math.round(
          data.reduce((acc, row) => acc + row.pct, 0) / data.length
        );
        setGlobalAvg(avg);
      }
    } catch (e) {
      console.error("Supabase error:", e);
    }
  }

  function storageKey(id) {
    return `ms_vote_${id}`;
  }

  function getStored(id) {
    try {
      return sessionStorage.getItem(storageKey(id));
    } catch (e) {
      return null;
    }
  }

  function setStored(id, v) {
    try {
      sessionStorage.setItem(storageKey(id), v);
    } catch (e) {}
  }

  function handleVote(choice) {
    if (!h) return;
    setStored(h.id, choice);
    // bump version so hasVotedAll() (which reads from localStorage) runs again immediately
    setVotesVersion((v) => v + 1);
  }

  function hasVotedAll() {
    if (!headlines || !headlines.length) return false;
    return headlines.every((c) => !!getStored(c.id));
  }

  function openResults() {
    if (!hasVotedAll()) return;
    // Calculate score and submit to Supabase
    const rows = headlines.map((headline) => {
      const vote = getStored(headline.id);
      const correct =
        (vote === "true" && headline.truth === true) ||
        (vote === "false" && headline.truth === false);
      return correct;
    });
    const correctCount = rows.filter(Boolean).length;
    submitScoreToSupabase(correctCount, headlines.length);
    setResultsOpen(true);
    sessionStorage.setItem("results_shown", true);
  }

  function closeResults() {
    setResultsOpen(false);
  }

  return (
    <div className="root-app">
      {!username && <UsernameModal onStart={setUsername} />}
      <Header
        caseNumber={h ? `CASO ${idx + 1}` : "CASO"}
        title={h ? `${h.topic}` : ""}
        logo={logoPath}
        resultsEnabled={hasVotedAll()}
        onShowResults={openResults}
        username={username}
      />
      <main className="container">
        <HeadlineCard
          headline={h}
          onVote={handleVote}
          storedVote={h ? getStored(h.id) : null}
          resultsEnabled={sessionStorage.getItem("results_shown")==="true"}
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
          username={username}
          globalAvg={globalAvg}
          onClose={closeResults}
        />
      )}
    </div>
  );
}
