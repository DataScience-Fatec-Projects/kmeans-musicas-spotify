// Simulador "K-Means passo a passo": o mesmo da aula (notebook, I.3), no visual da página.
import { inicializar, atribuir, atualizar, inercia } from "./kmeans.js";
import { formatar } from "./formato.js";
import { t } from "./textos.js";
import { idiomaAtual } from "./idioma.js";

const TOLERANCIA = 1e-4;

/** Estado do simulador, sem DOM: as fases do algoritmo e o que cada botão faz. */
export function criarEstadoPasso(pontosIniciais, k, semente) {
  const copiar = pts => pts.map(p => p.slice());
  const e = {
    pontos: copiar(pontosIniciais), k, semente,
    centroides: null, anteriores: null, rotulos: null, iteracao: 0, fase: "vazio", deslocamento: 0,

    get inercia() { return this.rotulos ? inercia(this.pontos, this.rotulos, this.centroides) : null; },

    /** Passo 1. Devolve false se há menos pontos que grupos. */
    inicializar() {
      if (this.pontos.length < this.k) return false;
      this.centroides = inicializar(this.pontos, this.k, this.semente);
      this.anteriores = null; this.rotulos = null; this.iteracao = 0; this.fase = "inicializado";
      return true;
    },
    /** Passo 2. */
    atribuir() {
      if (!this.centroides || this.fase === "convergiu" || this.fase === "atribuido") return;
      this.rotulos = atribuir(this.pontos, this.centroides);
      this.anteriores = null; this.iteracao += 1; this.fase = "atribuido";
    },
    /** Passo 3 (e 4: se os centroides não se mexeram, convergiu). */
    atualizar() {
      if (this.fase !== "atribuido") return;
      const r = atualizar(this.pontos, this.rotulos, this.centroides);
      this.anteriores = this.centroides; this.centroides = r.centroides; this.deslocamento = r.deslocamento;
      this.fase = r.deslocamento < TOLERANCIA ? "convergiu" : "atualizado";
    },
    acrescentarPonto(ponto) {
      this.pontos.push(ponto.slice());
      this.rotulos = null; this.anteriores = null;
      if (this.centroides) this.fase = "inicializado";
    },
    restaurar() { this.pontos = copiar(pontosIniciais); this.zerar(); },
    limpar() { this.pontos = []; this.zerar(); },
    zerar() { this.centroides = this.anteriores = this.rotulos = null; this.iteracao = 0; this.fase = "vazio"; },
  };
  return e;
}

