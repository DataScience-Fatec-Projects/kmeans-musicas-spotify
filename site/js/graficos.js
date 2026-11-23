// Gráficos dos capítulos, desenhados em SVG a partir do aula.json. Cada gráfico tem uma
// função descrever…(), que gera o resumo em texto usado como descrição acessível.
import { formatar } from "./formato.js";
import { t } from "./textos.js";

/** Mapeia um intervalo de valores (domínio) num intervalo de pixels (imagem). */
export function escalaLinear([d0, d1], [i0, i1]) {
  return v => i0 + ((v - d0) / (d1 - d0)) * (i1 - i0);
}

const mistura = (a, b, p) => a.map((v, i) => Math.round(v + (b[i] - v) * p));
const rgb = c => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
const NEUTRO = [26, 26, 26], AZUL = [66, 146, 222], VERMELHO = [226, 82, 74], CLARO = [242, 242, 242];

/** Azul (abaixo da média) → neutro → vermelho (acima), saturando em ±3 desvios-padrão. */
export function corDivergente(z) {
  const p = Math.min(Math.abs(z) / 3, 1);
  return rgb(mistura(NEUTRO, z < 0 ? AZUL : VERMELHO, p));
}

/** Do neutro escuro ao claro, para porcentagens de 0 a 100. */
export function corSequencial(pct) {
  return rgb(mistura(NEUTRO, CLARO, Math.min(Math.max(pct, 0), 100) / 100));
}

/** Preto ou branco, o que tiver contraste AA sobre a cor de fundo dada. */
export function corDoTexto(fundo) {
  const lum = fundo.match(/\d+/g).map(Number)
    .map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  return lum > 0.179 ? "rgb(0, 0, 0)" : "rgb(255, 255, 255)";
}

// ───────── Descrições em texto ─────────
export function descreverFunil(dados, idioma) {
  const f = v => formatar(v, 0, idioma);
  return t("graf.funil.desc", idioma, { linhas: f(dados.limpeza.linhas), pares: f(dados.limpeza.pares), faixas: f(dados.limpeza.faixas) });
}

export function descreverContribuicao(dados, idioma) {
  const i = id => dados.features.findIndex(f => f.id === id);
  return t("graf.contrib.desc", idioma, {
    volume: formatar(dados.escala.sem_padronizar[i("loudness")], 1, idioma),
    andamento: formatar(dados.escala.sem_padronizar[i("tempo")], 1, idioma),
  });
}

export function descreverK(dados, idioma) {
  const k = dados.meta.k;
  return t("graf.k.desc", idioma, { k: String(k), silhueta: formatar(dados.k.silhuetas[k - 1], 3, idioma) });
}

export function descreverPerfis(dados, idioma) {
  let melhor = { v: -Infinity, g: 0, f: 0 };
  dados.grupos.forEach((g, gi) => g.centroide_z.forEach((v, fi) => { if (v > melhor.v) melhor = { v, g: gi, f: fi }; }));
  return t("graf.perfis.desc", idioma, {
    grupo: t("grupo." + melhor.g, idioma), feature: t("feature." + dados.features[melhor.f].id, idioma),
    valor: formatar(melhor.v, 1, idioma),
  });
}

export function descreverGeneros(dados, idioma) {
  const aoVivo = dados.grupos.length - 1; // o grupo "Ao vivo" é o último
  const pct = genero => formatar(dados.generos.find(g => g.genero === genero).pct_int[aoVivo], 0, idioma);
  return t("graf.generos.desc", idioma, { grupo: t("grupo." + aoVivo, idioma), pagode: pct("pagode"), sertanejo: pct("sertanejo"), samba: pct("samba") });
}

// ───────── Desenho ─────────
const escapar = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");
const svg = (largura, altura, descricao, corpo) =>
  `<svg viewBox="0 0 ${largura} ${altura}" width="${largura}" height="${altura}" role="img"><desc>${escapar(descricao)}</desc>${corpo}</svg>`;

function funil(dados, idioma, L) {
  const itens = [["linhas", dados.limpeza.linhas], ["pares", dados.limpeza.pares], ["faixas", dados.limpeza.faixas]];
  const x = escalaLinear([0, dados.limpeza.linhas], [0, L]);
  const passo = 92;
  const corpo = itens.map(([chave, valor], i) => {
    const y = i * passo;
    return `<text class="valor" x="0" y="${y + 26}" style="font-size:30px;font-weight:800;letter-spacing:-0.03em">${formatar(valor, 0, idioma)}</text>` +
      `<text class="eixo" x="0" y="${y + 46}">${escapar(t("graf.funil." + chave, idioma))}</text>` +
      `<rect x="0" y="${y + 56}" width="${x(valor).toFixed(1)}" height="10" fill="${i === 2 ? "#f2f2f2" : "#6b6b6b"}"/>`;
  }).join("");
  return svg(L, passo * 3 - 14, descreverFunil(dados, idioma), corpo);
}

