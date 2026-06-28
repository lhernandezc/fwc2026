import { GROUPS, MATCHES, FIFA_RANK, allStandings } from "../data";

function groupGoals(gk, scores) {
  let total = 0;
  (MATCHES[gk] || []).forEach((_, i) => {
    const sc = scores[gk + "_" + i];
    if (sc && sc.h !== "" && sc.a !== "") total += parseInt(sc.h || 0) + parseInt(sc.a || 0);
  });
  return total;
}

function groupMatchesPlayed(gk, scores) {
  let n = 0;
  (MATCHES[gk] || []).forEach((_, i) => {
    const sc = scores[gk + "_" + i];
    if (sc && sc.h !== "" && sc.a !== "") n++;
  });
  return n;
}

function heatLevel(goals, played) {
  if (played === 0) return 0;
  const avg = goals / played;
  if (avg < 1) return 1;
  if (avg < 2) return 2;
  if (avg < 3) return 3;
  if (avg < 4) return 4;
  return 5;
}

const heatLabels = ["Sin jugar","Poco emocionante","Defensivo","Entretenido","Muy goleador","Espectacular"];

function rankDelta(teamName, currentPos) {
  const gk = Object.keys(GROUPS).find(g => GROUPS[g].t.some(t => t.c === teamName));
  if (!gk) return 0;
  const sorted = [...GROUPS[gk].t].sort((a, b) => (FIFA_RANK[a.c] || 99) - (FIFA_RANK[b.c] || 99));
  return sorted.findIndex(t => t.c === teamName) - currentPos;
}

const DEBUTANTS = new Set(["Curacao","Cape Verde","Jordan","Uzbekistan"]);

