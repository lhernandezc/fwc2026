import React from "react";

const TBD = { c: "Por definir", f: "🏳️" };

const TEAMS = {
  "Mexico":        { c: "Mexico",        f: "🇲🇽" },
  "Switzerland":   { c: "Switzerland",   f: "🇨🇭" },
  "Brazil":        { c: "Brazil",        f: "🇧🇷" },
  "USA":           { c: "USA",           f: "🇺🇸" },
  "Germany":       { c: "Germany",       f: "🇩🇪" },
  "Netherlands":   { c: "Netherlands",   f: "🇳🇱" },
  "Belgium":       { c: "Belgium",       f: "🇧🇪" },
  "Spain":         { c: "Spain",         f: "🇪🇸" },
  "France":        { c: "France",        f: "🇫🇷" },
  "Argentina":     { c: "Argentina",     f: "🇦🇷" },
  "Colombia":      { c: "Colombia",      f: "🇨🇴" },
  "England":       { c: "England",       f: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  "South Africa":  { c: "South Africa",  f: "🇿🇦" },
  "Canada":        { c: "Canada",        f: "🇨🇦" },
  "Morocco":       { c: "Morocco",       f: "🇲🇦" },
  "Japan":         { c: "Japan",         f: "🇯🇵" },
  "Ivory Coast":   { c: "Ivory Coast",   f: "🇨🇮" },
  "Norway":        { c: "Norway",        f: "🇳🇴" },
  "Egypt":         { c: "Egypt",         f: "🇪🇬" },
  "Australia":     { c: "Australia",     f: "🇦🇺" },
  "Cape Verde":    { c: "Cape Verde",    f: "🇨🇻" },
  "Portugal":      { c: "Portugal",      f: "🇵🇹" },
  "Ghana":         { c: "Ghana",         f: "🇬🇭" },
  "Croatia":       { c: "Croatia",       f: "🇭🇷" },
  "Austria":       { c: "Austria",       f: "🇦🇹" },
  "Ecuador":       { c: "Ecuador",       f: "🇪🇨" },
  "Sweden":        { c: "Sweden",        f: "🇸🇪" },
  "Bosnia":        { c: "Bosnia",        f: "🇧🇦" },
  "Paraguay":      { c: "Paraguay",      f: "🇵🇾" },
  "Senegal":       { c: "Senegal",       f: "🇸🇳" },
  "DR Congo":      { c: "DR Congo",      f: "🇨🇩" },
  "Algeria":       { c: "Algeria",       f: "🇩🇿" },
};

function tm(name) { return TEAMS[name] || { c: name, f: "🏳️" }; }

const R32 = [
  // LEFT SIDE
  { id:"r32_0",  t1:tm("South Africa"), t2:tm("Canada"),      date:"Jun 28", venue:"SoFi, Los Ángeles" },
  { id:"r32_1",  t1:tm("Brazil"),       t2:tm("Japan"),       date:"Jun 29", venue:"NRG, Houston" },
  { id:"r32_2",  t1:tm("Germany"),      t2:tm("Paraguay"),    date:"Jun 29", venue:"Gillette, Boston" },
  { id:"r32_3",  t1:tm("Netherlands"),  t2:tm("Morocco"),     date:"Jun 29", venue:"BBVA, Monterrey" },
  { id:"r32_4",  t1:tm("Ivory Coast"),  t2:tm("Norway"),      date:"Jun 30", venue:"AT&T, Dallas" },
  { id:"r32_5",  t1:tm("France"),       t2:tm("Sweden"),      date:"Jun 30", venue:"MetLife, New Jersey" },
  { id:"r32_6",  t1:tm("Mexico"),       t2:tm("Ecuador"),     date:"Jun 30", venue:"Azteca, Ciudad de México" },
  { id:"r32_7",  t1:tm("England"),      t2:tm("DR Congo"),    date:"Jul 1",  venue:"Mercedes-Benz, Atlanta" },
  // RIGHT SIDE
  { id:"r32_8",  t1:tm("Belgium"),      t2:tm("Senegal"),     date:"Jul 1",  venue:"Lumen Field, Seattle" },
  { id:"r32_9",  t1:tm("USA"),          t2:tm("Bosnia"),      date:"Jul 1",  venue:"Levi's, San Francisco" },
  { id:"r32_10", t1:tm("Spain"),        t2:tm("Austria"),     date:"Jul 2",  venue:"SoFi, Los Ángeles" },
  { id:"r32_11", t1:tm("Portugal"),     t2:tm("Croatia"),     date:"Jul 2",  venue:"BMO Field, Toronto" },
  { id:"r32_12", t1:tm("Switzerland"),  t2:tm("Algeria"),     date:"Jul 2",  venue:"BC Place, Vancouver" },
  { id:"r32_13", t1:tm("Australia"),    t2:tm("Egypt"),       date:"Jul 3",  venue:"AT&T, Dallas" },
  { id:"r32_14", t1:tm("Argentina"),    t2:tm("Cape Verde"),  date:"Jul 3",  venue:"Hard Rock, Miami" },
  { id:"r32_15", t1:tm("Colombia"),     t2:tm("Ghana"),       date:"Jul 3",  venue:"Arrowhead, Kansas City" },
];

function getWinner(match, scores) {
  const sc = scores[match.id] || {};
  if (sc.h === "" || sc.a === "" || sc.h == null || sc.a == null) return null;
  const h = +sc.h, a = +sc.a;
  if (h > a) return match.t1;
  if (a > h) return match.t2;
  return null;
}

// Returns the LOSER of a match (for 3rd place)
function getLoser(match, scores) {
  const sc = scores[match.id] || {};
  if (sc.h === "" || sc.a === "" || sc.h == null || sc.a == null) return null;
  const h = +sc.h, a = +sc.a;
  if (h > a) return match.t2;
  if (a > h) return match.t1;
  return null;
}

function buildRound(winners, prefix) {
  return Array.from({ length: winners.length / 2 }, (_, i) => ({
    id: `${prefix}_${i}`,
    t1: winners[i * 2] || TBD,
    t2: winners[i * 2 + 1] || TBD,
  }));
}

function BracketMatch({ match, scores, onScore, isAdmin, compact }) {
  const sc = scores[match.id] || { h: "", a: "" };
  const h = sc.h !== "" ? +sc.h : null;
  const a = sc.a !== "" ? +sc.a : null;
  const w1 = h !== null && a !== null && h > a;
  const w2 = h !== null && a !== null && a > h;
  const t1 = match.t1 || TBD;
  const t2 = match.t2 || TBD;
  const isTbd = t1.c === "Por definir" || t2.c === "Por definir";
  const canEdit = isAdmin && !isTbd;

  return (
    <div className="bm">
      {match.date && !compact && (
        <div className="bm-date">{match.date} · {match.venue}</div>
      )}
      {match.date && compact && (
        <div className="bm-date">{match.date}</div>
      )}
      <div className={`bt ${w1 ? "winner" : ""} ${t1.c === "Por definir" ? "tbd-row" : ""}`}>
        <span className="bf">{t1.f}</span>
        <span className="bn">{t1.c}</span>
        {canEdit
          ? <input className="bsi" type="number" min="0" value={sc.h} placeholder="-"
              onChange={e => onScore(match.id, "h", e.target.value)} />
          : <span className="bs">{h !== null ? h : ""}</span>}
      </div>
      <div className={`bt ${w2 ? "winner" : ""} ${t2.c === "Por definir" ? "tbd-row" : ""}`}>
        <span className="bf">{t2.f}</span>
        <span className="bn">{t2.c}</span>
        {canEdit
          ? <input className="bsi" type="number" min="0" value={sc.a} placeholder="-"
              onChange={e => onScore(match.id, "a", e.target.value)} />
          : <span className="bs">{a !== null ? a : ""}</span>}
      </div>
    </div>
  );
}

export default function Bracket({ scores, onBracketScore, isAdmin }) {
  const r32Winners = R32.map(m => getWinner(m, scores));
  const r16 = buildRound(r32Winners, "r16");
  const r16Winners = r16.map(m => getWinner(m, scores));
  const qf = buildRound(r16Winners, "qf");
  const qfWinners = qf.map(m => getWinner(m, scores));
  const sf = buildRound(qfWinners, "sf");
  const sfWinners = sf.map(m => getWinner(m, scores));

  // Final
  const finalMatch = {
    id: "final_0",
    t1: sfWinners[0] || TBD,
    t2: sfWinners[1] || TBD,
    date: "Jul 19",
    venue: "MetLife, New Jersey"
  };
  const champ = getWinner(finalMatch, scores);

  // 3rd place: losers of both semis
  const sf0Loser = getLoser(sf[0], scores) || TBD;
  const sf1Loser = getLoser(sf[1], scores) || TBD;
  const thirdPlaceMatch = {
    id: "third_place",
    t1: sf0Loser,
    t2: sf1Loser,
    date: "Jul 18",
    venue: "MetLife, New Jersey"
  };
  const thirdPlace = getWinner(thirdPlaceMatch, scores);

  const bm = (match, compact) => (
    <BracketMatch key={match.id} match={match} scores={scores}
      onScore={onBracketScore} isAdmin={isAdmin} compact={compact} />
  );

  return (
    <div>
      <div className="bracket-info">
        Bracket oficial Ronda de 32 — FIFA World Cup 2026. Ingresa los marcadores para avanzar el torneo.
      </div>

      {/* Champion + 3rd place display */}
      {(champ || thirdPlace) && (
        <div style={{ display: "flex", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
          {champ && (
            <div className="champ-box" style={{ flex: 1, minWidth: 140 }}>
              <div style={{ fontSize: 36 }}>{champ.f}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>🏆 {champ.c}</div>
              <div style={{ fontSize: 11, color: "#8892a4", marginTop: 2 }}>Campeón Mundial 2026</div>
            </div>
          )}
          {thirdPlace && (
            <div className="champ-box" style={{ flex: 1, minWidth: 140, background: "rgba(125,90,10,0.1)", borderColor: "rgba(125,90,10,0.35)" }}>
              <div style={{ fontSize: 36 }}>{thirdPlace.f}</div>
              <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>🥉 {thirdPlace.c}</div>
              <div style={{ fontSize: 11, color: "#8892a4", marginTop: 2 }}>Tercer lugar</div>
            </div>
          )}
        </div>
      )}

      <div className="bracket-container">
        <div className="bracket-rounds">
          {/* LEFT SIDE */}
          <div className="round-col">
            <div className="round-title">Ronda de 32</div>
            {R32.slice(0, 8).map(m => bm(m))}
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 16</div>
            <div style={{ marginTop: 36 }}>{r16.slice(0, 4).map(m => bm(m))}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Cuartos</div>
            <div style={{ marginTop: 100 }}>{qf.slice(0, 2).map(m => bm(m))}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Semifinal</div>
            <div style={{ marginTop: 196 }}>{bm(sf[0])}</div>
          </div>

          {/* CENTER — Final + 3rd place */}
          <div className="round-col" style={{ minWidth: 160 }}>
            <div className="round-title">Final · Jul 19</div>
            <div style={{ marginTop: 292 }}>{bm(finalMatch)}</div>
            <div style={{ marginTop: 16 }}>
              <div className="round-title" style={{ borderBottom: "none", color: "#7d5a0a", marginBottom: 4 }}>
                Tercer Lugar · Jul 18
              </div>
              {bm(thirdPlaceMatch, true)}
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="round-col">
            <div className="round-title">Semifinal</div>
            <div style={{ marginTop: 196 }}>{bm(sf[1])}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Cuartos</div>
            <div style={{ marginTop: 100 }}>{qf.slice(2).map(m => bm(m))}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 16</div>
            <div style={{ marginTop: 36 }}>{r16.slice(4).map(m => bm(m))}</div>
          </div>
          <div className="round-col">
            <div className="round-title">Ronda de 32</div>
            {R32.slice(8).map(m => bm(m))}
          </div>
        </div>
      </div>
    </div>
  );
}
