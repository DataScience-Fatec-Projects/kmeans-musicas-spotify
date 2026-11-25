// Capítulo "Escala": as mesmas faixas desenhadas com a mesma régua nos dois eixos
// (dançabilidade × andamento). Conforme o scroll, os valores originais (uma linha vertical:
// só o andamento conta) viram os padronizados (uma nuvem arredondada), e a parte de cada
// característica na distância entre as faixas A e B muda junto.
import { progressoDoScroll } from "./abertura.js";
import { formatar } from "./formato.js";
import { t } from "./textos.js";
import { idiomaAtual } from "./idioma.js";

const limitar = v => Math.min(1, Math.max(0, v));
const suavizar = v => v * v * (3 - 2 * v);
const NS = "http://www.w3.org/2000/svg";
const TOPO = 52; // altura da barra fixa do topo; o palco gruda logo abaixo dela

/** Quadro que enquadra uma nuvem de pontos com a mesma régua nos dois eixos. */
function quadro(pontos) {
  const x = pontos.map(p => p[0]), y = pontos.map(p => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...x), Math.max(...x), Math.min(...y), Math.max(...y)];
  return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, meia: 0.55 * Math.max(x1 - x0, y1 - y0) };
}

/** Prepara os dois estados: valores originais e padronizados (mesma conta do StandardScaler). */
export function prepararEscala(anim) {
  const [md, mt] = anim.media, [sd, st] = anim.desvio;
  const padronizar = ([d, tp]) => [(d - md) / sd, (tp - mt) / st];
  const bruto = anim.pontos.map(p => [p[0], p[1]]);
  const z = bruto.map(padronizar);
  return {
    bruto, z, a: { bruto: anim.a, z: padronizar(anim.a) }, b: { bruto: anim.b, z: padronizar(anim.b) },
    qBruto: quadro(bruto), qZ: quadro(z),
  };
}

/** Leva um ponto do quadro para a área quadrada da tela (o eixo y cresce para cima). */
function mapear([x, y], q, area) {
  const k = area.lado / 2 / q.meia;
  return [area.x + area.lado / 2 + (x - q.cx) * k, area.y + area.lado / 2 - (y - q.cy) * k];
}

/** Posição na tela de um ponto, para e de 0 (original) a 1 (padronizado). */
export function posicaoEscala(bruto, z, prep, e, area) {
  const [xb, yb] = mapear(bruto, prep.qBruto, area), [xz, yz] = mapear(z, prep.qZ, area);
  return [xb + (xz - xb) * e, yb + (yz - yb) * e];
}

/** Parte (%) de cada eixo no quadrado da distância entre A e B, como desenhada para esse e. */
export function partesDaDistancia(prep, e) {
  const area = { x: 0, y: 0, lado: 1000 };
  const [ax, ay] = posicaoEscala(prep.a.bruto, prep.a.z, prep, e, area);
  const [bx, by] = posicaoEscala(prep.b.bruto, prep.b.z, prep, e, area);
  const dx2 = (ax - bx) ** 2, dy2 = (ay - by) ** 2;
  return { danca: (100 * dx2) / (dx2 + dy2), andamento: (100 * dy2) / (dx2 + dy2) };
}

/** Opacidade dos rótulos de cada estado: trocam no meio da transição, sem se sobrepor. */
export function opacidades(e) {
  return [limitar(1 - 2 * e), limitar(2 * e - 1)];
}

/** Do progresso do scroll (0 a 1) para a mistura dos dois estados, com folga nas pontas. */
export function misturaDoProgresso(progresso, semMovimento = false) {
  if (semMovimento) return progresso < 0.5 ? 0 : 1;
  return suavizar(limitar((progresso - 0.15) / 0.7));
}

const el = (nome, atributos = {}) => {
  const n = document.createElementNS(NS, nome);
  for (const [k, v] of Object.entries(atributos)) n.setAttribute(k, v);
  return n;
};

