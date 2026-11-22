// Idioma da página: escolha, troca e persistência. O português é o que está no HTML.
import { TEXTOS } from "./textos.js";

const IDIOMAS = ["pt", "en"];
const CHAVE = "kmeans-idioma";
const originais = new WeakMap(); // elemento -> HTML em português, lido do próprio HTML
let atual = "pt";

/** Decide o idioma: endereço (?lang=), depois o salvo, depois o do navegador. */
export function escolherIdioma({ consulta, salvo, navegador }) {
  const doEndereco = new URLSearchParams(consulta || "").get("lang");
  if (IDIOMAS.includes(doEndereco)) return doEndereco;
  if (IDIOMAS.includes(salvo)) return salvo;
  return (navegador || "").toLowerCase().startsWith("pt") ? "pt" : "en";
}

export function idiomaAtual() {
  return atual;
}

function lerSalvo() {
  try { return localStorage.getItem(CHAVE); } catch { return null; }
}

/** Troca todos os textos traduzíveis e avisa os outros módulos pelo evento "idioma". */
export function aplicarIdioma(idioma, raiz = document) {
  atual = IDIOMAS.includes(idioma) ? idioma : "pt";
  raiz.querySelectorAll("[data-i18n]").forEach(el => {
    if (!originais.has(el)) originais.set(el, el.innerHTML);
    const traducao = atual === "pt" ? originais.get(el) : TEXTOS.en[el.dataset.i18n];
    if (traducao != null && el.innerHTML !== traducao) el.innerHTML = traducao;
  });
  const descricao = document.querySelector('meta[name="description"]');
  if (descricao) descricao.setAttribute("content", TEXTOS[atual]["meta.descricao"]);
  document.documentElement.lang = atual === "pt" ? "pt-BR" : "en";
  document.querySelectorAll("[data-idioma]").forEach(botao =>
    botao.setAttribute("aria-pressed", String(botao.dataset.idioma === atual)));
  try { localStorage.setItem(CHAVE, atual); } catch { /* navegação privada: segue sem salvar */ }
  document.dispatchEvent(new CustomEvent("idioma", { detail: { idioma: atual } }));
}

/** Escolhe o idioma inicial e liga os botões PT / EN. */
export function iniciarIdioma() {
  document.querySelectorAll("[data-idioma]").forEach(botao =>
    botao.addEventListener("click", () => aplicarIdioma(botao.dataset.idioma)));
  aplicarIdioma(escolherIdioma({ consulta: location.search, salvo: lerSalvo(), navegador: navigator.language }));
}
