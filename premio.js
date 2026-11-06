// Darkom's · Ofertas del día, ruleta con premio (solo con el QR de un solo uso de la tablet), cupones del cliente, historia de Instagram y sorteo del local.
(() => {
const INSTAGRAM = "@darkomsshishabar";
const parametros = new URLSearchParams(location.search), ticket = parametros.get("premio");
document.head.insertAdjacentHTML("beforeend", `<style>
  #ofertasTop { display: none; background: linear-gradient(135deg, #ffc93c, #ff9d2e); color: #1a1024; border-radius: 18px; padding: 14px 16px; margin: 0 0 16px; box-shadow: 0 8px 24px rgba(255,157,46,.25); }
  #ofertasTop h2 { margin: 0 0 6px; font-size: 15px; letter-spacing: .3px; }
  #ofertasTop div { font-weight: 800; font-size: 17px; line-height: 1.3; padding: 5px 0; }
  #ofertasTop div + div { border-top: 1px solid rgba(26,16,36,.2); }
  #misCupones { display: none; margin: 0 0 16px; }
  #misCupones button { width: 100%; display: flex; justify-content: space-between; gap: 10px; border: 1px dashed var(--oro); background: rgba(255,201,60,.08); color: var(--texto); border-radius: 14px; padding: 12px 14px; font: inherit; font-weight: 700; margin-bottom: 8px; text-align: left; }
  #misCupones b { color: var(--oro); letter-spacing: 1px; }
  .premio-capa { position: fixed; inset: 0; z-index: 20; background: radial-gradient(circle at 50% 20%, #49247e 0, #0a0712 70%); overflow-y: auto; padding: 22px 18px 40px; text-align: center; display: none; }
  .premio-capa.abierta { display: block; }
  .premio-capa h2 { font-size: 25px; margin: 6px 0 4px; color: var(--oro); }
  .premio-capa canvas.rueda { width: min(86vw, 380px); height: min(86vw, 380px); display: block; margin: 14px auto; }
  .cupon { background: #fff; color: #1a1024; border-radius: 18px; padding: 18px; margin: 14px auto; max-width: 400px; }
  .cupon .nombre { font-size: 23px; font-weight: 900; line-height: 1.2; }
  .cupon .cod { font: 900 46px/1.1 ui-monospace, Menlo, monospace; letter-spacing: 7px; margin: 10px 0 4px; color: #6a2fc2; }
  .cupon small { color: #5c5270; display: block; }
  .premio-capa img.historia { width: min(62vw, 240px); border-radius: 14px; display: block; margin: 14px auto; box-shadow: 0 10px 30px rgba(0,0,0,.6); }
  .premio-capa .enviar { max-width: 400px; display: block; margin: 10px auto 0; }
  .premio-capa .otro { background: transparent; color: var(--texto); border: 1px solid var(--borde); font-size: 15px; }
  .premio-capa .nota { color: var(--suave); font-size: 13px; max-width: 400px; margin: 10px auto 0; }
</style>`);
const $$ = id => document.getElementById(id), escapa = t => String(t ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const fecha = d => new Date(d).toLocaleDateString("es-ES", { day: "numeric", month: "long" });

// ---- Ofertas del día: lo primero que se ve
rpc("evento", { p_tipo: "escaneo", p_dato: null, p_disp: disp }).catch(() => {});
rpc("ofertas_activas", {}).then(l => {
  if (!Array.isArray(l) || !l.length) return;
  const c = $$("ofertasTop"); c.innerHTML = "<h2>🔥 OFERTAS DE HOY</h2>" + l.map(o => `<div>${escapa(o.texto)}</div>`).join(""); c.style.display = "block";
  l.forEach(o => rpc("evento", { p_tipo: "oferta", p_dato: o.id, p_disp: disp }).catch(() => {}));
}).catch(() => {});

// ---- Mis cupones: se guardan en el móvil para enseñarlos en la barra (también en la próxima visita)
const leeCupones = () => { try { return JSON.parse(lee("darkoms_cupones")) || []; } catch { return []; } };
function pintaCupones() {
  const vivos = leeCupones().filter(c => new Date(c.caduca) > new Date()), caja = $$("misCupones");
  guarda("darkoms_cupones", JSON.stringify(vivos));
  caja.style.display = vivos.length ? "block" : "none";
  caja.innerHTML = vivos.map((c, i) => `<button data-cupon="${i}"><span>🎟️ ${escapa(c.premio)}</span><b>${escapa(c.codigo)}</b></button>`).join("");
  caja.querySelectorAll("[data-cupon]").forEach(b => b.onclick = () => verCupon(vivos[+b.dataset.cupon]));
}

// ---- Capa de la ruleta
const capa = document.createElement("div"); capa.className = "premio-capa"; document.body.appendChild(capa);
const cerrar = c => { if (ticket && c) location.replace(location.pathname + "?c=" + encodeURIComponent(c)); else capa.classList.remove("abierta"); };

const COLORES = ["#ffc93c", "#2a1d47", "#e8a92c", "#3d2a66", "#7b5cff", "#1f1633"];
function pintaRueda(lz, casillas, giro) {
  const L = lz.canvas.width, R = L / 2 - 16, s = Math.PI * 2 / casillas.length;
  lz.clearRect(0, 0, L, L); lz.save(); lz.translate(L / 2, L / 2);
  casillas.forEach((nombre, i) => {
    const a0 = giro + i * s - Math.PI / 2, color = COLORES[i % COLORES.length === 0 && i === casillas.length - 1 ? 4 : i % COLORES.length];
    lz.beginPath(); lz.moveTo(0, 0); lz.arc(0, 0, R, a0, a0 + s); lz.closePath(); lz.fillStyle = color; lz.fill(); lz.strokeStyle = "rgba(0,0,0,.45)"; lz.lineWidth = 3; lz.stroke();
    lz.save(); lz.rotate(a0 + s / 2); lz.textAlign = "right"; lz.textBaseline = "middle"; lz.fillStyle = /ffc93c|e8a92c/.test(color) ? "#1a1024" : "#fff";
    const max = R * 0.72; let t = R * 0.095; lz.font = `900 ${t}px -apple-system, Arial, sans-serif`;
    const an = lz.measureText(nombre).width; if (an > max) { t *= max / an; lz.font = `900 ${t}px -apple-system, Arial, sans-serif`; }
    lz.fillText(nombre, R * 0.92, 0); lz.restore();
  });
  lz.beginPath(); lz.arc(0, 0, R, 0, 7); lz.strokeStyle = "#ffc93c"; lz.lineWidth = 9; lz.stroke();
  lz.beginPath(); lz.arc(0, 0, R * 0.12, 0, 7); lz.fillStyle = "#0c0914"; lz.fill(); lz.stroke();
  lz.beginPath(); lz.moveTo(-R * 0.08, -R - 12); lz.lineTo(R * 0.08, -R - 12); lz.lineTo(0, -R + R * 0.1); lz.closePath(); lz.fillStyle = "#fff"; lz.fill();
  lz.restore();
}
async function ruleta() {
  capa.classList.add("abierta");
  capa.innerHTML = `<h2>🎁 ¡Tienes un premio!</h2><p class="sub" style="margin:0">Todas las casillas tienen premio.</p>
    <canvas class="rueda" width="760" height="760"></canvas><button class="enviar" id="girar">🎡 Girar la ruleta</button>
    <p class="nota">La ruleta se gira una vez. No todos los premios tienen la misma probabilidad de salir.</p>`;
  const lz = capa.querySelector("canvas").getContext("2d");
  pintaRueda(lz, ["🎁", "🎁", "🎁", "🎁", "🎁", "🎁"], 0);
  $$("girar").onclick = async () => {
    const b = $$("girar"); b.disabled = true; b.textContent = "Girando…";
    let r; try { r = await rpc("premio_girar", { p_codigo: ticket, p_disp: disp }); } catch { b.disabled = false; b.textContent = "🎡 Girar la ruleta"; return aviso("Sin conexión. Prueba otra vez."); }
    if (r.error) return fallo(r.error);
    const cupon = { premio: r.premio, codigo: r.codigo, caduca: r.caduca, desde: r.desde, proxima: r.proxima, c: r.c };
    guarda("darkoms_cupones", JSON.stringify([cupon, ...leeCupones().filter(c => c.codigo !== r.codigo)]));
    if (r.repetido) return verCupon(cupon);
    const s = Math.PI * 2 / r.casillas.length, fin = Math.PI * 2 * 7 - (r.indice + 0.5) * s, t0 = performance.now(), DURA = 5500;
    (function anima(ahora) {
      const p = Math.min(1, (ahora - t0) / DURA);
      pintaRueda(lz, r.casillas, fin * (1 - Math.pow(1 - p, 4)));
      if (p < 1) return requestAnimationFrame(anima);
      navigator.vibrate?.([60, 40, 120]);
      setTimeout(() => verCupon(cupon), 700);
    })(t0);
  };
}
const FALLOS = { no_existe: "Este QR no vale. Pide otro en la barra 🙂", usado: "Este QR ya se ha usado. Cada QR sirve una sola vez.", caducado: "Este QR ha caducado (duran 5 minutos). Pide otro en la barra 🙂", sin_premios: "Ahora mismo no hay premios disponibles. Avisa en la barra." };
function fallo(cod) {
  capa.classList.add("abierta");
  capa.innerHTML = `<h2>😕 Ups</h2><p style="font-size:18px;margin:18px 0">${FALLOS[cod] || "Algo ha fallado. Pregunta en la barra."}</p><button class="enviar" id="cerrarP">Volver</button>`;
  $$("cerrarP").onclick = () => location.replace(location.pathname);
}
async function verCupon(c) {
  capa.classList.add("abierta");
  const aunNo = new Date(c.desde) > new Date();
  capa.innerHTML = `<h2>🎉 ¡Enhorabuena!</h2>
    <div class="cupon"><div class="nombre">${escapa(c.premio)}</div><div class="cod">${escapa(c.codigo)}</div>
      <small>${aunNo ? "Para tu próxima visita: vale desde " + fecha(c.desde) + ". " : ""}Caduca el ${fecha(c.caduca)}. Un solo uso.</small></div>
    <p style="margin:12px auto 0;max-width:400px;font-weight:800">Para canjearlo: sube esta historia mencionando a ${INSTAGRAM} y enséñala en la barra junto con el código.</p>
    <img class="historia" alt="Tu historia">
    <button class="enviar" id="compartir">📸 Compartir en Instagram</button>
    <button class="enviar otro" id="descargar">⬇️ Descargar imagen</button>
    <p class="nota">Al subirla, añade también la mención a ${INSTAGRAM} desde Instagram para que nos llegue.</p>
    <button class="enviar otro" id="cerrarP">Volver a la página</button>`;
  $$("cerrarP").onclick = () => cerrar(c.c);
  await prepararCompartir(await historia("¡HE GANADO!", c.premio.replace(/\btu\b/gi, "mi"), "en Darkom's"), c.codigo);
  pintaCupones();
}
// botones «Compartir en Instagram» (menú de compartir del móvil, con la imagen lista) y «Descargar imagen»
async function prepararCompartir(blob, dato) {
  const url = URL.createObjectURL(blob), archivo = new File([blob], "darkoms.png", { type: "image/png" });
  capa.querySelector("img.historia").src = url;
  const apunta = () => rpc("evento", { p_tipo: "historia", p_dato: dato, p_disp: disp }).catch(() => {});
  const baja = () => { const a = document.createElement("a"); a.href = url; a.download = archivo.name; a.click(); apunta(); };
  if (!(navigator.canShare && navigator.canShare({ files: [archivo] }))) $$("compartir").style.display = "none";
  $$("compartir").onclick = async () => { try { await navigator.share({ files: [archivo] }); apunta(); } catch (e) { if (e.name !== "AbortError") baja(); } };
  $$("descargar").onclick = baja;
}

// ---- La historia de Instagram: 1080 × 1920 (sin el código, para que nadie lo copie)
function textoPartido(g, texto, ancho, tamMax, tamMin, peso) {
  for (let tam = tamMax; tam >= tamMin; tam -= 6) {
    g.font = `${peso} ${tam}px -apple-system, "Segoe UI", Arial, sans-serif`;
    const lineas = []; let l = "";
    for (const p of texto.split(" ")) { const prueba = l ? l + " " + p : p; if (g.measureText(prueba).width > ancho && l) { lineas.push(l); l = p; } else l = prueba; }
    lineas.push(l);
    if (lineas.length <= 3 && lineas.every(x => g.measureText(x).width <= ancho)) return { lineas, tam };
  }
  return { lineas: [texto], tam: tamMin };
}
async function historia(arriba, centro, abajo) {
  const l = document.createElement("canvas"); l.width = 1080; l.height = 1920; const g = l.getContext("2d"), W = 1080, H = 1920;
  const f = g.createRadialGradient(W / 2, 760, 60, W / 2, 900, 1250); f.addColorStop(0, "#5b2a9d"); f.addColorStop(0.5, "#2a1450"); f.addColorStop(1, "#08050f"); g.fillStyle = f; g.fillRect(0, 0, W, H);
  // rayos de luz desde el premio
  g.save(); g.translate(W / 2, 880); for (let i = 0; i < 24; i++) { g.rotate(Math.PI / 12); if (i % 2) continue; g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1500); g.lineTo(90, -1500); g.closePath(); g.fillStyle = "rgba(255,201,60,.045)"; g.fill(); } g.restore();
  // confeti fijo (siempre igual, sin tapar el centro)
  const C = ["#ffc93c", "#ffffff", "#b58cff", "#ff7ab0", "#3ddc84"]; let sem = 7; const rnd = () => (sem = (sem * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 130; i++) { const x = rnd() * W, y = 250 + rnd() * 1330; if (y > 270 && y < 1490 && x > 90 && x < 990) continue; g.save(); g.translate(x, y); g.rotate(rnd() * 6.3); g.fillStyle = C[i % 5]; g.globalAlpha = 0.5 + rnd() * 0.5; g.fillRect(-13, -6, 26, 12); g.restore(); }
  // logo
  const logo = document.querySelector(".logo");
  if (logo) { await logo.decode?.().catch(() => {}); const an = 760, al = an * logo.naturalHeight / logo.naturalWidth; g.save(); g.shadowColor = "rgba(177,77,255,.9)"; g.shadowBlur = 40; g.drawImage(logo, (W - an) / 2, 300, an, al); g.restore(); }
  // tarjeta con el premio
  const x0 = 90, y0 = 640, cw = 900, ch = 600, p = g.createLinearGradient(0, y0, 0, y0 + ch); p.addColorStop(0, "#ffd968"); p.addColorStop(1, "#ff9d2e");
  g.save(); g.shadowColor = "rgba(0,0,0,.55)"; g.shadowBlur = 50; g.shadowOffsetY = 18; g.fillStyle = p; g.beginPath(); g.roundRect(x0, y0, cw, ch, 48); g.fill(); g.restore();
  g.strokeStyle = "rgba(26,16,36,.35)"; g.lineWidth = 5; g.setLineDash([18, 14]); g.beginPath(); g.roundRect(x0 + 26, y0 + 26, cw - 52, ch - 52, 30); g.stroke(); g.setLineDash([]);
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "#1a1024";
  g.font = "120px serif"; g.fillText("🎉", W / 2, y0 + 115);
  g.font = `900 ${Math.min(72, textoPartido(g, arriba, cw - 170, 72, 40, 900).tam)}px -apple-system, "Segoe UI", Arial, sans-serif`; g.fillText(arriba, W / 2, y0 + 225);
  const { lineas, tam } = textoPartido(g, centro, cw - 130, 104, 50, 900);
  g.font = `900 ${tam}px -apple-system, "Segoe UI", Arial, sans-serif`; const yP = y0 + 385 - (lineas.length - 1) * tam * 0.55;
  lineas.forEach((t, i) => g.fillText(t, W / 2, yP + i * tam * 1.1));
  g.font = `800 50px -apple-system, "Segoe UI", Arial, sans-serif`; g.fillText(abajo, W / 2, y0 + ch - 72);
  // mención y pie (lejos de las zonas que tapa Instagram arriba y abajo)
  g.fillStyle = "#fff"; g.font = `900 66px -apple-system, "Segoe UI", Arial, sans-serif`; g.shadowColor = "rgba(0,0,0,.7)"; g.shadowBlur = 14; g.fillText(INSTAGRAM, W / 2, 1345);
  g.fillStyle = "#ffd968"; g.font = `800 40px -apple-system, "Segoe UI", Arial, sans-serif`; g.fillText("¡Ven y prueba tu suerte!", W / 2, 1430); g.shadowBlur = 0;
  return new Promise(ok => l.toBlob(ok, "image/png"));
}

// ---- Sorteo del local: la pestaña sale solo si el sorteo está abierto
rpc("sorteo_info", {}).then(i => {
  if (i?.abierto !== true) return;
  $$("pestSorteo").style.display = ""; ajustarPestanas();
  if (i.detalles) { $$("sorteoDetalles").textContent = i.detalles; $$("sorteoDetalles").style.display = "block"; }
  if (!ticket) $$("pestSorteo").click();            // con el sorteo abierto, la página abre directamente ahí
}).catch(() => {});
$$("sorteoManda").onclick = async () => {
  if (!codigo) return aviso("Escanea el QR que sale en la tele del bar para participar 📲");
  const n = limpiaQuien($$("sorteoNombre").value);
  if (!n || n === "@") return aviso("Pon tu nombre o tu mesa");
  let r; try { r = await rpc("sorteo_participar", { p_codigo: codigo, p_nombre: etiqueta(n), p_disp: disp }); } catch { return aviso("Sin conexión. Prueba otra vez."); }
  if (r !== "ok") return aviso(r === "codigo" ? MENSAJES.codigo : r === "cerrado" ? "Ahora mismo no hay sorteo abierto." : "No se ha podido apuntar. Prueba otra vez.");
  aviso(""); pantallaSorteo(false); vigilaSorteo();
};
// al participar sale su historia para subirla; si gana, otra (esta pantalla se avisa sola)
async function pantallaSorteo(gano) {
  capa.classList.add("abierta");
  capa.innerHTML = `<h2>${gano ? "🏆 ¡HAS GANADO!" : "🎉 ¡Ya estás dentro!"}</h2>
    <p style="margin:10px auto 0;max-width:400px;font-weight:800">${gano ? "Acércate a la barra a recoger tu premio y súbelo a tus historias 👇" : "Súbelo a tus historias mencionando a " + INSTAGRAM + " y mira la tele: el ganador sale ahí."}</p>
    <img class="historia" alt="Tu historia"><button class="enviar" id="compartir">📸 Compartir en Instagram</button><button class="enviar otro" id="descargar">⬇️ Descargar imagen</button>
    <button class="enviar otro" id="cerrarP">Volver a la página</button>`;
  $$("cerrarP").onclick = () => capa.classList.remove("abierta");
  if (gano) navigator.vibrate?.([80, 50, 160]);
  await prepararCompartir(await historia(gano ? "¡HE GANADO!" : "¡ESTOY PARTICIPANDO!", "el sorteo de esta noche", "en Darkom's"), gano ? "sorteo_gana" : "sorteo");
}
let vigilando = null;
function vigilaSorteo() {
  clearInterval(vigilando);
  vigilando = setInterval(async () => {
    let g; try { g = await rpc("sorteo_soy_ganador", { p_disp: disp }); } catch { return; }
    if (g === true) { clearInterval(vigilando); pantallaSorteo(true); }
  }, 4000);
  setTimeout(() => clearInterval(vigilando), 3 * 3600e3);
}

pintaCupones();
if (ticket) ruleta();
})();
