import { GROUPS, MATCHES, confirmedTop2, confirmedBestThirds, isGroupComplete, calcStandings } from "../data";

const TBD = { c: "Por definir", f: "🏳️" };

// Build a descriptive placeholder showing current leader while group is incomplete
function pendingTeam(gk, pos, scores) {
  const complete = isGroupComplete(gk, scores);
  if (complete) return TBD; // shouldn't happen but safeguard
  const s = calcStandings(gk, scores);
  const played = s.filter(t => t.pj > 0).length;
  if (played === 0) return { ...TBD, label: `Grupo ${gk}` };
  const t = s[pos];
  if (!t) return { ...TBD, label: `Grupo ${gk}` };
  // Show current leader but mark as provisional
  return { c: `${t.c}*`, f: t.f, provisional: true, label: `Grupo ${gk}` };
}

function winner(t1, t2, sc) {
  if (!sc || sc.h === "" || sc.a === "") return null;
  const h = +sc.h, a = +sc.a;
  if (h > a) return t1;
  if (a > h) return t2;
  return null;
}

function BracketMatch({ t1, t2, scoreKey, scores, onScore, isAdmin }) {
  const sc = scores[scoreKey] || { h: "", a: "" };
  const h = sc.h !== "" ? +sc.h : null;
  const a = sc.a !== "" ? +sc.a : null;
  const w1 = h !== null && a !== null && h > a;
  const w2 = h !== null && a !== null && a > h;
  const t1Tbd = !t1 || t1.c === "Por definir" || t1.provisional;
  const t2Tbd = !t2 || t2.c === "Por definir" || t2.provisional;
  const canEdit = isAdmin && !t1Tbd && !t2Tbd;
  const t1display = t1 || TBD;
  const t2display = t2 || TBD;

  return (
    <div className={`bm ${t1Tbd && t2Tbd ? "bm-pending" : ""}`}>
      <div className={`bt ${w1 ? "winner" : ""} ${t1Tbd ? "tbd-row" : ""}`}>
        <span className="bf">{t1display.f}</span>
        <span className="bn" title={t1display.provisional ? "Posición provisional" : ""}>
          {t1display.c}
          {t1display.provisional && <span className="provisional-mark"> ?</span>}
        </span>
        {canEdit
          ? <input className="bsi" type="number" min="0" value={sc.h} placeholder="-"
              onChange={e => onScore(scoreKey, "h", e.target.value)} />
          : <span className="bs">{h !== null && !t1Tbd ? h : ""}</span>}
      </div>
      <div className={`bt ${w2 ? "winner" : ""} ${t2Tbd ? "tbd-row" : ""}`}>
        <span className="bf">{t2display.f}</span>
        <span className="bn" title={t2display.provisional ? "Posición provisional" : ""}>
          {t2display.c}
          {t2display.provisional && <span className="provisional-mark"> ?</span>}
        </span>
        {canEdit
          ? <input className="bsi" type="number" min="0" value={sc.a} placeholder="-"
              onChange={e => onScore(scoreKey, "a", e.target.value)} />
          : <span className="bs">{a !== null && !t2Tbd ? a : ""}</span>}
      </div>
    </div>
  );
}