/** Monta o simulador dentro do elemento e liga os controles. */
export function iniciarSimuladorPasso(elemento, dados) {
  const D = dados.simulador_passo;
  const estado = criarEstadoPasso(D.pontos, 3, 1);
  let mensagem = { chave: "simp.msg.inicio", vars: {} }, timer = null;

  elemento.innerHTML = `
    <div class="sim-controles">
      <label><span data-t="simp.k"></span><select data-id="k"></select></label>
      <label><span data-t="simp.sorteio"></span><input data-id="semente" type="number" min="0" step="1" value="1" inputmode="numeric"></label>
      <button type="button" class="sim-passo" data-id="inicializar" data-t="simp.inicializar"></button>
      <button type="button" class="sim-passo" data-id="atribuir" data-t="simp.atribuir"></button>
      <button type="button" class="sim-passo" data-id="atualizar" data-t="simp.atualizar"></button>
      <button type="button" data-id="rodar"></button>
      <button type="button" data-id="novo" data-t="simp.novo"></button>
      <button type="button" data-id="restaurar" data-t="simp.restaurar"></button>
      <button type="button" data-id="limpar" data-t="simp.limpar"></button>
    </div>
    <div class="sim-area">
      <canvas data-id="tela" width="1120" height="800" role="img"></canvas>
      <div class="sim-painel">
        <div class="sim-numeros">
          <div><span class="sim-rotulo" data-t="simp.iteracao"></span><b data-id="iteracao">0</b></div>
          <div><span class="sim-rotulo" data-t="simp.inercia"></span><b data-id="inercia">–</b></div>
        </div>
        <p class="sim-status" data-id="status" aria-live="polite"></p>
        <p class="sim-legenda" data-t="simp.legenda"></p>
      </div>
    </div>`;
  const el = id => elemento.querySelector('[data-id="' + id + '"]');
  const tela = el("tela"), ctx = tela.getContext("2d");
  const W = tela.width, H = tela.height, M = 50;
  for (let i = 1; i <= 6; i++) el("k").add(new Option(String(i), String(i), i === 3, i === 3));

  const xs = D.pontos.map(p => p[0]), ys = D.pontos.map(p => p[1]), folga = 0.08;
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const lim = { x0: x0 - folga * (x1 - x0), x1: x1 + folga * (x1 - x0), y0: y0 - folga * (y1 - y0), y1: y1 + folga * (y1 - y0) };
  const px = x => M + (x - lim.x0) / (lim.x1 - lim.x0) * (W - 2 * M);
  const py = y => H - M - (y - lim.y0) / (lim.y1 - lim.y0) * (H - 2 * M);

  function dizer(chave, vars = {}) { mensagem = { chave, vars }; }

  function seta(a, b) {
    const [ax, ay, bx, by] = [px(a[0]), py(a[1]), px(b[0]), py(b[1])];
    if (Math.hypot(bx - ax, by - ay) < 4) return;
    const ang = Math.atan2(by - ay, bx - ax);
    ctx.strokeStyle = ctx.fillStyle = "#f2f2f2"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by);
    ctx.lineTo(bx - 18 * Math.cos(ang - 0.4), by - 18 * Math.sin(ang - 0.4));
    ctx.lineTo(bx - 18 * Math.cos(ang + 0.4), by - 18 * Math.sin(ang + 0.4));
    ctx.closePath(); ctx.fill();
  }

  function desenhar() {
    const idioma = idiomaAtual();
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
    for (let i = 0; i <= 8; i++) {
      const gx = M + i * (W - 2 * M) / 8, gy = M + i * (H - 2 * M) / 8;
      ctx.beginPath(); ctx.moveTo(gx, M); ctx.lineTo(gx, H - M); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(M, gy); ctx.lineTo(W - M, gy); ctx.stroke();
    }
    ctx.globalAlpha = 0.85;
    estado.pontos.forEach((p, i) => {
      ctx.fillStyle = estado.rotulos ? D.cores[estado.rotulos[i] % D.cores.length] : "#8a8a8a";
      ctx.beginPath(); ctx.arc(px(p[0]), py(p[1]), 7, 0, 2 * Math.PI); ctx.fill();
    });
    ctx.globalAlpha = 1;
    (estado.centroides || []).forEach((c, j) => {
      if (estado.anteriores) {
        ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(px(estado.anteriores[j][0]), py(estado.anteriores[j][1]), 13, 0, 2 * Math.PI); ctx.stroke();
        seta(estado.anteriores[j], c);
      }
      const [cx, cy] = [px(c[0]), py(c[1])];
      const xis = () => { ctx.beginPath(); ctx.moveTo(cx - 15, cy - 15); ctx.lineTo(cx + 15, cy + 15); ctx.moveTo(cx + 15, cy - 15); ctx.lineTo(cx - 15, cy + 15); ctx.stroke(); };
      ctx.lineCap = "round";
      ctx.strokeStyle = "#f2f2f2"; ctx.lineWidth = 14; xis();
      ctx.strokeStyle = D.cores[j % D.cores.length]; ctx.lineWidth = 7; xis();
    });

    elemento.querySelectorAll("[data-t]").forEach(n => { n.textContent = t(n.dataset.t, idioma); });
    el("rodar").textContent = t(timer ? "simp.pausar" : "simp.rodar", idioma);
    el("iteracao").textContent = estado.iteracao;
    el("inercia").textContent = estado.inercia === null ? "–" : formatar(estado.inercia, 1, idioma);
    el("status").innerHTML = t(mensagem.chave, idioma, mensagem.vars);
    tela.setAttribute("aria-label", t("simp.tela", idioma, { n: estado.pontos.length, k: estado.k }));
    el("atribuir").disabled = !estado.centroides || ["convergiu", "atribuido"].includes(estado.fase) || !!timer;
    el("atualizar").disabled = estado.fase !== "atribuido" || !!timer;
  }

  function parar() { if (timer) clearInterval(timer); timer = null; }

  function fazerInicializar() {
    parar();
    estado.k = Number(el("k").value);
    estado.semente = Math.max(0, Math.floor(Number(el("semente").value) || 0));
    if (estado.inicializar()) dizer("simp.msg.inicializado", { k: estado.k });
    else dizer("simp.msg.faltam", { k: estado.k });
    desenhar();
  }
  function fazerAtribuir() {
    estado.atribuir();
    dizer("simp.msg.atribuido", { iteracao: estado.iteracao });
    desenhar();
  }
  function fazerAtualizar() {
    estado.atualizar();
    if (estado.fase === "convergiu") dizer("simp.msg.convergiu", { iteracao: estado.iteracao });
    else dizer("simp.msg.atualizado", { deslocamento: formatar(estado.deslocamento, 2, idiomaAtual()) });
    desenhar();
  }
  function rodar() {
    if (timer) { parar(); desenhar(); return; }
    if (!estado.centroides || estado.fase === "convergiu") fazerInicializar();
    if (!estado.centroides) return;
    timer = setInterval(() => {
      if (estado.fase === "atribuido") fazerAtualizar(); else fazerAtribuir();
      if (estado.fase === "convergiu" || estado.iteracao >= 100) { parar(); desenhar(); }
    }, 450);
    desenhar();
  }

  tela.addEventListener("click", ev => {
    const r = tela.getBoundingClientRect();
    const x = lim.x0 + ((ev.clientX - r.left) * W / r.width - M) / (W - 2 * M) * (lim.x1 - lim.x0);
    const y = lim.y0 + (H - M - (ev.clientY - r.top) * H / r.height) / (H - 2 * M) * (lim.y1 - lim.y0);
    parar();
    estado.acrescentarPonto([x, y]);
    dizer(estado.centroides ? "simp.msg.ponto" : "simp.msg.ponto_sem", { n: estado.pontos.length });
    desenhar();
  });
  el("inicializar").onclick = fazerInicializar;
  el("atribuir").onclick = () => { parar(); fazerAtribuir(); };
  el("atualizar").onclick = () => { parar(); fazerAtualizar(); };
  el("rodar").onclick = rodar;
  el("novo").onclick = () => { el("semente").value = (Number(el("semente").value) || 0) + 1; fazerInicializar(); };
  el("restaurar").onclick = () => { parar(); estado.restaurar(); dizer("simp.msg.restaurado"); desenhar(); };
  el("limpar").onclick = () => { parar(); estado.limpar(); dizer("simp.msg.limpo"); desenhar(); };
  el("k").onchange = fazerInicializar;
  document.addEventListener("idioma", desenhar); // troca os textos sem mexer no estado
  desenhar();
  return estado;
}