/** Liga a animação no palco do capítulo "Escala". */
export function iniciarEscala(palco, dados) {
  const figura = palco.querySelector("[data-animacao]");
  const prep = prepararEscala(dados.escala_anim);
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");
  const L = 520, area = { x: 64, y: 16, lado: 432 };

  const svg = el("svg", { viewBox: `0 0 ${L} ${L}`, role: "img" });
  const titulo = el("title"), desc = el("desc");
  const moldura = el("rect", { x: area.x, y: area.y, width: area.lado, height: area.lado, class: "esc-moldura" });
  const ticks = el("g");
  const nuvem = el("g");
  const circulos = prep.bruto.map(() => nuvem.appendChild(el("circle", { r: 2.2, class: "esc-ponto" })));
  const catetoX = el("line", { class: "esc-cateto" }), catetoY = el("line", { class: "esc-cateto" });
  const linhaAB = el("line", { class: "esc-ab" });
  const pontoA = el("circle", { r: 7, class: "esc-a" }), pontoB = el("circle", { r: 7, class: "esc-b" });
  const rotA = el("text", { class: "esc-rot" }), rotB = el("text", { class: "esc-rot" });
  rotA.textContent = "A"; rotB.textContent = "B";
  const eixoX = [el("text", { class: "eixo", "text-anchor": "middle" }), el("text", { class: "eixo", "text-anchor": "middle" })];
  const eixoY = [el("text", { class: "eixo", "text-anchor": "middle" }), el("text", { class: "eixo", "text-anchor": "middle" })];
  const nota = el("text", { class: "esc-nota" });
  svg.append(titulo, desc, moldura, ticks, nuvem, catetoX, catetoY, linhaAB, pontoA, pontoB, rotA, rotB, ...eixoX, ...eixoY, nota);

  const leitura = document.createElement("div");
  leitura.className = "esc-leitura";
  leitura.innerHTML = `<p class="esc-estado"></p>
    <p class="esc-titulo-barras"></p>
    <div class="esc-barra" data-eixo="andamento"><span></span><i><s></s></i><b></b></div>
    <div class="esc-barra" data-eixo="danca"><span></span><i><s></s></i><b></b></div>
    <p class="esc-faixas"></p>`;
  figura.replaceChildren(svg, leitura);
  palco.classList.add("animada");

  // marcas dos eixos: andamento em BPM no estado original; desvios-padrão no padronizado
  const marcasBpm = [50, 100, 150, 200], marcasZ = [-3, -2, -1, 0, 1, 2, 3];
  function desenharTicks(e) {
    const [o0, o1] = opacidades(e);
    ticks.replaceChildren();
    const base = area.y + area.lado, esquerda = area.x;
    for (const bpm of marcasBpm) {
      const [, y] = mapear([prep.qBruto.cx, bpm], prep.qBruto, area);
      if (y < area.y || y > base) continue;
      const tx = el("text", { class: "eixo", x: esquerda - 8, y: y + 4, "text-anchor": "end", opacity: o0 });
      tx.textContent = bpm;
      ticks.append(tx);
    }
    for (const v of marcasZ) {
      const [x, y] = mapear([v, v], prep.qZ, area);
      if (y >= area.y && y <= base) {
        const ty = el("text", { class: "eixo", x: esquerda - 8, y: y + 4, "text-anchor": "end", opacity: o1 });
        ty.textContent = formatar(v, 0, idiomaAtual());
        ticks.append(ty);
      }
      if (x >= area.x && x <= area.x + area.lado) {
        const tx = el("text", { class: "eixo", x, y: base + 20, "text-anchor": "middle", opacity: o1 });
        tx.textContent = formatar(v, 0, idiomaAtual());
        ticks.append(tx);
      }
    }
  }

  function escreverTextos() {
    const idioma = idiomaAtual();
    titulo.textContent = t("esc.titulo", idioma);
    svg.setAttribute("aria-label", t("esc.titulo", idioma));
    desc.textContent = t("esc.desc", idioma, {
      n: formatar(prep.bruto.length, 0, idioma),
      sem: formatar(partesDaDistancia(prep, 0).andamento, 1, idioma),
      com: formatar(partesDaDistancia(prep, 1).danca, 1, idioma),
    });
    const meio = area.x + area.lado / 2;
    ["esc.eixo_x_sem", "esc.eixo_x_com"].forEach((chave, i) => {
      eixoX[i].textContent = t(chave, idioma);
      eixoX[i].setAttribute("x", meio);
      eixoX[i].setAttribute("y", area.y + area.lado + 40);
    });
    ["esc.eixo_y_sem", "esc.eixo_y_com"].forEach((chave, i) => {
      eixoY[i].textContent = t(chave, idioma);
      eixoY[i].setAttribute("transform", `translate(16, ${area.y + area.lado / 2}) rotate(-90)`);
    });
    nota.replaceChildren(...t("esc.nota", idioma).split("|").map((linha, i) => {
      const ts = el("tspan", { dy: i ? "1.25em" : "0" });
      ts.textContent = linha;
      return ts;
    }));
    leitura.querySelector(".esc-titulo-barras").textContent = t("esc.parte", idioma);
    leitura.querySelector('[data-eixo="andamento"] span').textContent = t("feature.tempo", idioma);
    leitura.querySelector('[data-eixo="danca"] span').textContent = t("feature.danceability", idioma);
    leitura.querySelector(".esc-faixas").textContent = t("esc.faixas", idioma, { a: dados.escala.faixa_a, b: dados.escala.faixa_b });
  }

  let pedido = 0;
  function desenhar() {
    pedido = 0;
    const r = palco.getBoundingClientRect();
    const progresso = progressoDoScroll(r.top - TOPO, r.height, window.innerHeight - TOPO);
    const e = misturaDoProgresso(progresso, semMovimento.matches);
    const idioma = idiomaAtual();

    prep.bruto.forEach((p, i) => {
      const [x, y] = posicaoEscala(p, prep.z[i], prep, e, area);
      circulos[i].setAttribute("cx", x.toFixed(1));
      circulos[i].setAttribute("cy", y.toFixed(1));
    });
    const [ax, ay] = posicaoEscala(prep.a.bruto, prep.a.z, prep, e, area);
    const [bx, by] = posicaoEscala(prep.b.bruto, prep.b.z, prep, e, area);
    const linha = (n, x1, y1, x2, y2) => { n.setAttribute("x1", x1); n.setAttribute("y1", y1); n.setAttribute("x2", x2); n.setAttribute("y2", y2); };
    linha(catetoX, bx, by, ax, by);
    linha(catetoY, ax, by, ax, ay);
    linha(linhaAB, bx, by, ax, ay);
    pontoA.setAttribute("cx", ax); pontoA.setAttribute("cy", ay);
    pontoB.setAttribute("cx", bx); pontoB.setAttribute("cy", by);
    rotA.setAttribute("x", ax + 11); rotA.setAttribute("y", ay - 8);
    rotB.setAttribute("x", bx - 20); rotB.setAttribute("y", by + 18);
    const [o0, o1] = opacidades(e);
    eixoX[0].setAttribute("opacity", o0); eixoX[1].setAttribute("opacity", o1);
    eixoY[0].setAttribute("opacity", o0); eixoY[1].setAttribute("opacity", o1);
    const [lx] = mapear([prep.qBruto.cx, 0], prep.qBruto, area);
    nota.setAttribute("x", lx + 14);
    nota.setAttribute("y", area.y + 30);
    nota.querySelectorAll("tspan").forEach(ts => ts.setAttribute("x", lx + 14));
    nota.setAttribute("opacity", limitar(1 - e * 4));
    desenharTicks(e);

    const partes = partesDaDistancia(prep, e);
    const estado = e < 0.02 ? "esc.sem" : e > 0.98 ? "esc.com" : "esc.meio";
    leitura.querySelector(".esc-estado").textContent = t(estado, idioma);
    for (const [eixo, valor] of [["andamento", partes.andamento], ["danca", partes.danca]]) {
      const barra = leitura.querySelector(`[data-eixo="${eixo}"]`);
      barra.querySelector("s").style.width = valor.toFixed(1) + "%";
      barra.querySelector("b").textContent = formatar(valor, 1, idioma) + "%";
    }
  }

  const pedir = () => {
    const r = palco.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return; // palco fora da tela
    if (!pedido) pedido = requestAnimationFrame(desenhar);
  };
  window.addEventListener("scroll", pedir, { passive: true });
  window.addEventListener("resize", pedir);
  semMovimento.addEventListener("change", desenhar);
  document.addEventListener("idioma", () => { escreverTextos(); desenhar(); });
  escreverTextos();
  desenhar();
}