function contribuicao(dados, idioma, L) {
  const rot = Math.min(150, L * 0.34), area = L - rot - 54, linha = 40;
  const x = escalaLinear([0, 60], [0, area]);
  const corpo = dados.features.map((f, i) => {
    const y = 34 + i * linha, sem = dados.escala.sem_padronizar[i], com = dados.escala.padronizado[i];
    return `<text class="rotulo" x="0" y="${y + 14}">${escapar(t("feature." + f.id, idioma))}</text>` +
      `<rect x="${rot}" y="${y}" width="${Math.max(x(sem), 1).toFixed(1)}" height="9" fill="#6b6b6b"/>` +
      `<text class="eixo" x="${(rot + x(sem) + 6).toFixed(1)}" y="${y + 9}">${formatar(sem, 1, idioma)}</text>` +
      `<rect x="${rot}" y="${y + 12}" width="${Math.max(x(com), 1).toFixed(1)}" height="9" fill="#f2f2f2"/>` +
      `<text class="valor" x="${(rot + x(com) + 6).toFixed(1)}" y="${y + 21}">${formatar(com, 1, idioma)}</text>`;
  }).join("");
  const legenda = `<rect x="${rot}" y="2" width="12" height="9" fill="#6b6b6b"/><text class="eixo" x="${rot + 18}" y="11">${escapar(t("graf.contrib.sem", idioma))}</text>` +
    `<rect x="${rot + 130}" y="2" width="12" height="9" fill="#f2f2f2"/><text class="eixo" x="${rot + 148}" y="11">${escapar(t("graf.contrib.com", idioma))}</text>`;
  return svg(L, 34 + linha * dados.features.length, descreverContribuicao(dados, idioma), legenda + corpo);
}

function graficoK(dados, idioma, L) {
  const ks = dados.k.valores, kEsc = dados.meta.k, mE = 6, mD = 16, altura = 150, vao = 74;
  const x = escalaLinear([1, 10], [mE + 12, L - mD]);
  const painel = (valores, topo, casas, chave) => {
    const validos = valores.filter(v => v != null);
    const y = escalaLinear([Math.min(...validos), Math.max(...validos)], [topo + altura, topo + 14]);
    const pontos = ks.map((k, i) => (valores[i] == null ? null : [x(k), y(valores[i])])).filter(Boolean);
    const escolhido = valores[kEsc - 1];
    return `<text class="rotulo" x="${mE}" y="${topo - 8}">${escapar(t(chave, idioma))}</text>` +
      `<line class="linha-eixo" x1="${mE}" x2="${L - mD}" y1="${topo + altura + 10}" y2="${topo + altura + 10}"/>` +
      `<polyline fill="none" stroke="#f2f2f2" stroke-width="2" points="${pontos.map(p => p.map(v => v.toFixed(1)).join(",")).join(" ")}"/>` +
      pontos.map(p => `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="#0c0c0c" stroke="#f2f2f2" stroke-width="2"/>`).join("") +
      `<circle cx="${x(kEsc).toFixed(1)}" cy="${y(escolhido).toFixed(1)}" r="6.5" fill="#f2f2f2"/>` +
      `<text class="valor" x="${(x(kEsc) + 12).toFixed(1)}" y="${(y(escolhido) - 10).toFixed(1)}">${formatar(escolhido, casas, idioma)}</text>`;
  };
  const base = 30 + altura + vao + altura + 10;
  const eixo = ks.map(k => `<text class="eixo" text-anchor="middle" x="${x(k).toFixed(1)}" y="${base + 20}" ${k === kEsc ? 'style="fill:#f2f2f2;font-weight:700"' : ""}>${k}</text>`).join("") +
    `<text class="eixo" x="${mE}" y="${base + 42}">${escapar(t("graf.k.eixo", idioma))}</text>`;
  const marca = `<line x1="${x(kEsc).toFixed(1)}" x2="${x(kEsc).toFixed(1)}" y1="18" y2="${base}" stroke="#f2f2f2" stroke-width="1" stroke-dasharray="3 5" opacity="0.55"/>`;
  return svg(L, base + 50, descreverK(dados, idioma),
    marca + painel(dados.k.inercias, 30, 0, "graf.k.inercia") + painel(dados.k.silhuetas, 30 + altura + vao, 3, "graf.k.silhueta") + eixo);
}