const PHRASES = {
  goleada_fav: [
    (n1,n2,h,a) => `${n1} ${h}-${a} a ${n2}. Eso no fue un partido, fue una conferencia de prensa con balón. ${n2} asistió de espectador.`,
    (n1,n2,h,a) => `${h}-${a}. ${n1} le dio una clase magistral a ${n2} con estudiantes que reprobaron cada examen.`,
    (n1,n2,h,a) => `${n1} aplastó ${h}-${a} a ${n2}. Los mandaron de regreso a casa en taxi, sin escalas y sin dignidad.`,
  ],
  goleada_sorpresa: [
    (n1,n2,h,a) => `${n1} ${h}-${a} a ${n2}. Alguien llame al médico porque los analistas están en shock y el ranking de FIFA en el suelo.`,
    (n1,n2,h,a) => `${h}-${a}. ${n1} llegó de visita y se robó TODO. ${n2} que explique esto en la conferencia de prensa.`,
    (n1,n2,h,a) => `Con ${h}-${a}, ${n1} le demostró a ${n2} que el papel aguanta todo menos una derrota de esta magnitud.`,
  ],
  empate_aburrido: [
    (n1,n2,h,a) => `${n1} y ${n2} terminaron ${h}-${h}. Noventa minutos de mi vida que no vuelven. Gracias a nadie.`,
    (n1,n2,h,a) => `${h}-${h} entre ${n1} y ${n2}. El balón viajó mucho pero no llegó a ningún lado interesante.`,
    (n1,n2,h,a) => `${n1} ${h}-${h} ${n2}. Se pusieron de acuerdo para no hacer absolutamente nada de provecho.`,
  ],
  empate_epico: [
    (n1,n2,h,a) => `${n1} ${h}-${a} ${n2}. Eso no fue un empate, fue un infarto repartido en dos mitades.`,
    (n1,n2,h,a) => `${h}-${h} con ${h+a} goles entre ${n1} y ${n2}. El portero de ambos lados debería cobrar doble hoy.`,
  ],
  empate_sorpresa: [
    (nFav,nUnd,h,a) => `${nUnd} le empató ${h}-${h} a ${nFav}. El favorito se fue al vestuario a buscar excusas y no encontró ninguna válida.`,
    (nFav,nUnd,h,a) => `${h}-${h}. ${nUnd} salió con un punto ante ${nFav} que valía oro. El ranking de FIFA tiene lógica hasta que no la tiene.`,
  ],
  victoria_ajustada_fav: [
    (n1,n2,h,a) => `${n1} ganó ${h}-${a} ante ${n2} con el corazón en la boca. Los tres puntos no preguntan cómo llegaron.`,
    (n1,n2,h,a) => `${h}-${a}. ${n1} ganó pero ${n2} les hizo sudar cada gota. No estaba tan claro como el papel decía.`,
  ],
  victoria_sorpresa: [
    (nUnd,nFav,h,a) => `${nUnd} ${h}-${a} a ${nFav}. Se cayó el gigante. ${nFav} salió con las manos vacías y sin explicación decente.`,
    (nUnd,nFav,h,a) => `${h}-${a}. ${nUnd} venció a ${nFav} y el mundo del fútbol busca cómo procesar esto. El ranking llora.`,
  ],
  goleada_historica: [
    (n1,n2,h,a) => `${n1} ${h}-${a} a ${n2}. Con ${h+a} goles en un solo partido, el Mundial 2026 tiene su primera fiesta histórica de goles.`,
  ],
  messi_hattrick: [
    (n1,n2,h,a) => `Argentina ${h}-${a} a ${n2} con hat-trick de Messi. Los argentinos ya están imprimiendo el boleto a la final. El resto miramos.`,
  ],
  debut: [
    (nDeb,nRiv,h,a,gano) => gano
      ? `${nDeb} ganó ${h}-${a} en su debut histórico ante ${nRiv}. Primera vez en un Mundial y ya con tres puntos.`
      : `${nDeb} debuta en el Mundial con ${h}-${a} ante ${nRiv}. La historia ya está escrita aunque el resultado duela.`,
  ],
  mexico_gana:   [(n2,h,a) => `México ${h}-${a} a ${n2}. Arriba el TRI, carnal. En casa y con contundencia, que era lo que pedía la afición.`, (n2,h,a) => `El TRI ${h}-${a} a ${n2}. Puro México. Que sigan así y la fiesta llega lejos.`],
  mexico_pierde: [(n2,h,a) => `México ${h}-${a} ante ${n2}. Se los comieron vivos al TRI. Y encima en casa, que es lo que más duele.`],
  mexico_empata: [(n2,h,a) => `México ${h}-${h} con ${n2}. Ni modo, un puntito pa' la bolsa. La afición esperaba más del local.`],
  argentina_gana:   [(n2,h,a) => `Argentina ${h}-${a} a ${n2}. Vamos campeones. El equipo de Scaloni sigue demostrando por qué tiene la estrella más nueva.`],
  argentina_pierde: [(n2,h,a) => `Argentina ${h}-${a} ante ${n2}. Que papelón che. Los campeones del mundo cayeron y la prensa argentina ya entró en crisis.`],
  argentina_empata: [(n2,h,a) => `Argentina ${h}-${h} con ${n2}. Un empate medio pelo che. El campeón esperaba más de este partido.`],
  colombia_gana:   [(n2,h,a) => `Colombia ${h}-${a} a ${n2}. Que chimba de partido, parce. Los cafeteros siguen con todo.`],
  colombia_pierde: [(n2,h,a) => `Colombia ${h}-${a} ante ${n2}. Se quedaron con las ganas, parce.`],
  brasil_gana:   [(n2,h,a) => `Brasil ${h}-${a} a ${n2}. Samba, ginga y goles. El Canarinho voló y ${n2} no supo cómo pararlo.`],
  brasil_pierde: [(n2,h,a) => `Brasil ${h}-${a} ante ${n2}. El jogo bonito se quedó en el vestuario.`],
  uruguay_gana:  [(n2,h,a) => `Uruguay ${h}-${a} a ${n2}. Garra charrúa pura, viejo. Así juega Uruguay, a morir en la cancha.`],
  default: [
    (n1,n2,h,a) => `${n1} ${h}-${a} ${n2}. Los puntos están repartidos y el grupo sigue su curso.`,
    (n1,n2,h,a) => `Resultado: ${n1} ${h} - ${a} ${n2}. El torneo avanza.`,
  ]
};

function pick(arr, ...args) {
  const fn = arr[Math.floor(Math.random() * arr.length)];
  return fn(...args);
}

