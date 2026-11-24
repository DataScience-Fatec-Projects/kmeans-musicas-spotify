// Ponto de entrada: carrega os dados exportados do notebook e liga os módulos da página.
import { formatar } from "./formato.js";
import { iniciarIdioma, idiomaAtual } from "./idioma.js";
import { t } from "./textos.js";
import { iniciarAbertura } from "./abertura.js";
import { iniciarEscala } from "./escala.js";
import { iniciarGraficos } from "./graficos.js";
import { iniciarSimuladorPasso } from "./sim-passo.js";
import { iniciarSimuladorGrupo } from "./sim-grupo.js";

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

/** Guarda o número de reserva (em português) que o HTML traz em cada [data-dado]. */
function lerReservas() {
  const reservas = {};
  document.querySelectorAll("[data-dado]").forEach(el => {
    if (el.textContent.trim()) reservas[el.dataset.dado] = el.textContent.trim();
  });
  return reservas;
}

/** Sem o JSON, repõe os números de reserva nos textos que a troca de idioma deixou vazios. */
function preencherReservas(reservas) {
  document.querySelectorAll("[data-dado]").forEach(el => {
    if (!el.textContent.trim() && reservas[el.dataset.dado]) el.textContent = reservas[el.dataset.dado];
  });
}

function aplicarCores(dados) {
  dados.grupos.forEach(g => document.documentElement.style.setProperty("--g" + g.id, g.cor));
}

function avisarSemDados() {
  document.querySelectorAll("[data-grafico], [data-simulador], [data-animacao]").forEach(el => {
    const aviso = document.createElement("p");
    aviso.className = "aviso";
    aviso.dataset.i18n = "aviso.sem_dados";
    aviso.textContent = t("aviso.sem_dados", "pt");
    el.replaceChildren(aviso);
  });
}

async function iniciar() {
  const reservas = lerReservas();
  let dados = null;
  try {
    dados = await carregarDados();
  } catch (erro) {
    console.error(erro);
    avisarSemDados();
  }
  // A cada troca de idioma, os números voltam a ser escritos no formato certo.
  document.addEventListener("idioma", () => {
    if (dados) preencherDados(dados, idiomaAtual());
    else preencherReservas(reservas);
  });
  if (dados) aplicarCores(dados);
  iniciarIdioma();
  if (!dados) return;
  iniciarAbertura(document.getElementById("abertura"), dados);
  iniciarGraficos(dados, idiomaAtual);
  iniciarEscala(document.querySelector(".escala-palco"), dados);
  iniciarSimuladorPasso(document.querySelector('[data-simulador="passo"]'), dados);
  iniciarSimuladorGrupo(document.querySelector('[data-simulador="grupo"]'), dados);
}

iniciar();