export default function Bracket({ scores, onBracketScore, isAdmin }) {
  // Only use confirmed teams — groups must be fully complete
  const top2 = {};
  Object.keys(GROUPS).forEach(gk => {
    const [first, second] = confirmedTop2(gk, scores);
    top2[gk] = { first, second };
  });
  const thirds = confirmedBestThirds(scores);

  // Helper: confirmed team or provisional placeholder
  const get = (gk, pos) => {
    const t = pos === 0 ? top2[gk].first : top2[gk].second;
    if (t) return t;
    return pendingTeam(gk, pos, scores);
  };
  const get3 = i => thirds[i] || { ...TBD, label: `Mejor 3° · puesto ${i + 1}` };

  const allGroupsComplete = Object.keys(GROUPS).every(g => isGroupComplete(g, scores));

  const r32 = [
    [get("A",0), get("B",2)],  [get("C",1), get("D",0)],
    [get("E",0), get("F",2)],  [get("G",1), get("H",0)],
    [get("I",0), get("J",2)],  [get("K",1), get("L",0)],
    [get3(0),    get3(1)],     [get3(2),    get3(3)],
    [get("A",1), get("B",0)],  [get("C",0), get("D",1)],
    [get("E",1), get("F",0)],  [get("G",0), get("H",1)],
    [get("I",1), get("J",0)],  [get("K",0), get("L",1)],
    [get3(4),    get3(5)],     [get3(6),    get3(7)]
  ];

  // For knockout rounds, only advance confirmed winners
  const r16 = r32.map((pair, i) => {
    if (pair[0].provisional || pair[1].provisional) return TBD;
    return winner(pair[0], pair[1], scores["r32_" + i]) || TBD;
  });
  const r16p = [];
  for (let i = 0; i < 16; i += 2) r16p.push([r16[i], r16[i + 1]]);

  const qf = r16p.map((pair, i) => {
    if (pair[0].c === "Por definir" || pair[1].c === "Por definir") return TBD;
    return winner(pair[0], pair[1], scores["r16_" + i]) || TBD;
  });
  const qfp = [];
  for (let i = 0; i < 8; i += 2) qfp.push([qf[i], qf[i + 1]]);

  const sf = qfp.map((pair, i) => {
    if (pair[0].c === "Por definir" || pair[1].c === "Por definir") return TBD;
    return winner(pair[0], pair[1], scores["qf_" + i]) || TBD;
  });

  const fin = [
    sf[0].c !== "Por definir" && sf[1].c !== "Por definir" ? winner(sf[0], sf[1], scores["sf_0"]) || TBD : TBD,
    sf[2].c !== "Por definir" && sf[3].c !== "Por definir" ? winner(sf[2], sf[3], scores["sf_1"]) || TBD : TBD
  ];
  const champ = fin[0].c !== "Por definir" && fin[1].c !== "Por definir"
    ? winner(fin[0], fin[1], scores["final_0"]) || TBD
    : TBD;

  const bm = (t1, t2, key) => (
    <BracketMatch key={key} t1={t1} t2={t2} scoreKey={key}
      scores={scores} onScore={onBracketScore} isAdmin={isAdmin} />
  );

  // Count how many groups are complete
  const completedGroups = Object.keys(GROUPS).filter(g => isGroupComplete(g, scores)).length;

  return (
    <div>
      <div className="bracket-info">
        El bracket se actualiza solo con clasificaciones <strong>confirmadas</strong> — grupo completo (6 partidos jugados).
        {!allGroupsComplete && (
          <span className="bracket-progress"> · {completedGroups}/12 grupos completos</span>
        )}
      </div>
      {!allGroupsComplete && (
        <div className="bracket-notice">
          <span>⏳</span>
          <span>
            Los cruces marcados con <strong>?</strong> muestran el líder provisional — pueden cambiar cuando termine el grupo.
            {completedGroups === 0 && " Los cruces se confirmarán conforme terminen los grupos."}
          </span>
        </div>
      )}
      {champ.c !== "Por definir" && (
        <div className="champ-box">
          <div style={{ fontSize: 42 }}>{champ.f}</div>
          <div style={{ fontSize: 18, fontWeight: 500, marginTop: 4 }}>🏆 {champ.c}</div>
          <div style={{ fontSize: 12, color: "#8892a4", marginTop: 2 }}>Campeón Mundial 2026</div>
        </div>
      )}
      <div className="bracket-container">
        <div className="bracket-rounds">
          <div className="round-col">
            <div className="round-title">Ronda de 32</div>
            {r32.slice(0, 8).map((_, i) => bm(r32[i][0], r32[i][1], "r32_" + i))}
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 16</div>
            <div style={{ marginTop: 22 }}>
              {r16p.slice(0, 4).map(([a, b], i) => bm(a, b, "r16_" + i))}
            </div>
          </div>
          <div className="round-col">
            <div className="round-title">Cuartos</div>
            <div style={{ marginTop: 66 }}>
              {qfp.slice(0, 2).map(([a, b], i) => bm(a, b, "qf_" + i))}
            </div>
          </div>
          <div className="round-col">
            <div className="round-title">Semifinal</div>
            <div style={{ marginTop: 132 }}>{bm(sf[0], sf[1], "sf_0")}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Final</div>
            <div style={{ marginTop: 200 }}>{bm(fin[0], fin[1], "final_0")}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Semifinal</div>
            <div style={{ marginTop: 132 }}>{bm(sf[2], sf[3], "sf_1")}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Cuartos</div>
            <div style={{ marginTop: 66 }}>
              {qfp.slice(2).map(([a, b], i) => bm(a, b, "qf_" + (i + 2)))}
            </div>
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 16</div>
            <div style={{ marginTop: 22 }}>
              {r16p.slice(4).map(([a, b], i) => bm(a, b, "r16_" + (i + 4)))}
            </div>
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 32</div>
            {r32.slice(8).map((_, i) => bm(r32[i + 8][0], r32[i + 8][1], "r32_" + (i + 8)))}
          </div>
        </div>
      </div>
    </div>
  );
}
