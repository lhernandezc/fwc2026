import { useState, useEffect, useRef } from "react";
import { ref, onValue, set } from "firebase/database";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { db, auth, googleProvider, ADMIN_EMAIL } from "./firebase";
import Dashboard from "./components/Dashboard";
import Groups from "./components/Groups";
import Bracket from "./components/Bracket";
import "./styles.css";

export default function App() {
  const [tab, setTab] = useState("dash");
  const [scores, setScores] = useState({});
  const [saveStatus, setSaveStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const saveTimer = useRef(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return () => unsub();
  }, []);

  // Firebase data sync
  useEffect(() => {
    const scoresRef = ref(db, "scores");
    const unsub = onValue(scoresRef, snapshot => {
      const data = snapshot.val();
      if (data) setScores(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleLogin() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e) {
      console.error("Login error:", e);
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }

  function saveToFirebase(newScores) {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await set(ref(db, "scores"), newScores);
        setSaveStatus("✓ Guardado");
        setTimeout(() => setSaveStatus(""), 2500);
      } catch (e) {
        setSaveStatus("⚠ Error al guardar");
        setTimeout(() => setSaveStatus(""), 3000);
      }
    }, 700);
  }

  function handleScoreChange(gk, i, side, val) {
    if (!isAdmin) return;
    const k = gk + "_" + i;
    const existing = scores[k] || { h: "", a: "" };
    const newVal = val === "" ? "" : String(Math.max(0, parseInt(val) || 0));
    const newH = side === "h" ? newVal : existing.h;
    const newA = side === "a" ? newVal : existing.a;
    const bothFilled = newH !== "" && newA !== "";
    const updated = {
      ...scores,
      [k]: {
        ...existing,
        [side]: newVal,
        t: bothFilled ? Date.now() : (existing.t || null)
      }
    };
    setScores(updated);
    saveToFirebase(updated);
  }

  function handleBracketScore(key, side, val) {
    if (!isAdmin) return;
    const updated = {
      ...scores,
      [key]: {
        ...(scores[key] || { h: "", a: "" }),
        [side]: val === "" ? "" : String(Math.max(0, parseInt(val) || 0))
      }
    };
    setScores(updated);
    saveToFirebase(updated);
  }

  if (loading || authLoading) {
    return (
      <div className="app">
        <div className="header" style={{ borderRadius: 16, paddingBottom: 20 }}>
          <div className="header-top">
            <span style={{ fontSize: 32 }}>🏆</span>
            <div className="header-title">
              <h1>FIFA Mundial 2026</h1>
              <p>Cargando...</p>
            </div>
          </div>
        </div>
        <div className="syncing">Conectando con Firebase...</div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <div className="header-top">
          <span style={{ fontSize: 32 }}>🏆</span>
          <div className="header-title">
            <h1>FIFA Mundial 2026</h1>
            <p>Estados Unidos · Canadá · México &nbsp;·&nbsp; 11 Jun – 19 Jul 2026 &nbsp;·&nbsp; 48 equipos · 12 grupos</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {saveStatus && <span className="save-indicator">{saveStatus}</span>}
            {isAdmin ? (
              <button onClick={handleLogout} className="auth-btn" title="Cerrar sesión de administrador">
                🔓 Admin
              </button>
            ) : (
              <button onClick={handleLogin} className="auth-btn lock-btn" title="Iniciar sesión como administrador">
                🔒
              </button>
            )}
          </div>
        </div>
        <nav className="nav">
          <button className={`nav-btn ${tab === "dash" ? "active" : ""}`} onClick={() => setTab("dash")}>📊 Resumen</button>
          <button className={`nav-btn ${tab === "groups" ? "active" : ""}`} onClick={() => setTab("groups")}>⚽ Grupos</button>
          <button className={`nav-btn ${tab === "bracket" ? "active" : ""}`} onClick={() => setTab("bracket")}>🏅 Fase Final</button>
        </nav>
      </div>
      <div className="content">
        {!isAdmin && (
          <div className="readonly-banner">
            👁 Modo lectura — los resultados se actualizan en tiempo real
          </div>
        )}
        {tab === "dash" && <Dashboard scores={scores} />}
        {tab === "groups" && <Groups scores={scores} onScoreChange={handleScoreChange} isAdmin={isAdmin} />}
        {tab === "bracket" && <Bracket scores={scores} onBracketScore={handleBracketScore} isAdmin={isAdmin} />}
      </div>
    </div>
  );
}
