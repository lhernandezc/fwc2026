import React, { useRef, useEffect, useState } from "react";

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

// Official R32 — left side [0-7], right side [8-15]
const R32 = [
  { id:"r32_0",  t1:tm("South Africa"), t2:tm("Canada"),     date:"Jun 28" },
  { id:"r32_1",  t1:tm("Brazil"),       t2:tm("Japan"),      date:"Jun 29" },
  { id:"r32_2",  t1:tm("Germany"),      t2:tm("Paraguay"),   date:"Jun 29" },
  { id:"r32_3",  t1:tm("Netherlands"),  t2:tm("Morocco"),    date:"Jun 29" },
  { id:"r32_4",  t1:tm("Ivory Coast"),  t2:tm("Norway"),     date:"Jun 30" },
  { id:"r32_5",  t1:tm("France"),       t2:tm("Sweden"),     date:"Jun 30" },
  { id:"r32_6",  t1:tm("Mexico"),       t2:tm("Ecuador"),    date:"Jun 30" },
  { id:"r32_7",  t1:tm("England"),      t2:tm("DR Congo"),   date:"Jul 1"  },
  { id:"r32_8",  t1:tm("Belgium"),      t2:tm("Senegal"),    date:"Jul 1"  },
  { id:"r32_9",  t1:tm("USA"),          t2:tm("Bosnia"),     date:"Jul 1"  },
  { id:"r32_10", t1:tm("Spain"),        t2:tm("Austria"),    date:"Jul 2"  },
  { id:"r32_11", t1:tm("Portugal"),     t2:tm("Croatia"),    date:"Jul 2"  },
  { id:"r32_12", t1:tm("Switzerland"),  t2:tm("Algeria"),    date:"Jul 2"  },
  { id:"r32_13", t1:tm("Australia"),    t2:tm("Egypt"),      date:"Jul 3"  },
  { id:"r32_14", t1:tm("Argentina"),    t2:tm("Cape Verde"), date:"Jul 3"  },
  { id:"r32_15", t1:tm("Colombia"),     t2:tm("Ghana"),      date:"Jul 3"  },
];

