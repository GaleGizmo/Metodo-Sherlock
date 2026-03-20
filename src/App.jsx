import React, { useCallback, useEffect, useMemo, useState } from "react";
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

// Module-level: evaluated once, never changes during the session
const IS_MODERATOR = MOD_PIN && new URLSearchParams(window.location.search).get("mod") === MOD_PIN;

// Pure helpers with no component state dependency — module-level to avoid recreation
function storageKey(id) { return `ms_vote_${id}`; }
function getStored(id) {
  try { return localStorage.getItem(storageKey(id)); } catch { return null; }
}
function setStored(id, v) {
  try { localStorage.setItem(storageKey(id), v); } catch { /* quota exceeded — ignore */ }
}

// Static data: imported JSON never changes, no need for state
const headlines = headlinesData || [];

export default function App() {
  if (IS_MODERATOR) return <ModeratorPanel />;
  return <GameApp />;
}

function GameApp() {
  const [username, setUsername] = useState(() => localStorage.getItem("ms_username") || null);
  const [sessionCode, setSessionCode] = useState(() => localStorage.getItem("ms_session_code") || null);
  const [idx, setIdx] = useState(0);
  const [resultsOpen, setResultsOpen] = useState(false);
  const [resultsEnabled, setResultsEnabled] = useState(false);
  const [sessionAvg, setSessionAvg] = useState(null);
  const [globalAvg, setGlobalAvg] = useState(null);
  // Incrementing counter used to trigger the score effect after each vote,
  // since votes live in localStorage and don't cause a React re-render on their own.
  const [votesVersion, setVotesVersion] = useState(0);

  const h = headlines[idx] ?? null;

  const hasVotedAll = useMemo(
    () => headlines.length > 0 && headlines.every((c) => !!getStored(c.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [votesVersion], // re-evaluate only when a new vote is cast
  );

  // Subscribe to results_enabled flag on the current session
  useEffect(() => {
    if (!sessionCode) return;
    supabase
      .from("sessions")
      .select("results_enabled")
      .eq("code", sessionCode)
      .single()
      .then(({ data }) => { if (data) setResultsEnabled(data.results_enabled); });

    const channel = supabase
      .channel("session-results")
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "sessions",
        filter: `code=eq.${sessionCode}`,
      }, (payload) => {
        setResultsEnabled(payload.new.results_enabled);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [sessionCode]);

  // Submit score to Supabase as soon as the user has voted all cases
  useEffect(() => {
    if (!username || !sessionCode || !hasVotedAll) return;
    const correctCount = headlines.filter((headline) => {
      const vote = getStored(headline.id);
      return (
        (vote === "true" && headline.truth === true) ||
        (vote === "false" && headline.truth === false)
      );
    }).length;
    submitScoreToSupabase(correctCount, headlines.length);
  }, [hasVotedAll, username, sessionCode]);

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

      if (sessionData?.length) {
        setSessionAvg(Math.round(sessionData.reduce((acc, r) => acc + r.pct, 0) / sessionData.length));
      }
      if (globalData?.length) {
        setGlobalAvg(Math.round(globalData.reduce((acc, r) => acc + r.pct, 0) / globalData.length));
      }
    } catch (e) {
      console.error("Supabase error:", e);
    }
  }

  const handleVote = useCallback((choice) => {
    if (!h) return;
    setStored(h.id, choice);
    setVotesVersion((v) => v + 1);
  }, [h]);

  const handleStart = useCallback((name, code) => {
    setUsername(name);
    setSessionCode(code);
    localStorage.setItem("ms_username", name);
    localStorage.setItem("ms_session_code", code);
  }, []);

  const openResults = useCallback(() => {
    if (!hasVotedAll || !resultsEnabled) return;
    setResultsOpen(true);
  }, [hasVotedAll, resultsEnabled]);

  return (
    <div className="root-app">
      {!username && <UsernameModal onStart={handleStart} />}
      <Header
        caseNumber={h ? `CASO ${idx + 1}` : "CASO"}
        title={h?.topic ?? ""}
        logo={logoPath}
        resultsEnabled={hasVotedAll && resultsEnabled}
        onShowResults={openResults}
        username={username}
        sessionCode={sessionCode}
      />
      <main className="container">
        <HeadlineCard
          headline={h}
          onVote={handleVote}
          storedVote={h ? getStored(h.id) : null}
          resultsEnabled={resultsEnabled}
          onNext={() => setIdx((i) => (i + 1) % headlines.length)}
          onPrev={() => setIdx((i) => (i - 1 + headlines.length) % headlines.length)}
        />
      </main>
      <Footer
        onPrev={() => setIdx((i) => (i - 1 + headlines.length) % headlines.length)}
        onNext={() => setIdx((i) => (i + 1) % headlines.length)}
        progressText={headlines.length ? `${idx + 1} / ${headlines.length}` : "0 / 0"}
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
          onClose={() => setResultsOpen(false)}
        />
      )}
    </div>
  );
}
