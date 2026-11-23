// Abertura: as 6.000 faixas da amostra da aula começam espalhadas e cinza e, conforme o
// scroll, vão para a sua posição real (as duas componentes do PCA) e ganham a cor do grupo.
import { criarSorteador } from "./kmeans.js";
import { t } from "./textos.js";
import { idiomaAtual } from "./idioma.js";

const limitar = v => Math.min(1, Math.max(0, v));
const suavizar = v => v * v * (3 - 2 * v);
const FRACAO_DE_ATRASO = 0.35; // quanto do percurso é usado para escalonar a partida dos pontos

/** 0 no começo do trecho preso, 1 no fim. Sem curso de rolagem, vale 1 (estado final). */
export function progressoDoScroll(topo, altura, alturaJanela) {
  const curso = altura - alturaJanela;
  if (curso <= 0) return 1;
  return limitar(-topo / curso);
}

/** Posições iniciais (ao acaso, mas sempre as mesmas) e o atraso de partida de cada ponto. */
export function criarEspalhados(n, semente = 42) {
  const sorteio = criarSorteador(semente);
  const x = [], y = [], atraso = [];
  for (let i = 0; i < n; i++) { x.push(sorteio()); y.push(sorteio()); atraso.push(sorteio()); }
  return { x, y, atraso };
}

/** Leva os pontos do PCA para o quadrado [0, 1], guardando a proporção largura/altura. */
export function normalizarPontos(pontos, centroidesPca) {
  let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (let i = 0; i < pontos.x.length; i++) {
    x0 = Math.min(x0, pontos.x[i]); x1 = Math.max(x1, pontos.x[i]);
    y0 = Math.min(y0, pontos.y[i]); y1 = Math.max(y1, pontos.y[i]);
  }
  const nx = v => (v - x0) / (x1 - x0);
  const ny = v => 1 - (v - y0) / (y1 - y0); // no gráfico, o eixo y cresce para cima
  return {
    x: pontos.x.map(nx), y: pontos.y.map(ny), grupo: pontos.grupo,
    centroides: centroidesPca.map(c => [limitar(nx(c[0])), limitar(ny(c[1]))]),
    proporcao: (x1 - x0) / (y1 - y0),
  };
}

/** Posição do ponto i (no quadrado unitário) para um progresso de 0 a 1. */
export function posicaoDoPonto(i, progresso, destino, espalhados) {
  const partida = (espalhados.atraso ? espalhados.atraso[i] : 0) * FRACAO_DE_ATRASO;
  const local = suavizar(limitar((progresso - partida) / (1 - FRACAO_DE_ATRASO)));
  return [
    espalhados.x[i] * (1 - local) + destino.x[i] * local,
    espalhados.y[i] * (1 - local) + destino.y[i] * local,
  ];
}

/** Onde escrever o nome de cada grupo: perto do seu centroide, sem cobrir nenhum centroide
 *  nem outro nome, e dentro da tela. Devolve o centro de cada rótulo, na ordem dos grupos. */
export function posicoesDosNomes(centros, largura, altura, tam) {
  const colide = (a, b) => Math.abs(a.x - b.x) < tam.l && Math.abs(a.y - b.y) < tam.a;
  const cobre = (p, c) => Math.abs(p.x - c[0]) < tam.l / 2 + 8 && Math.abs(p.y - c[1]) < tam.a / 2 + 8;
  const postos = [];
  const ordem = centros.map((c, g) => g).sort((a, b) => centros[a][1] - centros[b][1]);
  const resultado = new Array(centros.length);
  for (const g of ordem) {
    const [cx, cy] = centros[g];
    let melhor = null;
    for (let n = 1; n <= 8 && !melhor; n++) {
      const dy = tam.a / 2 + 14 + (n - 1) * tam.a, dx = tam.l / 2 + 16 + (n - 1) * 24;
      const candidatos = [[0, -dy], [0, dy], [dx, 0], [-dx, 0], [dx, -dy], [-dx, -dy], [dx, dy], [-dx, dy]];
      for (const [ox, oy] of candidatos) {
        const p = { x: Math.min(largura - tam.l / 2, Math.max(tam.l / 2, cx + ox)), y: cy + oy };
        if (p.y < tam.a || p.y > altura - tam.a) continue;
        if (centros.some(c => cobre(p, c)) || postos.some(q => colide(p, q))) continue;
        melhor = p;
        break;
      }
    }
    resultado[g] = melhor || { x: Math.min(largura - tam.l / 2, Math.max(tam.l / 2, cx)), y: cy - tam.a };
    postos.push(resultado[g]);
  }
  return resultado;
}

const hexParaRgb = hex => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const CINZA = [122, 122, 122];

