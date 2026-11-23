// Simulador "Em que grupo cairia a sua música?": o mesmo da aula (notebook, V.2), no visual
// da página. A conta é a do modelo: padronizar e achar o centro mais próximo.
import { prever } from "./kmeans.js";
import { formatar } from "./formato.js";
import { t } from "./textos.js";
import { idiomaAtual } from "./idioma.js";

/** Monta o simulador dentro do elemento e liga os controles. */
export function iniciarSimuladorGrupo(elemento, dados) {
  const D = dados.simulador_grupo;
  const ids = dados.features.map(f => f.id);

  elemento.innerHTML = `
    <label class="sim-comecar"><span data-t="simg.comecar"></span><select data-id="exemplo"></select></label>
    <div class="sim-grade">
      <div class="sim-deslizantes" data-id="controles"></div>
      <div class="sim-resultado">
        <div class="sim-grupo" data-id="cartao" aria-live="polite">
          <span class="sim-rotulo" data-t="simg.mais_proximo"></span>
          <b data-id="nome"></b>
          <span class="sim-rotulo" data-id="detalhe"></span>
        </div>
        <div>
          <p class="sim-legenda" data-t="simg.distancias"></p>
          <div data-id="barras"></div>
        </div>
        <div>
          <p class="sim-legenda" data-t="simg.padronizada"></p>
          <div class="sim-chips" data-id="chips"></div>
        </div>
      </div>
    </div>`;
  const el = id => elemento.querySelector('[data-id="' + id + '"]');

  const controles = D.features.map((f, i) => {
    const linha = document.createElement("label");
    linha.className = "sim-deslizante";
    linha.innerHTML = `<span class="sim-nome"></span><input type="range" min="${f.min}" max="${f.max}" step="${f.passo}"><span class="sim-valor"></span>`;
    el("controles").appendChild(linha);
    const entrada = linha.querySelector("input");
    entrada.addEventListener("input", calcular);
    return { entrada, nome: linha.querySelector(".sim-nome"), valor: linha.querySelector(".sim-valor"), f, id: ids[i] };
  });

  const sel = el("exemplo");
  sel.add(new Option("", "media"));
  D.exemplos.forEach((ex, i) => sel.add(new Option(ex.rotulo.replace(/ · cluster \d+$/, ""), String(i))));
  sel.onchange = () => carregar(sel.value === "media" ? D.media : D.exemplos[Number(sel.value)].valores);

  function carregar(valores) {
    controles.forEach((c, i) => { c.entrada.value = valores[i]; });
    calcular();
  }

  function calcular() {
    const idioma = idiomaAtual();
    const x = controles.map(c => Number(c.entrada.value));
    const { grupo, distancias, z } = prever(x, D.media, D.escala, D.centroides);

    elemento.querySelectorAll("[data-t]").forEach(n => { n.textContent = t(n.dataset.t, idioma); });
    sel.options[0].textContent = t("simg.media", idioma);
    controles.forEach((c, i) => {
      c.nome.textContent = t("feature." + c.id, idioma);
      c.valor.textContent = formatar(x[i], c.f.casas, idioma) + (c.f.unidade ? " " + c.f.unidade : "");
    });
    el("nome").textContent = t("grupo." + grupo, idioma);
    el("detalhe").textContent = t("simg.detalhe", idioma, { n: grupo, d: formatar(distancias[grupo], 2, idioma) });
    el("cartao").style.setProperty("--cor", D.cores[grupo]);

    const maior = Math.max(...distancias);
    el("barras").innerHTML = distancias.map((d, j) =>
      `<div class="sim-barra${j === grupo ? " perto" : ""}"><span>${t("grupo." + j, idioma).replace(/&/g, "&amp;")}</span>` +
      `<i><i style="width:${(100 * d / maior).toFixed(1)}%;background:${D.cores[j]}"></i></i>` +
      `<span class="sim-num">${formatar(d, 2, idioma)}</span></div>`).join("");

    el("chips").innerHTML = z.map((v, i) => {
      const r = Math.round(v * 10) / 10, forte = Math.min(Math.abs(v) / 3, 1);
      const cor = r === 0 ? "transparent" : (v > 0 ? `rgba(226,82,74,${0.2 + 0.6 * forte})` : `rgba(66,146,222,${0.2 + 0.6 * forte})`);
      const texto = r === 0 ? formatar(0, 1, idioma) : (r > 0 ? "+" : "") + formatar(r, 1, idioma);
      return `<span class="sim-chip" style="background:${cor}">${t("feature." + controles[i].id, idioma)} ${texto}</span>`;
    }).join("");
  }

  document.addEventListener("idioma", calcular); // troca os textos sem mexer nos controles
  carregar(D.media);
}
