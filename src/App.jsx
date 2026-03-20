import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import HeadlineCard from "./components/HeadlineCard";
import ResultsSummaryModal from "./components/ResultsSummaryModal";
import UsernameModal from "./components/UsernameModal";
import ModeratorPanel from "./components/ModeratorPanel";
import Footer from "./components/Footer";
import headlinesData from "../headlines.json";
import { supabase } from "./supabaseClient";

const logoPath = "/images/logo_sin_fondo.PNG";
const MOD_PIN = import.meta.env.VITE_MOD_PIN;

function isModerator() {
  const params = new URLSearchParams(window.location.search);
  return MOD_PIN && params.get("mod") === MOD_PIN;
}

export default function App() {
  if (isModerator()) return <ModeratorPanel />;
  return <GameApp />;
}

function GameApp() {
  const [username, setUsername] = useState(() => localStorage.getItem("ms_username") || null);
  const [sessionCode, setSessionCode] = useState(() => localStorage.getItem("ms_session_code") || null);
  const [headlines] = useState(headlinesData || []);
  const [idx, setIdx] = useState(0);
  const h = headlines[idx];
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsShown, setResultsShown] = useState(false);
  const [sessionAvg, setSessionAvg] = useState(null);
  const [globalAvg, setGlobalAvg] = useState(null);
  // dummy state to trigger re-render after votes are stored in sessionStorage
  const [votesVersion, setVotesVersion] = useState(0);

  useEffect(() => {
    // Clear results_shown on mount for a fresh session
    localStorage.setItem("results_shown", false);
  }, []);

  useEffect(() => {
    if (headlines.length && idx >= headlines.length) setIdx(0);
  }, [headlines, idx]);

  async function submitScoreToSupabase(correctCount, total) {
    const pct = total ? Math.round((correctCount / total) * 100) : 0;
    try {
      const { error: updateError } = await supabase
        .from("scores")
        .update({ correct_count: correctCount, total, pct })
        .eq("username", username)
        .eq("session_code", sessionCode);

      if (updateError) {
        console.error("Error updating score:", updateError);
        return;
      }

      const [{ data: sessionData, error: sErr }, { data: globalData, error: gErr }] = await Promise.all([
        supabase.from("scores").select("pct").eq("session_code", sessionCode).not("pct", "is", null),
        supabase.from("scores").select("pct").not("pct", "is", null),
      ]);

      if (sErr) console.error("Error fetching session avg:", sErr);
      if (gErr) console.error("Error fetching global avg:", gErr);

      if (sessionData && sessionData.length) {
        setSessionAvg(Math.round(
          sessionData.reduce((acc, row) => acc + row.pct, 0) / sessionData.length
        ));
      }
      if (globalData && globalData.length) {
        setGlobalAvg(Math.round(
          globalData.reduce((acc, row) => acc + row.pct, 0) / globalData.length
        ));
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
    setResultsShown(true);
    localStorage.setItem("results_shown", true);
  }

  function closeResults() {
    setResultsOpen(false);
  }

  return (
    <div className="root-app">
      {!username && <UsernameModal onStart={(name, code) => {
        setUsername(name);
        setSessionCode(code);
        localStorage.setItem("ms_username", name);
        localStorage.setItem("ms_session_code", code);
      }} />}
      <Header
        caseNumber={h ? `CASO ${idx + 1}` : "CASO"}
        title={h ? `${h.topic}` : ""}
        logo={logoPath}
        resultsEnabled={hasVotedAll()}
        onShowResults={openResults}
        username={username}
        sessionCode={sessionCode}
      />
      <main className="container">
        <HeadlineCard
          headline={h}
          onVote={handleVote}
          storedVote={h ? getStored(h.id) : null}
          resultsEnabled={resultsShown}
        />
      </main>
      <Footer
        onPrev={() => setIdx((idx - 1 + headlines.length) % headlines.length)}
        onNext={() => setIdx((idx + 1) % headlines.length)}
        progressText={
          headlines.length ? `${idx + 1} / ${headlines.length}` : "0 / 0"
        }
        username={username}
        sessionCode={sessionCode}
      />

      {resultsOpen && (
        <ResultsSummaryModal
          headlines={headlines}
          getStored={getStored}
          username={username}
          sessionCode={sessionCode}
          sessionAvg={sessionAvg}
          globalAvg={globalAvg}
          onClose={closeResults}
        />
      )}
    </div>
  );
}