/** Liga a abertura: canvas, nomes dos grupos e a troca do número grande. */
export function iniciarAbertura(secao, dados) {
  const fixa = secao.querySelector(".abertura-fixa");
  const tela = secao.querySelector("canvas");
  const nomes = secao.querySelector(".abertura-nomes");
  const ctx = tela.getContext("2d");
  const destino = normalizarPontos(dados.pontos, dados.grupos.map(g => g.pca));
  const espalhados = criarEspalhados(destino.x.length);
  const cores = dados.grupos.map(g => hexParaRgb(g.cor));
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const rotulos = dados.grupos.map(g => {
    const el = document.createElement("span");
    el.style.setProperty("--cor", g.cor);
    nomes.appendChild(el);
    return el;
  });
  let largura = 0, altura = 0, dpr = 1, pedido = 0;
  // posições em pixels, recalculadas a cada mudança de tamanho:
  // partida = espalhados pela tela inteira; chegada = agrupados dentro da caixa
  let partida = { x: [], y: [], atraso: espalhados.atraso }, chegada = { x: [], y: [] }, cx = null;

  /** Onde os pontos agrupados ficam na tela: à direita no computador, no alto no celular. */
  function caixa() {
    const estreita = largura < 760;
    const area = estreita
      ? { x: largura * 0.08, y: altura * 0.2, l: largura * 0.84, a: altura * 0.4 }
      : { x: largura * 0.4, y: altura * 0.27, l: largura * 0.54, a: altura * 0.62 };
    // mantém a proporção do gráfico original dentro da área
    let l = area.l, a = l / destino.proporcao;
    if (a > area.a) { a = area.a; l = a * destino.proporcao; }
    return { x: area.x + (area.l - l) / 2, y: area.y + (area.a - a) / 2, l, a };
  }

  function redimensionar() {
    const r = fixa.getBoundingClientRect();
    largura = r.width; altura = r.height;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    tela.width = Math.round(largura * dpr);
    tela.height = Math.round(altura * dpr);
    cx = caixa();
    partida = { x: espalhados.x.map(v => v * largura), y: espalhados.y.map(v => v * altura), atraso: espalhados.atraso };
    chegada = { x: destino.x.map(v => cx.x + v * cx.l), y: destino.y.map(v => cx.y + v * cx.a) };
    desenhar();
  }

  function escreverNomes() {
    rotulos.forEach((el, g) => { el.textContent = t("grupo." + g, idiomaAtual()); });
  }

  function posicionarNomes(cx, visibilidade) {
    const centros = destino.centroides.map(c => [cx.x + c[0] * cx.l, cx.y + c[1] * cx.a]);
    const tam = largura < 760 ? { l: 132, a: 22 } : { l: 170, a: 26 };
    posicoesDosNomes(centros, largura, altura, tam).forEach((p, g) => {
      const el = rotulos[g];
      el.style.left = p.x + "px";
      el.style.top = p.y + "px";
      el.style.opacity = visibilidade;
    });
  }

  function desenhar() {
    pedido = 0;
    const r = secao.getBoundingClientRect();
    const progresso = semMovimento.matches ? 1 : progressoDoScroll(r.top, r.height, window.innerHeight);
    // três tempos: parado (0 a 0,08), migração (0,08 a 0,8), nomes (0,8 a 1)
    const migracao = limitar((progresso - 0.08) / 0.72);
    const cor = suavizar(limitar((progresso - 0.3) / 0.45));
    const fim = suavizar(limitar((progresso - 0.8) / 0.15));
    const passo = largura < 600 ? 2 : 1;
    const raio = (largura < 600 ? 1.3 : 1.7) * dpr;

    ctx.clearRect(0, 0, tela.width, tela.height);
    ctx.globalAlpha = 0.5 + 0.2 * cor;
    for (let g = 0; g < cores.length; g++) {
      const c = cores[g].map((v, k) => Math.round(CINZA[k] + (v - CINZA[k]) * cor));
      ctx.fillStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
      ctx.beginPath();
      for (let i = 0; i < destino.x.length; i += passo) {
        if (destino.grupo[i] !== g) continue;
        const [x, y] = posicaoDoPonto(i, migracao, chegada, partida);
        ctx.moveTo(x * dpr + raio, y * dpr);
        ctx.arc(x * dpr, y * dpr, raio, 0, 6.2832);
      }
      ctx.fill();
    }
    // centroides: um anel por grupo, no fim
    ctx.globalAlpha = fim;
    destino.centroides.forEach((c, g) => {
      const x = (cx.x + c[0] * cx.l) * dpr, y = (cx.y + c[1] * cx.a) * dpr;
      ctx.beginPath(); ctx.arc(x, y, 7 * dpr, 0, 6.2832);
      ctx.fillStyle = dados.grupos[g].cor; ctx.fill();
      ctx.lineWidth = 2 * dpr; ctx.strokeStyle = "#0c0c0c"; ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y, 9.5 * dpr, 0, 6.2832);
      ctx.lineWidth = 1.5 * dpr; ctx.strokeStyle = "#f2f2f2"; ctx.stroke();
    });
    ctx.globalAlpha = 1;

    posicionarNomes(cx, fim);
    fixa.style.setProperty("--fim", fim.toFixed(3));
    fixa.style.setProperty("--progresso", progresso.toFixed(3));
  }

  const pedir = () => {
    if (secao.getBoundingClientRect().bottom < 0) return; // abertura fora da tela: nada a redesenhar
    if (!pedido) pedido = requestAnimationFrame(desenhar);
  };
  window.addEventListener("scroll", pedir, { passive: true });
  // um só gatilho de redimensionamento, para não redesenhar em dobro
  if ("ResizeObserver" in window) new ResizeObserver(redimensionar).observe(fixa);
  else window.addEventListener("resize", redimensionar);
  semMovimento.addEventListener("change", redimensionar);
  document.addEventListener("idioma", () => { escreverNomes(); pedir(); });
  secao.classList.add("animada");
  escreverNomes();
  redimensionar();
}