function generateHeadline(lastKey, scores, totalPlayed) {
  // Group stage complete
  if (totalPlayed >= 72) {
    return "La fase de grupos terminó. 32 equipos avanzan a la Ronda de 32. A partir de aqui, el que pierde se va a casa sin escalas.";
  }
  if (!lastKey) return null;

  const [gk, idxStr] = lastKey.split("_");
  const idx = parseInt(idxStr);
  const m = MATCHES[gk]?.[idx];
  if (!m) return null;
  const sc = scores[lastKey];
  const h = parseInt(sc.h), a = parseInt(sc.a);
  const n1 = m[0], n2 = m[1];
  const r1 = FIFA_RANK[n1] || 99, r2 = FIFA_RANK[n2] || 99;
  const total = h + a;
  const rankGap = Math.abs(r1 - r2);
  const isFavWin = h > a ? r1 < r2 : r2 < r1;
  const isUpset = h !== a && !isFavWin && rankGap >= 25 && Math.min(r1,r2) <= 25;
  const isGoleada = Math.abs(h - a) >= 3;
  const isHistoric = total >= 5;
  const winnerName = h > a ? n1 : a > h ? n2 : null;
  const loserName  = h > a ? n2 : a > h ? n1 : null;
  const favName    = r1 < r2 ? n1 : n2;
  const undName    = r1 < r2 ? n2 : n1;

  if (n1 === "Argentina" && h >= 3 && h > a) return pick(PHRASES.messi_hattrick, n1, n2, h, a);

  const debutant = DEBUTANTS.has(n1) ? n1 : DEBUTANTS.has(n2) ? n2 : null;
  if (debutant) {
    const rival = debutant === n1 ? n2 : n1;
    const debGano = (debutant === n1 && h > a) || (debutant === n2 && a > h);
    return pick(PHRASES.debut, debutant, rival, h, a, debGano);
  }

  if (n1 === "Mexico" || n2 === "Mexico") {
    const isMexHome = n1 === "Mexico";
    if (h > a && isMexHome)  return pick(PHRASES.mexico_gana, n2, h, a);
    if (a > h && isMexHome)  return pick(PHRASES.mexico_pierde, n2, h, a);
    if (h > a && !isMexHome) return pick(PHRASES.mexico_pierde, n1, a, h);
    if (a > h && !isMexHome) return pick(PHRASES.mexico_gana, n1, a, h);
    return pick(PHRASES.mexico_empata, isMexHome ? n2 : n1, h, a);
  }
  if (n1 === "Argentina" || n2 === "Argentina") {
    const isHome = n1 === "Argentina";
    if (h > a && isHome)  return pick(PHRASES.argentina_gana, n2, h, a);
    if (a > h && isHome)  return pick(PHRASES.argentina_pierde, n2, h, a);
    if (h > a && !isHome) return pick(PHRASES.argentina_pierde, n1, a, h);
    if (a > h && !isHome) return pick(PHRASES.argentina_gana, n1, a, h);
    return pick(PHRASES.argentina_empata, isHome ? n2 : n1, h, a);
  }
  if (n1 === "Colombia" || n2 === "Colombia") {
    const isHome = n1 === "Colombia";
    if ((h > a && isHome)||(a > h && !isHome)) return pick(PHRASES.colombia_gana, isHome?n2:n1, isHome?h:a, isHome?a:h);
    return pick(PHRASES.colombia_pierde, isHome?n2:n1, isHome?h:a, isHome?a:h);
  }
  if (n1 === "Brazil" || n2 === "Brazil") {
    const isHome = n1 === "Brazil";
    if ((h > a && isHome)||(a > h && !isHome)) return pick(PHRASES.brasil_gana, isHome?n2:n1, isHome?h:a, isHome?a:h);
    return pick(PHRASES.brasil_pierde, isHome?n2:n1, isHome?h:a, isHome?a:h);
  }
  if (n1 === "Uruguay" || n2 === "Uruguay") {
    const isHome = n1 === "Uruguay";
    if ((h > a && isHome)||(a > h && !isHome)) return pick(PHRASES.uruguay_gana, isHome?n2:n1, isHome?h:a, isHome?a:h);
  }

  if (h === a) {
    if (total === 0 || total === 1) return pick(PHRASES.empate_aburrido, n1, n2, h, a);
    if (total >= 4) return pick(PHRASES.empate_epico, n1, n2, h, a);
    if (rankGap >= 25) return pick(PHRASES.empate_sorpresa, favName, undName, h, a);
    return pick(PHRASES.empate_aburrido, n1, n2, h, a);
  }

  if (isHistoric) return pick(PHRASES.goleada_historica, winnerName, loserName, Math.max(h,a), Math.min(h,a));
  if (isGoleada && isUpset) return pick(PHRASES.goleada_sorpresa, winnerName, loserName, Math.max(h,a), Math.min(h,a));
  if (isGoleada && isFavWin) return pick(PHRASES.goleada_fav, winnerName, loserName, Math.max(h,a), Math.min(h,a));
  if (isUpset) return pick(PHRASES.victoria_sorpresa, winnerName, loserName, Math.max(h,a), Math.min(h,a));
  if (isFavWin) return pick(PHRASES.victoria_ajustada_fav, winnerName, loserName, Math.max(h,a), Math.min(h,a));

  return pick(PHRASES.default, n1, n2, h, a);
}

function getLastEnteredMatch(scores) {
  let latestKey = null, latestT = -1;
  Object.keys(scores).forEach(k => {
    if (!/^[A-L]_\d+$/.test(k)) return;
    const sc = scores[k];
    if (!sc || sc.h === "" || sc.a === "") return;
    const t = sc.t || 0;
    if (t > latestT) { latestT = t; latestKey = k; }
  });
  if (!latestKey) {
    const filled = Object.keys(scores).filter(k => /^[A-L]_\d+$/.test(k) && scores[k]?.h !== "" && scores[k]?.a !== "");
    latestKey = filled[filled.length - 1] || null;
  }
  return latestKey;
}

