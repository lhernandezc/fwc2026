import { useState } from "react";
import { GROUPS, MATCHES, calcStandings, bestThirds, getFacts, getTeam } from "../data";

function FormIcon({ result }) {
  if (result === "w") return <div className="fi fi-w">✓</div>;
  if (result === "l") return <div className="fi fi-l">✕</div>;
  if (result === "d") return <div className="fi fi-d" style={{ fontSize: 8 }}>—</div>;
  return <div className="fi fi-n" style={{ fontSize: 8 }}>—</div>;
}

function FormIcons({ form }) {
  const last3 = [...form.slice(-3)];
  while (last3.length < 3) last3.unshift(null);
  return <div className="form-icons">{last3.map((r, i) => <FormIcon key={i} result={r} />)}</div>;
}

function MatchDetail({ gk, matchIdx, score, onClose }) {
  const m = MATCHES[gk][matchIdx];
  const t1 = getTeam(m[0]), t2 = getTeam(m[1]);
  const facts = getFacts(m[0], m[1]);
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <button className="close-btn" onClick={onClose}>Cerrar ×</button>
        <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 10 }}>Detalles · Grupo {gk}</h3>
        <div className="modal-teams">
          <div className="modal-team"><span className="mf">{t1.f}</span><span className="mn">{t1.c}</span></div>
          <div className="modal-vs">{score.h !== "" && score.a !== "" ? `${score.h} - ${score.a}` : "VS"}</div>
          <div className="modal-team"><span className="mf">{t2.f}</span><span className="mn">{t2.c}</span></div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <div className="fact-label">Fecha · Sede</div>
          <div className="fact">{m[2]} · {m[3]}</div>
        </div>
        <div className="fact-label">Datos del Partido</div>
        {facts.map((f, i) => <div key={i} className="fact">{f}</div>)}
      </div>
    </div>
  );
}

function ScoreDisplay({ h, a }) {
  if (h !== "" && a !== "") {
    return (
      <div className="score-wrap">
        <span className="score-static">{h}</span>
        <span className="ssep">-</span>
        <span className="score-static">{a}</span>
      </div>
    );
  }
  return <div className="score-wrap pending"><span className="ssep">vs</span></div>;
}

function GroupCard({ gk, scores, onScoreChange, isAdmin }) {
  const [detail, setDetail] = useState(null);
  const s = calcStandings(gk, scores);
  const thirds = bestThirds(scores);
  const thirdNames = thirds.map(t => t.c);
  const ms = MATCHES[gk] || [];

  return (
    <div className="group-card">
      <div className="group-card-header">
        <h3>Grupo {gk}</h3>
        <span style={{ fontSize: 13, letterSpacing: 1 }}>{GROUPS[gk].t.map(t => t.f).join(" ")}</span>
      </div>
      <table className="standings-table">
        <thead>
          <tr><th></th><th>PJ</th><th>G</th><th>E</th><th>P</th><th>GF</th><th>GC</th><th>DG</th><th>Pts</th><th>Forma</th></tr>
        </thead>
        <tbody>
          {s.map((t, idx) => {
            const done = s.filter(x => x.pj === 3).length === 4;
            const isThird = idx === 2 && (thirdNames.includes(t.c) || !done);
            const rc = idx < 2 ? "row-q" : (isThird ? "row-3" : "");
            const pc = idx < 2 ? (idx === 0 ? "pos-1" : "pos-2") : (isThird ? "pos-3m" : "pos-4");
            return (
              <tr key={t.c} className={rc}>
                <td>
                  <div className="team-cell">
                    <div className={`pos-badge ${pc}`}>{idx + 1}</div>
                    <span className="flag">{t.f}</span>
                    <span className="team-name">{t.c}</span>
                  </div>
                </td>
                <td>{t.pj}</td><td>{t.pg}</td><td>{t.pe}</td><td>{t.pp}</td>
                <td>{t.gf}</td><td>{t.gc}</td>
                <td>{t.dg > 0 ? "+" + t.dg : t.dg}</td>
                <td><strong>{t.pts}</strong></td>
                <td><FormIcons form={t.form} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="matches-section">
        {ms.map((m, i) => {
          const k = gk + "_" + i;
          const sc = scores[k] || { h: "", a: "" };
          const t1 = getTeam(m[0]), t2 = getTeam(m[1]);
          return (
            <div key={i} className="match-row">
              <span className="match-date">{m[2]}</span>
              <div className="match-teams">
                <div className="mteam home">
                  <span className="mname">{m[0]}</span>
                  <span className="flag">{t1.f}</span>
                </div>
                {isAdmin ? (
                  <div className="score-wrap">
                    <input type="number" className="sinput" min="0" max="30"
                      value={sc.h} placeholder="-"
                      onChange={e => onScoreChange(gk, i, "h", e.target.value)} />
                    <span className="ssep">-</span>
                    <input type="number" className="sinput" min="0" max="30"
                      value={sc.a} placeholder="-"
                      onChange={e => onScoreChange(gk, i, "a", e.target.value)} />
                  </div>
                ) : (
                  <ScoreDisplay h={sc.h} a={sc.a} />
                )}
                <div className="mteam">
                  <span className="flag">{t2.f}</span>
                  <span className="mname">{m[1]}</span>
                </div>
              </div>
              <button className="info-btn" onClick={() => setDetail(i)}>ℹ️</button>
            </div>
          );
        })}
      </div>
      {detail !== null && (
        <MatchDetail gk={gk} matchIdx={detail} score={scores[gk + "_" + detail] || { h: "", a: "" }} onClose={() => setDetail(null)} />
      )}
    </div>
  );
}

export default function Groups({ scores, onScoreChange, isAdmin }) {
  return (
    <div>
      <div className="legend">
        <div className="leg-item"><div className="leg-dot" style={{ background: "#1a5c35" }} />Clasificado (1° y 2°)</div>
        <div className="leg-item"><div className="leg-dot" style={{ background: "#7d5a0a" }} />Posible mejor 3°</div>
        <div className="leg-item"><div className="leg-dot" style={{ border: "0.5px solid #2d3f55" }} />Eliminado</div>
        <div className="leg-item" style={{ marginLeft: "auto", gap: 6 }}>
          <div className="fi fi-w" style={{ width: 14, height: 14, fontSize: 9 }}>✓</div> Victoria
          <div className="fi fi-d" style={{ width: 14, height: 14, fontSize: 7 }}>—</div> Empate
          <div className="fi fi-l" style={{ width: 14, height: 14, fontSize: 9 }}>✕</div> Derrota
        </div>
      </div>
      <div className="groups-grid">
        {Object.keys(GROUPS).map(gk => (
          <GroupCard key={gk} gk={gk} scores={scores} onScoreChange={onScoreChange} isAdmin={isAdmin} />
        ))}
      </div>
    </div>
  );
}
