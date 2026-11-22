// Ponto de entrada: carrega os dados exportados do notebook e liga os módulos da página.
import { formatar } from "./formato.js";
import { iniciarIdioma, idiomaAtual } from "./idioma.js";
import { t } from "./textos.js";
import { iniciarAbertura } from "./abertura.js";

/** Busca o aula.json (caminho relativo: a página fica numa subpasta do domínio). */
export async function carregarDados() {
  const resposta = await fetch("dados/aula.json");
  if (!resposta.ok) throw new Error("aula.json: HTTP " + resposta.status);
  return resposta.json();
}

/** Lê um campo do JSON a partir de um caminho como "grupos.3.pct". */
export function campo(dados, caminho) {
  return caminho.split(".").reduce((o, k) => (o == null ? o : o[k]), dados);
}

/** Escreve em cada [data-dado] o número do JSON, no formato do idioma. */
export function preencherDados(dados, idioma, raiz = document) {
  raiz.querySelectorAll("[data-dado]").forEach(el => {
    const valor = campo(dados, el.dataset.dado);
    if (typeof valor === "number") el.textContent = formatar(valor, Number(el.dataset.casas || 0), idioma);
  });
}

function aplicarCores(dados) {
  dados.grupos.forEach(g => document.documentElement.style.setProperty("--g" + g.id, g.cor));
}

function avisarSemDados() {
  document.documentElement.classList.add("sem-dados");
  document.querySelectorAll("[data-grafico], [data-simulador]").forEach(el => {
    const aviso = document.createElement("p");
    aviso.className = "aviso";
    aviso.dataset.i18n = "aviso.sem_dados";
    aviso.textContent = t("aviso.sem_dados", "pt");
    el.replaceChildren(aviso);
  });
}

async function iniciar() {
  let dados = null;
  try {
    dados = await carregarDados();
  } catch (erro) {
    console.error(erro);
    avisarSemDados();
  }
  // A cada troca de idioma, os números voltam a ser escritos no formato certo.
  document.addEventListener("idioma", () => { if (dados) preencherDados(dados, idiomaAtual()); });
  if (dados) aplicarCores(dados);
  iniciarIdioma();
  if (dados) iniciarAbertura(document.getElementById("abertura"), dados);
}

iniciar();