export default function Dashboard({ scores }) {
  const all = allStandings(scores);
  let totalPlayed = 0, totalGoals = 0;
  Object.keys(GROUPS).forEach(g => {
    (MATCHES[g] || []).forEach((_, i) => {
      const sc = scores[g + "_" + i];
      if (sc && sc.h !== "" && sc.a !== "") { totalPlayed++; totalGoals += parseInt(sc.h || 0) + parseInt(sc.a || 0); }
    });
  });
  const total = 72, pct = Math.round(totalPlayed / total * 100);
  const avg = totalPlayed > 0 ? Math.round(totalGoals / totalPlayed * 10) / 10 : 0;
  const lastKey = getLastEnteredMatch(scores);

  let headlineText;
  if (totalPlayed === 0) {
    headlineText = "El torneo acaba de comenzar. Ingresa los marcadores para ver el drama en tiempo real.";
  } else {
    headlineText = generateHeadline(lastKey, scores, totalPlayed)
      || "El torneo está en marcha. Sigue ingresando resultados.";
  }

  return (
    <div>
      <div className="top-stats">
        <div className="stat-card"><div className="num">{totalPlayed}</div><div className="lbl">Partidos jugados</div></div>
        <div className="stat-card"><div className="num">{total - totalPlayed}</div><div className="lbl">Pendientes</div></div>
        <div className="stat-card"><div className="num">{totalGoals}</div><div className="lbl">Goles</div></div>
        <div className="stat-card"><div className="num">{avg}</div><div className="lbl">Goles/partido</div></div>
      </div>

      <div className="progress-bar-wrap">
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#8892a4", marginBottom: 5 }}>
          <span>Progreso fase de grupos</span><span>{pct}% · {totalPlayed}/{total}</span>
        </div>
        <div className="progress-bar-track">
          <div className="progress-bar-fill" style={{ width: pct + "%" }} />
        </div>
      </div>

      <div className="headline-card">
        <span className="headline-tag">{totalPlayed >= 72 ? "FASE FINAL" : "NOVEDAD"}</span>
        <p className="headline-text">{headlineText}</p>
      </div>

      <div className="section-label">Drama por grupo · Expectativa FIFA vs. Realidad</div>
      <div className="section-hint">
        <span>Arriba = sobre lo esperado</span>
        <span>Abajo = bajo lo esperado</span>
        <span>Color = intensidad de goles</span>
      </div>

      <div className="drama-grid">
        {Object.keys(GROUPS).map(gk => {
          const s = all[gk];
          const goals = groupGoals(gk, scores);
          const played = groupMatchesPlayed(gk, scores);
          const heat = heatLevel(goals, played);
          const pipCount = Math.min(goals, 12);
          return (
            <div key={gk} className={`drama-card heat-${heat}`}>
              <div className="drama-card-header">
                <span className="gname">Grupo {gk}</span>
                <span className="ggoals">{played > 0 ? `${goals} gol${goals !== 1 ? "es" : ""} · ${heatLabels[heat]}` : "Sin jugar"}</span>
              </div>
              <div className="drama-card-body">
                {s.map((t, pos) => {
                  const hasPlayed = t.pj > 0;
                  const delta = hasPlayed ? rankDelta(t.c, pos) : 0;
                  const rank = FIFA_RANK[t.c] || "—";
                  let arrow = "→", arrowClass = "arrow-flat";
                  if (hasPlayed && delta > 0) { arrow = "↑"; arrowClass = "arrow-up"; }
                  else if (hasPlayed && delta < 0) { arrow = "↓"; arrowClass = "arrow-down"; }
                  const isSurprise = hasPlayed && delta > 1 && (FIFA_RANK[t.c] || 0) > 40;
                  const isSuffering = hasPlayed && pos >= 2 && (FIFA_RANK[t.c] || 99) <= 15;
                  return (
                    <div key={t.c} className="drama-team-row">
                      <span className="dflag">{t.f}</span>
                      <span className="dname">{t.c}</span>
                      {isSurprise && <span className="surprise-badge">SORPRESA</span>}
                      {isSuffering && <span className="suffering-badge">SUFRIENDO</span>}
                      <span className="drank">#{rank}</span>
                      <span className={`darrow ${arrowClass}`}>{hasPlayed ? arrow : "·"}</span>
                      <span className="dpts">{hasPlayed ? t.pts + "pts" : ""}</span>
                    </div>
                  );
                })}
                {played > 0 && (
                  <>
                    <div className="drama-separator" />
                    <div className="goals-pip-row">
                      {Array.from({ length: pipCount }).map((_, i) => <div key={i} className="goals-pip" />)}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
