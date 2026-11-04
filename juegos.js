// Darkom's · Juegos de mesa para jugar en la mesa con un solo móvil (os lo pasáis por turnos):
// Parchís (2 a 4), Conecta 4 y Tres en raya. Todo funciona dentro del móvil: no se guarda ni se envía nada.
(() => {
const caja = document.getElementById("juegos");
if (!caja) return;
document.head.insertAdjacentHTML("beforeend", `<style>
  .menu-juegos { display: grid; gap: 12px; }
  .menu-juegos button { display: flex; align-items: center; gap: 14px; border: 1px solid var(--borde); background: #110c1c; color: var(--texto);
                        border-radius: 16px; padding: 16px; font: inherit; font-size: 30px; text-align: left; }
  .menu-juegos b { display: block; font-size: 18px; }
  .menu-juegos span { display: block; font-size: 13px; color: var(--suave); }
  .juego-cab { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
  .juego-cab b { font-size: 18px; }
  .volver { border: 1px solid var(--borde); background: #110c1c; color: var(--texto); border-radius: 10px; padding: 7px 10px; font: inherit; font-size: 13px; }
  .estado-juego { text-align: center; font-weight: 800; font-size: 17px; margin: 8px 0 12px; min-height: 24px; }
  .raya { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; max-width: 300px; margin: 0 auto; }
  .raya button { aspect-ratio: 1; border: 0; border-radius: 14px; background: #110c1c; font-size: 46px; }
  .raya button.gana { background: rgba(255,201,60,.35); }
  .conecta { display: grid; grid-template-columns: repeat(7, 1fr); gap: 5px; background: #1f3fbf; padding: 8px; border-radius: 14px; }
  .conecta div { aspect-ratio: 1; border-radius: 50%; background: #0f0b18; }
  .conecta div.r { background: #e53935; } .conecta div.a { background: #fdd835; }
  .conecta div.gana { box-shadow: 0 0 0 3px #fff inset; }
  .parchis-zona { position: relative; }
  .parchis-zona canvas { width: 100%; display: block; border-radius: 12px; touch-action: manipulation; }
  .dado { display: flex; align-items: center; justify-content: center; gap: 14px; margin-top: 12px; }
  .dado .cara { font-size: 54px; line-height: 1; min-width: 56px; text-align: center; }
</style>`);

let alPulsar = null;
const pinta = html => { caja.innerHTML = html; };
const cabecera = titulo => `<div class="juego-cab"><button class="volver" data-menu>← Juegos</button><b>${titulo}</b></div>`;
function menu() {
  alPulsar = null;
  pinta(`<p class="sub" style="margin:0 0 14px">Para jugar en la mesa con un solo móvil: os lo vais pasando por turnos 🎲</p>
    <div class="menu-juegos">
      <button data-juego="parchis">🎲<div><b>Parchís</b><span>De 2 a 4 jugadores</span></div></button>
      <button data-juego="conecta">🔴<div><b>Conecta 4</b><span>2 jugadores</span></div></button>
      <button data-juego="raya">❌<div><b>Tres en raya</b><span>2 jugadores</span></div></button>
    </div>`);
}
caja.addEventListener("click", e => {
  if (e.target.closest("[data-menu]")) return menu();
  const j = e.target.closest("[data-juego]")?.dataset.juego;
  if (j) return ({ parchis: elegirParchis, conecta: conecta4, raya: tresEnRaya })[j]();
  if (alPulsar) alPulsar(e);
});

// ---------------------------------------------------------------- Tres en raya
function tresEnRaya() {
  const LINEAS = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let t = Array(9).fill(""), turno = "X", fin = false, gana = [];
  const ficha = v => v === "X" ? "❌" : v === "O" ? "⭕" : "";
  const dibuja = msg => pinta(cabecera("Tres en raya") + `<p class="estado-juego">${msg}</p>
    <div class="raya">${t.map((v, i) => `<button data-c="${i}" class="${gana.includes(i) ? "gana" : ""}">${ficha(v)}</button>`).join("")}</div>
    <button class="enviar" data-otra>Otra partida</button>`);
  dibuja("Empieza ❌");
  alPulsar = e => {
    if (e.target.closest("[data-otra]")) return tresEnRaya();
    const c = e.target.closest("[data-c]")?.dataset.c; if (c === undefined || fin || t[c]) return;
    t[c] = turno;
    const linea = LINEAS.find(([a, b, d]) => t[a] && t[a] === t[b] && t[a] === t[d]);
    if (linea) { fin = true; gana = linea; return dibuja(`🎉 ¡Gana ${ficha(turno)}!`); }
    if (t.every(Boolean)) { fin = true; return dibuja("🤝 Empate"); }
    turno = turno === "X" ? "O" : "X"; dibuja(`Turno de ${ficha(turno)}`);
  };
}

// ---------------------------------------------------------------- Conecta 4 (7 columnas × 6 filas)
function conecta4() {
  const F = 6, C = 7;
  let t = Array.from({ length: F }, () => Array(C).fill("")), turno = "r", fin = false, gana = [];
  const nombre = j => j === "r" ? "🔴 Rojo" : "🟡 Amarillo";
  const dibuja = msg => pinta(cabecera("Conecta 4") + `<p class="estado-juego">${msg}</p>
    <div class="conecta">${t.flatMap((fila, f) => fila.map((v, c) => `<div data-col="${c}" class="${v} ${gana.some(([a, b]) => a === f && b === c) ? "gana" : ""}"></div>`)).join("")}</div>
    <p class="sub" style="margin:10px 0 0">Toca una columna para soltar tu ficha.</p>
    <button class="enviar" data-otra>Otra partida</button>`);
  const cuatro = (f, c) => {
    for (const [df, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) {
      const linea = [[f, c]];
      for (const s of [1, -1]) for (let k = 1; k < 4; k++) {
        const ff = f + df * k * s, cc = c + dc * k * s;
        if (ff < 0 || ff >= F || cc < 0 || cc >= C || t[ff][cc] !== t[f][c]) break;
        linea.push([ff, cc]);
      }
      if (linea.length >= 4) return linea;
    }
    return null;
  };
  dibuja(`Empieza ${nombre(turno)}`);
  alPulsar = e => {
    if (e.target.closest("[data-otra]")) return conecta4();
    const c = e.target.closest("[data-col]")?.dataset.col; if (c === undefined || fin) return;
    const col = +c; let f = F - 1; while (f >= 0 && t[f][col]) f--;
    if (f < 0) return;                                            // columna llena
    t[f][col] = turno;
    const linea = cuatro(f, col);
    if (linea) { fin = true; gana = linea; return dibuja(`🎉 ¡Gana ${nombre(turno)}!`); }
    if (t[0].every(Boolean)) { fin = true; return dibuja("🤝 Empate"); }
    turno = turno === "r" ? "a" : "r"; dibuja(`Turno de ${nombre(turno)}`);
  };
}

// ---------------------------------------------------------------- Parchís (reglas clásicas)
// Tablero de 19 × 19 casillas: 68 casillas de recorrido, un pasillo de 7 por color y la meta en el centro.
// Se sale con un 5; con un 6 se repite (y si no queda ninguna en casa, el 6 cuenta 7); con tres 6 seguidos la última ficha movida vuelve a casa.
// Comer = +20 para mover; llegar a la meta = +10. Dos fichas del mismo color hacen barrera (no se puede pasar). En los seguros no se come.
const COLORES = [
  { n: "Rojo", c: "#e53935", claro: "#ffcdd2" },
  { n: "Verde", c: "#43a047", claro: "#c8e6c9" },
  { n: "Amarillo", c: "#fbc02d", claro: "#fff9c4" },
  { n: "Azul", c: "#1e88e5", claro: "#bbdefb" }];
const CAMINO = (() => {                                       // casilla del recorrido (0..67) → [fila, columna]
  const p = [];
  for (let r = 7; r >= 0; r--) p.push([r, 8]); p.push([0, 9]); for (let r = 0; r <= 7; r++) p.push([r, 10]);
  for (let c = 11; c <= 18; c++) p.push([8, c]); p.push([9, 18]); for (let c = 18; c >= 11; c--) p.push([10, c]);
  for (let r = 11; r <= 18; r++) p.push([r, 10]); p.push([18, 9]); for (let r = 18; r >= 11; r--) p.push([r, 8]);
  for (let c = 7; c >= 0; c--) p.push([10, c]); p.push([9, 0]); for (let c = 0; c <= 7; c++) p.push([8, c]);
  return p;
})();
const ENTRADA = [8, 25, 42, 59];                             // casilla desde la que cada color entra en su pasillo
const SALIDA = ENTRADA.map(e => (e + 5) % 68);
const SEGUROS = new Set(ENTRADA.flatMap(e => [e, (e + 5) % 68, (e + 12) % 68]));
const PASILLO = [s => [s, 9], s => [9, 18 - s], s => [18 - s, 9], s => [9, s]];   // paso 1..7 del pasillo → [fila, columna]
const CASA = [[3.5, 14.5], [14.5, 14.5], [14.5, 3.5], [3.5, 3.5]];                // centro de la casa de cada color
const META = [[8.3, 9], [9, 9.7], [9.7, 9], [9, 8.3]];                            // dónde se ven las fichas que han llegado
const CARAS = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅", "⚅"];

function elegirParchis() {
  pinta(cabecera("Parchís") + `<p class="estado-juego">¿Cuántos jugadores?</p>
    <div class="pedidos">${[2, 3, 4].map(n => `<button data-np="${n}">${n} jugadores</button>`).join("")}</div>`);
  alPulsar = e => { const n = e.target.closest("[data-np]")?.dataset.np; if (n) parchis(+n); };
}

function parchis(numJugadores) {
  const jugadores = numJugadores === 2 ? [0, 2] : numJugadores === 3 ? [0, 1, 2] : [0, 1, 2, 3];
  const fichas = COLORES.map(() => Array.from({ length: 4 }, () => ({ e: "casa", p: 0 })));   // e: casa | juego | meta; p: 0..63 recorrido, 64..70 pasillo, 71 meta
  let turnoI = 0, dado = 0, mover = 0, seises = 0, bonus = 0, ultima = null, fin = false, msg = "", opciones = [];
  const yo = () => jugadores[turnoI];

  pinta(cabecera("Parchís") + `<p class="estado-juego" id="pEstado"></p>
    <div class="parchis-zona"><canvas id="pTablero"></canvas></div>
    <div class="dado"><span class="cara" id="pCara">🎲</span><button class="enviar" id="pTirar" style="width:auto;margin:0;padding:14px 26px">Tirar el dado</button></div>
    <button class="volver" data-otra style="margin-top:14px">↺ Empezar otra partida</button>`);
  const lienzo = caja.querySelector("#pTablero"), g = lienzo.getContext("2d");
  const lado = Math.min(caja.clientWidth || 340, 420), dpr = window.devicePixelRatio || 1;
  lienzo.width = lienzo.height = Math.round(lado * dpr); lienzo.style.height = lado + "px";
  const k = lienzo.width / 19;

  const casillaPista = (col, p) => (SALIDA[col] + p) % 68;
  const ocupantes = q => { const o = []; fichas.forEach((fs, col) => fs.forEach((f, i) => { if (f.e === "juego" && f.p <= 63 && casillaPista(col, f.p) === q) o.push({ col, i }); })); return o; };
  const barrera = q => { const o = ocupantes(q); return o.length >= 2 && o[0].col === o[1].col; };
  const enCasa = col => fichas[col].filter(f => f.e === "casa").length;

  // ¿puede moverse esta ficha n casillas? → { p2, come } o null
  function jugada(col, i, n) {
    const f = fichas[col][i];
    if (f.e !== "juego") return null;
    const p2 = f.p + n;
    if (p2 > 71) return null;                                   // a la meta se llega justo
    for (let p = f.p + 1; p <= Math.min(p2, 63); p++) {         // no se pasa ninguna barrera
      const q = casillaPista(col, p);
      if (barrera(q)) return null;
    }
    if (p2 <= 63) {
      const q = casillaPista(col, p2), o = ocupantes(q).filter(x => !(x.col === col && x.i === i));
      if (o.length >= 2) return null;
      const come = o.length === 1 && o[0].col !== col && !SEGUROS.has(q) ? o[0] : null;
      return { p2, come };
    }
    if (p2 < 71 && fichas[col].filter(x => x.e === "juego" && x.p === p2).length >= 2) return null;
    return { p2, come: null };
  }
  function puedeSalir(col) {
    if (!enCasa(col)) return null;
    const o = ocupantes(SALIDA[col]);
    if (o.length < 2) return { come: null };
    const rival = o.find(x => x.col !== col);                   // con la salida llena, se come al rival
    return rival ? { come: rival } : null;
  }
  const aCasa = ({ col, i }) => { fichas[col][i].e = "casa"; fichas[col][i].p = 0; };

  function calcularOpciones() {
    const col = yo(), n = bonus || mover;
    opciones = [];
    if (!n) return;
    if (!bonus && n === 5 && puedeSalir(col)) { opciones = fichas[col].map((f, i) => f.e === "casa" ? { i, salir: true } : null).filter(Boolean); return; }   // con un 5 hay que sacar
    fichas[col].forEach((f, i) => { const j = jugada(col, i, n); if (j) opciones.push({ i, ...j }); });
  }

  function siguienteTurno() {
    bonus = 0; mover = 0;
    if (dado >= 6 && !fin) { msg = `Ha salido ${dado === 7 ? "6 (cuenta 7)" : "6"}: ${COLORES[yo()].n} vuelve a tirar 🎲`; }
    else { seises = 0; turnoI = (turnoI + 1) % jugadores.length; msg = `Turno de ${COLORES[yo()].n}: tira el dado`; }
    dado = 0; opciones = []; dibuja();
  }

  function tirar() {
    if (fin || mover || bonus) return;
    let n = 1 + Math.floor(Math.random() * 6);
    caja.querySelector("#pCara").textContent = CARAS[n];
    const col = yo();
    if (n === 6) {
      seises++;
      if (seises === 3) {                                      // tres 6 seguidos: la última ficha movida vuelve a casa
        seises = 0; dado = 0;
        if (ultima && ultima.col === col && fichas[col][ultima.i].e === "juego" && fichas[col][ultima.i].p <= 63) { aCasa(ultima); msg = `😱 ¡Tres 6 seguidos! Esa ficha de ${COLORES[col].n} vuelve a casa.`; }
        else msg = `¡Tres 6 seguidos! ${COLORES[col].n} pierde el turno.`;
        turnoI = (turnoI + 1) % jugadores.length; opciones = []; dibuja();
        setTimeout(() => { if (!mover && !bonus && !fin) { msg = `Turno de ${COLORES[yo()].n}: tira el dado`; dibuja(); } }, 1600);
        return;
      }
      if (!enCasa(col)) n = 7;
    }
    dado = n; mover = n; calcularOpciones();
    if (!opciones.length) {
      msg = `${COLORES[col].n} saca ${n === 7 ? "6 (cuenta 7)" : n} y no puede mover.`; mover = 0; dibuja();
      setTimeout(siguienteTurno, 1400); return;
    }
    if (opciones.every(o => o.salir)) return hacer(opciones[0]);   // sacar ficha de casa: da igual cuál, se hace sola
    msg = `${COLORES[col].n} saca ${n === 7 ? "6 (cuenta 7)" : n}: toca la ficha que quieres mover`; dibuja();
  }

  function hacer(op) {
    const col = yo(), f = fichas[col][op.i];
    let extra = 0;
    if (op.salir) {
      const s = puedeSalir(col); f.e = "juego"; f.p = 0;
      if (s?.come) { aCasa(s.come); extra = 20; }
    } else {
      f.p = op.p2;
      if (op.come) { aCasa(op.come); extra = 20; }
      if (f.p === 71) { f.e = "meta"; extra = Math.max(extra, 10); }
    }
    ultima = { col, i: op.i };
    if (fichas[col].every(x => x.e === "meta")) { fin = true; msg = `🏆 ¡${COLORES[col].n} gana la partida!`; opciones = []; mover = bonus = 0; return dibuja(); }
    const usadoBonus = bonus > 0;
    mover = 0; bonus = 0;
    if (extra) {
      bonus = extra; calcularOpciones();
      if (opciones.length) { msg = `${extra === 20 ? "🍽️ ¡Te has comido una ficha!" : "🏁 ¡Ficha en la meta!"} Cuentas ${extra}: elige ficha`; return dibuja(); }
      bonus = 0;
    }
    if (usadoBonus || !extra || !opciones.length) siguienteTurno();
  }

  // ---- dibujo
  const centro = ([f, c]) => [(c + 0.5) * k, (f + 0.5) * k];
  function cuadro(f, c, color, borde = "#c9bfa3") { g.fillStyle = color; g.fillRect(c * k, f * k, k, k); g.strokeStyle = borde; g.lineWidth = Math.max(1, k * 0.04); g.strokeRect(c * k, f * k, k, k); }
  function posicionDe(col, i) {
    const f = fichas[col][i];
    if (f.e === "casa") { const [cf, cc] = CASA[col], d = 1.25; return [(cc + 0.5 + (i % 2 ? d : -d)) * k, (cf + 0.5 + (i < 2 ? -d : d)) * k]; }
    if (f.e === "meta") { const [mf, mc] = META[col]; return [(mc + 0.5 + (i - 1.5) * 0.28) * k, (mf + 0.5) * k]; }
    if (f.p <= 63) return centro(CAMINO[casillaPista(col, f.p)]);
    return centro(PASILLO[col](f.p - 63));
  }
  function dibuja() {
    g.fillStyle = "#f4ecd8"; g.fillRect(0, 0, lienzo.width, lienzo.height);
    COLORES.forEach((C, col) => {                                // casas
      const [cf, cc] = CASA[col]; const f0 = cf < 9 ? 0 : 11, c0 = cc < 9 ? 0 : 11;
      g.fillStyle = C.c; g.fillRect(c0 * k, f0 * k, 8 * k, 8 * k);
      g.fillStyle = "#fffaf0"; g.beginPath(); g.arc((cc + 0.5) * k, (cf + 0.5) * k, 2.9 * k, 0, 7); g.fill();
    });
    CAMINO.forEach(([f, c], q) => {                              // recorrido
      const sal = SALIDA.indexOf(q);
      cuadro(f, c, sal >= 0 ? COLORES[sal].claro : "#fffdf7");
      if (SEGUROS.has(q)) { g.fillStyle = "rgba(0,0,0,.18)"; g.beginPath(); g.arc((c + 0.5) * k, (f + 0.5) * k, k * 0.16, 0, 7); g.fill(); }
    });
    COLORES.forEach((C, col) => { for (let s = 1; s <= 7; s++) { const [f, c] = PASILLO[col](s); cuadro(f, c, C.claro); } });
    const m = [8 * k, 8 * k, 3 * k];                             // meta: 4 triángulos
    [[0, [m[0], m[1]], [m[0] + m[2], m[1]]], [1, [m[0] + m[2], m[1]], [m[0] + m[2], m[1] + m[2]]], [2, [m[0] + m[2], m[1] + m[2]], [m[0], m[1] + m[2]]], [3, [m[0], m[1] + m[2]], [m[0], m[1]]]]
      .forEach(([col, a, b]) => { g.fillStyle = COLORES[col].c; g.beginPath(); g.moveTo(...a); g.lineTo(...b); g.lineTo(m[0] + m[2] / 2, m[1] + m[2] / 2); g.closePath(); g.fill(); });
    // fichas (las que comparten casilla, un poco separadas)
    const vistas = {};
    jugadores.forEach(col => fichas[col].forEach((f, i) => {
      let [x, y] = posicionDe(col, i);
      if (f.e === "juego") { const clave = Math.round(x) + "," + Math.round(y); const n = vistas[clave] = (vistas[clave] || 0) + 1; if (n === 2) { x += k * 0.22; y += k * 0.22; } }
      const sel = opciones.some(o => o.i === i) && col === yo();
      g.fillStyle = COLORES[col].c; g.strokeStyle = "#222"; g.lineWidth = k * 0.08;
      g.beginPath(); g.arc(x, y, k * (f.e === "meta" ? 0.22 : 0.36), 0, 7); g.fill(); g.stroke();
      if (sel) { g.strokeStyle = "#111"; g.lineWidth = k * 0.12; g.setLineDash([k * 0.15, k * 0.1]); g.beginPath(); g.arc(x, y, k * 0.55, 0, 7); g.stroke(); g.setLineDash([]); }
      fichas[col][i].xy = [x, y];
    }));
    const e = caja.querySelector("#pEstado"); e.textContent = msg; e.style.color = COLORES[yo()].c;
    caja.querySelector("#pTirar").disabled = !!(fin || mover || bonus);
  }

  lienzo.addEventListener("click", ev => {
    if (fin || !opciones.length) return;
    const r = lienzo.getBoundingClientRect(), x = (ev.clientX - r.left) * lienzo.width / r.width, y = (ev.clientY - r.top) * lienzo.height / r.height;
    let mejor = null, dist = k * 0.9;
    for (const op of opciones) { const [fx, fy] = fichas[yo()][op.i].xy || [0, 0]; const d = Math.hypot(fx - x, fy - y); if (d < dist) { dist = d; mejor = op; } }
    if (mejor) hacer(mejor);
  });
  alPulsar = e => {
    if (e.target.closest("#pTirar")) tirar();
    if (e.target.closest("[data-otra]") && confirm("¿Empezar otra partida?")) elegirParchis();
  };
  msg = `Empieza ${COLORES[yo()].n}: tira el dado`; dibuja();
  window.__parchis = { fichas, estado: () => ({ turno: COLORES[yo()].n, dado, mover, bonus, opciones: opciones.length, msg, fin }), tirar, hacer: i => { const op = opciones.find(o => o.i === i); if (op) hacer(op); } };   // para probar
}

menu();
})();