function mapaDeCalor({ L, linhas, colunas, valor, cor, texto, descricao, rotLinha, separarApos }) {
  const rot = rotLinha, topo = 118, cel = (L - rot) / colunas.length, alt = Math.min(44, Math.max(30, cel * 0.62));
  const cab = colunas.map((c, j) => {
    const cx = rot + j * cel + cel / 2;
    return `<text class="eixo" transform="translate(${cx.toFixed(1)}, ${topo - 10}) rotate(-38)">${escapar(c)}</text>`;
  }).join("");
  const corpo = linhas.map((linha, i) => {
    const y = topo + i * alt + (separarApos != null && i >= separarApos ? 12 : 0);
    const marca = linha.cor ? `<circle cx="6" cy="${y + alt / 2}" r="5" fill="${linha.cor}"/>` : "";
    return marca + `<text class="rotulo" x="${linha.cor ? 18 : 0}" y="${y + alt / 2 + 4}">${escapar(linha.nome)}</text>` +
      colunas.map((_, j) => {
        const v = valor(i, j), fundo = cor(v);
        return `<rect x="${(rot + j * cel + 1).toFixed(1)}" y="${y + 1}" width="${(cel - 2).toFixed(1)}" height="${alt - 2}" fill="${fundo}"/>` +
          `<text class="valor" text-anchor="middle" x="${(rot + j * cel + cel / 2).toFixed(1)}" y="${y + alt / 2 + 4}" style="fill:${corDoTexto(fundo)}">${texto(v)}</text>`;
      }).join("");
  }).join("");
  const sep = separarApos != null
    ? `<line x1="0" x2="${L}" y1="${topo + separarApos * alt + 6}" y2="${topo + separarApos * alt + 6}" stroke="#f2f2f2" stroke-width="1.5"/>` : "";
  return svg(L, topo + linhas.length * alt + (separarApos != null ? 14 : 2), descricao, cab + corpo + sep);
}

function perfis(dados, idioma, L) {
  return mapaDeCalor({
    L, rotLinha: 190, descricao: descreverPerfis(dados, idioma),
    linhas: dados.grupos.map(g => ({ nome: t("grupo." + g.id, idioma), cor: g.cor })),
    colunas: dados.features.map(f => t("feature." + f.id, idioma)),
    valor: (i, j) => dados.grupos[i].centroide_z[j],
    cor: corDivergente,
    texto: v => (Math.abs(v) < 0.05 ? formatar(0, 1, idioma) : (v > 0 ? "+" : "") + formatar(v, 1, idioma)),
  });
}

function generos(dados, idioma, L) {
  return mapaDeCalor({
    L, rotLinha: 86, descricao: descreverGeneros(dados, idioma), separarApos: dados.generos.filter(g => g.br).length,
    linhas: dados.generos.map(g => ({ nome: g.genero })),
    colunas: dados.grupos.map(g => t("grupo." + g.id, idioma)),
    valor: (i, j) => dados.generos[i].pct_int[j],
    cor: corSequencial,
    texto: v => formatar(v, 0, idioma),
  });
}

const GRAFICOS = {
  funil: { desenhar: funil, minimo: 260 },
  contribuicao: { desenhar: contribuicao, minimo: 300, legenda: "graf.contrib.legenda" },
  k: { desenhar: graficoK, minimo: 300 },
  perfis: { desenhar: perfis, minimo: 760, legenda: "graf.perfis.legenda" },
  generos: { desenhar: generos, minimo: 560, legenda: "graf.generos.legenda" },
};

/** Nome curto de cada gráfico, lido por leitores de tela. */
export function tituloDoGrafico(nome, idioma) {
  return t("graf." + nome + ".titulo", idioma);
}

/** Desenha (ou redesenha) todos os gráficos da página no idioma dado. */
export function desenharGraficos(dados, idioma, raiz = document) {
  raiz.querySelectorAll("[data-grafico]").forEach(figura => {
    const g = GRAFICOS[figura.dataset.grafico];
    if (!g) return;
    const disponivel = Math.floor(figura.getBoundingClientRect().width) || g.minimo;
    const largura = Math.max(disponivel, g.minimo);
    const legenda = g.legenda ? `<figcaption>${escapar(t(g.legenda, idioma))}</figcaption>` : "";
    // gráfico mais largo que a coluna (mapas de calor no celular): rola dentro da própria figura
    const titulo = escapar(tituloDoGrafico(figura.dataset.grafico, idioma)).replace(/"/g, "&quot;");
    const desenho = g.desenhar(dados, idioma, largura)
      .replace('role="img">', `role="img" aria-label="${titulo}"><title>${titulo}</title>`);
    const rolavel = largura > disponivel
      ? ` tabindex="0" role="group" aria-label="${escapar(t("graf.rolagem", idioma))}"` : "";
    figura.innerHTML = `<div class="grafico-rolagem"${rolavel}>${desenho}</div>${legenda}`;
  });
}

/** Liga os gráficos: desenha agora e redesenha na troca de idioma e de tamanho. */
export function iniciarGraficos(dados, idiomaAtual) {
  let espera = 0, larguraAnterior = window.innerWidth;
  const desenhar = () => desenharGraficos(dados, idiomaAtual());
  document.addEventListener("idioma", desenhar);
  window.addEventListener("resize", () => {
    if (window.innerWidth === larguraAnterior) return; // no celular, a barra do navegador muda só a altura
    larguraAnterior = window.innerWidth;
    clearTimeout(espera);
    espera = setTimeout(desenhar, 150);
  });
  desenhar();
}