function getWinner(match, scores) {
  const sc = scores[match.id] || {};
  if (sc.h == null || sc.a == null || sc.h === "" || sc.a === "") return null;
  const h = +sc.h, a = +sc.a;
  if (h > a) return match.t1;
  if (a > h) return match.t2;
  return null;
}
function getLoser(match, scores) {
  const sc = scores[match.id] || {};
  if (sc.h == null || sc.a == null || sc.h === "" || sc.a === "") return null;
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

// Layout constants
const CARD_W = 148;
const CARD_H = 52; // height of one match card (2 teams)
const CARD_DATE_H = 14;
const TOTAL_CARD_H = CARD_H + CARD_DATE_H;
const COL_GAP = 32; // horizontal gap between rounds
const COL_W = CARD_W + COL_GAP;
const ROUNDS = 5; // r32, r16, qf, sf, final (one side)
const TOTAL_COLS = 9; // r32L, r16L, qfL, sfL, final, sfR, qfR, r16R, r32R

// Vertical spacing: each round doubles the gap between matches
// r32: 8 matches per side, r16: 4, qf: 2, sf: 1
function matchY(roundIdx, matchIdxInRound) {
  // roundIdx 0=r32, 1=r16, 2=qf, 3=sf, 4=final
  const spacing = TOTAL_CARD_H * Math.pow(2, roundIdx);
  const offset = spacing / 2 - TOTAL_CARD_H / 2;
  return offset + matchIdxInRound * spacing;
}

const TOTAL_HEIGHT = matchY(0, 7) + TOTAL_CARD_H + 20; // r32 last match bottom + padding
const TOTAL_WIDTH = TOTAL_COLS * COL_W + CARD_W;

function colX(colIdx) {
  return colIdx * COL_W;
}

// Map rounds to column indices
// Left side: r32=0, r16=1, qf=2, sf=3
// Center: final=4
// Right side: sf=5, qf=6, r16=7, r32=8
const COL = { r32L:0, r16L:1, qfL:2, sfL:3, final:4, sfR:5, qfR:6, r16R:7, r32R:8 };

function TeamRow({ team, score, isWinner, canEdit, onInput, scoreKey, side }) {
  const isTbd = !team || team.c === "Por definir";
  return (
    <div style={{
      display:"flex", alignItems:"center", gap:4, padding:"4px 6px",
      background: isWinner ? "rgba(26,92,53,0.18)" : "transparent",
      borderBottom: side === "t1" ? "0.5px solid #2d3f55" : "none",
      height: CARD_H / 2,
      opacity: isTbd ? 0.45 : 1,
    }}>
      <span style={{fontSize:13, flexShrink:0}}>{team?.f || "🏳️"}</span>
      <span style={{fontSize:10, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
        color: isWinner ? "#fff" : "#c8d0dc", fontWeight: isWinner ? 600 : 400}}>
        {team?.c || "Por definir"}
      </span>
      {canEdit && !isTbd ? (
        <input
          type="number" min="0"
          value={score}
          placeholder="-"
          onChange={e => onInput(scoreKey, side === "t1" ? "h" : "a", e.target.value)}
          style={{
            width:22, height:18, border:"0.5px solid #2d3f55", borderRadius:3,
            background:"#1e2939", textAlign:"center", fontSize:11, fontWeight:500,
            color:"#f1f5f9", fontFamily:"inherit", padding:0,
            WebkitAppearance:"none", MozAppearance:"textfield"
          }}
        />
      ) : (
        <span style={{fontSize:11, fontWeight:600, minWidth:14, textAlign:"right",
          color: isWinner ? "#4ade80" : "#8892a4"}}>
          {score !== "" ? score : ""}
        </span>
      )}
    </div>
  );
}

function MatchCard({ match, scores, onScore, isAdmin, x, y }) {
  const sc = scores[match.id] || { h:"", a:"" };
  const h = sc.h !== "" ? +sc.h : null;
  const a = sc.a !== "" ? +sc.a : null;
  const w1 = h !== null && a !== null && h > a;
  const w2 = h !== null && a !== null && a > h;
  const t1 = match.t1 || TBD;
  const t2 = match.t2 || TBD;
  const isTbd = t1.c === "Por definir" && t2.c === "Por definir";
  const canEdit = isAdmin && !isTbd && t1.c !== "Por definir" && t2.c !== "Por definir";

  return (
    <div style={{
      position:"absolute", left:x, top:y + CARD_DATE_H,
      width:CARD_W, background:"#273347",
      border:"0.5px solid #2d3f55", borderRadius:8, overflow:"hidden",
      boxShadow:"0 2px 8px rgba(0,0,0,0.25)"
    }}>
      {match.date && (
        <div style={{
          position:"absolute", top:-CARD_DATE_H, left:0, right:0,
          fontSize:9, color:"#8892a4", padding:"0 6px",
          letterSpacing:"0.3px", lineHeight:`${CARD_DATE_H}px`
        }}>{match.date}</div>
      )}
      <TeamRow team={t1} score={sc.h} isWinner={w1} canEdit={canEdit}
        onInput={onScore} scoreKey={match.id} side="t1" />
      <TeamRow team={t2} score={sc.a} isWinner={w2} canEdit={canEdit}
        onInput={onScore} scoreKey={match.id} side="t2" />
    </div>
  );
}

// Draw connector lines between rounds
// Each match connects to the next round via horizontal + vertical lines
function ConnectorLines({ matchesLeft, matchesRight, scores, allMatches }) {
  const lines = [];
  const strokeDefault = "#2d3f55";
  const strokeWinner = "#1a5c35";
  const strokeW = 1.5;

  function midY(x, y) {
    // midpoint of a card (vertically centered)
    return y + CARD_DATE_H + CARD_H / 2;
  }

  // For each pair of consecutive rounds (left side): r32→r16→qf→sf→final
  const leftRounds = [matchesLeft.r32, matchesLeft.r16, matchesLeft.qf, matchesLeft.sf];
  const leftCols = [COL.r32L, COL.r16L, COL.qfL, COL.sfL];

  leftRounds.forEach((round, ri) => {
    if (!leftRounds[ri + 1]) return;
    const nextRound = leftRounds[ri + 1];
    const curCol = leftCols[ri];
    const nextCol = leftCols[ri + 1];
    const rightEdge = colX(curCol) + CARD_W;
    const leftEdge = colX(nextCol);
    const midX = rightEdge + (leftEdge - rightEdge) / 2;

    round.forEach((match, mi) => {
      const parentIdx = Math.floor(mi / 2);
      const parentMatch = nextRound[parentIdx];
      if (!parentMatch) return;

      const curY = midY(colX(curCol), matchY(ri, mi));
      const parentY = midY(colX(nextCol), matchY(ri + 1, parentIdx));

      const winner = getWinner(match, scores);
      const isWinnerLine = winner !== null;
      const stroke = isWinnerLine ? strokeWinner : strokeDefault;

      lines.push(
        <line key={`ll-${ri}-${mi}-h`}
          x1={rightEdge} y1={curY} x2={midX} y2={curY}
          stroke={stroke} strokeWidth={strokeW} />
      );
      // vertical segment connecting to sibling
      if (mi % 2 === 0) {
        const siblingY = midY(colX(curCol), matchY(ri, mi + 1));
        const siblingMatch = round[mi + 1];
        const sibWinner = siblingMatch ? getWinner(siblingMatch, scores) : null;
        const vStroke = (isWinnerLine || sibWinner) ? strokeWinner : strokeDefault;
        lines.push(
          <line key={`ll-${ri}-${mi}-v`}
            x1={midX} y1={curY} x2={midX} y2={siblingY}
            stroke={vStroke} strokeWidth={strokeW} />
        );
        lines.push(
          <line key={`ll-${ri}-${mi}-sib-h`}
            x1={rightEdge} y1={siblingY} x2={midX} y2={siblingY}
            stroke={sibWinner ? strokeWinner : strokeDefault} strokeWidth={strokeW} />
        );
      }
      // horizontal to parent
      lines.push(
        <line key={`ll-${ri}-${mi}-ph`}
          x1={midX} y1={parentY} x2={leftEdge} y2={parentY}
          stroke={isWinnerLine ? strokeWinner : strokeDefault} strokeWidth={strokeW} />
      );
    });
  });

  // Right side (mirror): r32R→r16R→qfR→sfR
  const rightRounds = [matchesRight.r32, matchesRight.r16, matchesRight.qf, matchesRight.sf];
  const rightCols = [COL.r32R, COL.r16R, COL.qfR, COL.sfR];

  rightRounds.forEach((round, ri) => {
    if (!rightRounds[ri + 1]) return;
    const nextRound = rightRounds[ri + 1];
    const curCol = rightCols[ri];
    const nextCol = rightCols[ri + 1];
    // Right side: lines go LEFT toward center
    const leftEdge = colX(curCol);
    const rightEdge = colX(nextCol) + CARD_W;
    const midX = rightEdge + (leftEdge - rightEdge) / 2;

    round.forEach((match, mi) => {
      const parentIdx = Math.floor(mi / 2);
      const parentMatch = nextRound[parentIdx];
      if (!parentMatch) return;

      const curY = midY(colX(curCol), matchY(ri, mi));
      const parentY = midY(colX(nextCol), matchY(ri + 1, parentIdx));

      const winner = getWinner(match, scores);
      const isWinnerLine = winner !== null;
      const stroke = isWinnerLine ? strokeWinner : strokeDefault;

      lines.push(
        <line key={`rl-${ri}-${mi}-h`}
          x1={leftEdge} y1={curY} x2={midX} y2={curY}
          stroke={stroke} strokeWidth={strokeW} />
      );
      if (mi % 2 === 0) {
        const siblingY = midY(colX(curCol), matchY(ri, mi + 1));
        const siblingMatch = round[mi + 1];
        const sibWinner = siblingMatch ? getWinner(siblingMatch, scores) : null;
        const vStroke = (isWinnerLine || sibWinner) ? strokeWinner : strokeDefault;
        lines.push(
          <line key={`rl-${ri}-${mi}-v`}
            x1={midX} y1={curY} x2={midX} y2={siblingY}
            stroke={vStroke} strokeWidth={strokeW} />
        );
        lines.push(
          <line key={`rl-${ri}-${mi}-sib-h`}
            x1={leftEdge} y1={siblingY} x2={midX} y2={siblingY}
            stroke={sibWinner ? strokeWinner : strokeDefault} strokeWidth={strokeW} />
        );
      }
      lines.push(
        <line key={`rl-${ri}-${mi}-ph`}
          x1={midX} y1={parentY} x2={rightEdge} y2={parentY}
          stroke={isWinnerLine ? strokeWinner : strokeDefault} strokeWidth={strokeW} />
      );
    });
  });

  // SF left → Final
  const sfLMatch = matchesLeft.sf[0];
  const sfRMatch = matchesRight.sf[0];
  const finalMatch = allMatches.final;
  if (sfLMatch && finalMatch) {
    const sfLY = midY(colX(COL.sfL), matchY(3, 0));
    const finalY = midY(colX(COL.final), matchY(4, 0));
    const rightEdge = colX(COL.sfL) + CARD_W;
    const leftEdge = colX(COL.final);
    const midX = rightEdge + (leftEdge - rightEdge) / 2;
    const winner = getWinner(sfLMatch, scores);
    const stroke = winner ? strokeWinner : strokeDefault;
    lines.push(<line key="sf-l-h" x1={rightEdge} y1={sfLY} x2={midX} y2={sfLY} stroke={stroke} strokeWidth={strokeW} />);
    lines.push(<line key="sf-l-v" x1={midX} y1={sfLY} x2={midX} y2={finalY} stroke={stroke} strokeWidth={strokeW} />);
    lines.push(<line key="sf-l-ph" x1={midX} y1={finalY} x2={leftEdge} y2={finalY} stroke={stroke} strokeWidth={strokeW} />);
  }
  if (sfRMatch && finalMatch) {
    const sfRY = midY(colX(COL.sfR), matchY(3, 0));
    const finalY = midY(colX(COL.final), matchY(4, 0));
    const leftEdge = colX(COL.sfR);
    const rightEdge = colX(COL.final) + CARD_W;
    const midX = rightEdge + (leftEdge - rightEdge) / 2;
    const winner = getWinner(sfRMatch, scores);
    const stroke = winner ? strokeWinner : strokeDefault;
    lines.push(<line key="sf-r-h" x1={leftEdge} y1={sfRY} x2={midX} y2={sfRY} stroke={stroke} strokeWidth={strokeW} />);
    lines.push(<line key="sf-r-v" x1={midX} y1={sfRY} x2={midX} y2={finalY} stroke={stroke} strokeWidth={strokeW} />);
    lines.push(<line key="sf-r-ph" x1={midX} y1={finalY} x2={rightEdge} y2={finalY} stroke={stroke} strokeWidth={strokeW} />);
  }

  return <>{lines}</>;
}

export default function Bracket({ scores, onBracketScore, isAdmin }) {
  const r32Winners = R32.map(m => getWinner(m, scores));

  // Left side r16: matches 0-3 from r32 winners 0-7
  const r16L = buildRound(r32Winners.slice(0, 8), "r16");
  const r16LWinners = r16L.map(m => getWinner(m, scores));
  const qfL = buildRound(r16LWinners.slice(0, 4), "qf");
  const qfLWinners = qfL.map(m => getWinner(m, scores));
  const sfL = buildRound(qfLWinners.slice(0, 2), "sf");
  const sfLWinners = sfL.map(m => getWinner(m, scores));

  // Right side r16: matches 4-7 from r32 winners 8-15
  const r16R = buildRound(r32Winners.slice(8), "r16r");
  const r16RWinners = r16R.map(m => getWinner(m, scores));
  const qfR = buildRound(r16RWinners.slice(0, 4), "qfr");
  const qfRWinners = qfR.map(m => getWinner(m, scores));
  const sfR = buildRound(qfRWinners.slice(0, 2), "sfr");
  const sfRWinners = sfR.map(m => getWinner(m, scores));

  const finalMatch = { id:"final_0", t1:sfLWinners[0]||TBD, t2:sfRWinners[0]||TBD, date:"Jul 19" };
  const champ = getWinner(finalMatch, scores);

  // 3rd place
  const sf0Loser = getLoser(sfL[0], scores) || TBD;
  const sf1Loser = getLoser(sfR[0], scores) || TBD;
  const thirdMatch = { id:"third_place", t1:sf0Loser, t2:sf1Loser, date:"Jul 18" };
  const thirdPlace = getWinner(thirdMatch, scores);

  const allMatchesLeft = { r32:R32.slice(0,8), r16:r16L, qf:qfL, sf:sfL };
  const allMatchesRight = { r32:R32.slice(8), r16:r16R, qf:qfR, sf:sfR };

  // Render all match cards
  function renderCard(match, col, roundIdx, matchIdx) {
    return (
      <MatchCard key={match.id} match={match} scores={scores}
        onScore={onBracketScore} isAdmin={isAdmin}
        x={colX(col)} y={matchY(roundIdx, matchIdx)} />
    );
  }

  const THIRD_Y = matchY(4, 0) + TOTAL_CARD_H + 40;
  const BRACKET_H = THIRD_Y + TOTAL_CARD_H + 20;

  return (
    <div>
      <div style={{fontSize:12, color:"#8892a4", marginBottom:12, lineHeight:1.5}}>
        Bracket oficial Ronda de 32 — FIFA World Cup 2026. Ingresa los marcadores para avanzar el torneo.
        {" "}<span style={{color:"#1a5c35", fontSize:11}}>— líneas verdes indican el ganador clasificado.</span>
      </div>

      {/* Champion + 3rd place */}
      {(champ || thirdPlace) && (
        <div style={{display:"flex", gap:12, marginBottom:14, flexWrap:"wrap"}}>
          {champ && (
            <div className="champ-box" style={{flex:1, minWidth:140}}>
              <div style={{fontSize:36}}>{champ.f}</div>
              <div style={{fontSize:15, fontWeight:500, marginTop:4}}>🏆 {champ.c}</div>
              <div style={{fontSize:11, color:"#8892a4", marginTop:2}}>Campeón Mundial 2026</div>
            </div>
          )}
          {thirdPlace && (
            <div className="champ-box" style={{flex:1, minWidth:140, background:"rgba(125,90,10,0.1)", borderColor:"rgba(125,90,10,0.35)"}}>
              <div style={{fontSize:36}}>{thirdPlace.f}</div>
              <div style={{fontSize:15, fontWeight:500, marginTop:4}}>🥉 {thirdPlace.c}</div>
              <div style={{fontSize:11, color:"#8892a4", marginTop:2}}>Tercer lugar</div>
            </div>
          )}
        </div>
      )}

      {/* Round labels */}
      <div style={{overflowX:"auto", paddingBottom:12}}>
        <div style={{position:"relative", width:TOTAL_WIDTH, minWidth:TOTAL_WIDTH}}>

          {/* Round title row */}
          {[
            [COL.r32L, "Ronda de 32"], [COL.r16L, "Ronda de 16"],
            [COL.qfL, "Cuartos"], [COL.sfL, "Semifinal"],
            [COL.final, "Final"], [COL.sfR, "Semifinal"],
            [COL.qfR, "Cuartos"], [COL.r16R, "Ronda de 16"], [COL.r32R, "Ronda de 32"]
          ].map(([col, label]) => (
            <div key={label+col} style={{
              position:"absolute", left:colX(col), top:0, width:CARD_W,
              textAlign:"center", fontSize:10, fontWeight:500, color:"#8892a4",
              textTransform:"uppercase", letterSpacing:"0.4px", paddingBottom:6,
              borderBottom:"0.5px solid #2d3f55"
            }}>{label}</div>
          ))}

          {/* SVG connector lines */}
          <svg style={{position:"absolute", top:20, left:0, pointerEvents:"none"}}
            width={TOTAL_WIDTH} height={BRACKET_H}>
            <ConnectorLines
              matchesLeft={allMatchesLeft}
              matchesRight={allMatchesRight}
              scores={scores}
              allMatches={{final:finalMatch}}
            />
          </svg>

          {/* Match cards — positioned absolutely */}
          <div style={{position:"relative", height:BRACKET_H + 20, marginTop:20}}>
            {/* Left R32 */}
            {R32.slice(0,8).map((m,i) => renderCard(m, COL.r32L, 0, i))}
            {/* Left R16 */}
            {r16L.map((m,i) => renderCard(m, COL.r16L, 1, i))}
            {/* Left QF */}
            {qfL.map((m,i) => renderCard(m, COL.qfL, 2, i))}
            {/* Left SF */}
            {sfL.map((m,i) => renderCard(m, COL.sfL, 3, i))}
            {/* Final */}
            {renderCard(finalMatch, COL.final, 4, 0)}
            {/* Right SF */}
            {sfR.map((m,i) => renderCard(m, COL.sfR, 3, i))}
            {/* Right QF */}
            {qfR.map((m,i) => renderCard(m, COL.qfR, 2, i))}
            {/* Right R16 */}
            {r16R.map((m,i) => renderCard(m, COL.r16R, 1, i))}
            {/* Right R32 */}
            {R32.slice(8).map((m,i) => renderCard(m, COL.r32R, 0, i))}
            {/* 3rd place — below final */}
            <div style={{position:"absolute", left:colX(COL.final) - 10, top:THIRD_Y - 14,
              width:CARD_W + 20, textAlign:"center"}}>
              <div style={{fontSize:10, color:"#7d5a0a", fontWeight:500, textTransform:"uppercase",
                letterSpacing:"0.4px", marginBottom:4}}>Tercer Lugar · Jul 18</div>
            </div>
            {renderCard(thirdMatch, COL.final, 0, 0) /* positioned manually below */}
            {(() => {
              const x = colX(COL.final);
              const y = THIRD_Y;
              return (
                <div key="third-card" style={{
                  position:"absolute", left:x, top:y + CARD_DATE_H,
                  width:CARD_W, background:"#273347",
                  border:"0.5px solid #7d5a0a", borderRadius:8, overflow:"hidden",
                  boxShadow:"0 2px 8px rgba(0,0,0,0.25)"
                }}>
                  <TeamRow team={thirdMatch.t1} score={scores["third_place"]?.h || ""} isWinner={getWinner(thirdMatch,scores)?.c === thirdMatch.t1?.c} canEdit={isAdmin && thirdMatch.t1.c !== "Por definir" && thirdMatch.t2.c !== "Por definir"} onInput={onBracketScore} scoreKey="third_place" side="t1" />
                  <TeamRow team={thirdMatch.t2} score={scores["third_place"]?.a || ""} isWinner={getWinner(thirdMatch,scores)?.c === thirdMatch.t2?.c} canEdit={isAdmin && thirdMatch.t1.c !== "Por definir" && thirdMatch.t2.c !== "Por definir"} onInput={onBracketScore} scoreKey="third_place" side="t2" />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}
