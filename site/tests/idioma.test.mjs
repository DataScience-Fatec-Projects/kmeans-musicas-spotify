import test from "node:test";
import assert from "node:assert/strict";
import { ler } from "./apoio.mjs";
import { escolherIdioma } from "../js/idioma.js";
import { TEXTOS, t } from "../js/textos.js";

const html = ler("index.html");
// Conteúdo de cada elemento traduzível do HTML: chave -> HTML interno em português.
const noHtml = new Map();
for (const m of html.matchAll(/<(\w+)\b[^>]*\bdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) noHtml.set(m[2], m[3]);
const dadosDe = texto => [...texto.matchAll(/data-dado="([^"]+)"/g)].map(m => m[1]).sort();

test("ordem de escolha: endereço, depois o salvo, depois o navegador", () => {
  assert.equal(escolherIdioma({ consulta: "?lang=en", salvo: "pt", navegador: "pt-BR" }), "en");
  assert.equal(escolherIdioma({ consulta: "?lang=pt", salvo: "en", navegador: "en-US" }), "pt");
  assert.equal(escolherIdioma({ consulta: "", salvo: "en", navegador: "pt-BR" }), "en");
  assert.equal(escolherIdioma({ consulta: "", salvo: null, navegador: "pt-BR" }), "pt");
  assert.equal(escolherIdioma({ consulta: "", salvo: null, navegador: "de-DE" }), "en");
  assert.equal(escolherIdioma({ consulta: "?lang=xx", salvo: "zz", navegador: "pt-PT" }), "pt");
});
test("o HTML tem textos traduzíveis", () => assert.ok(noHtml.size >= 55, "só " + noHtml.size));
test("toda chave data-i18n do HTML existe em inglês e não está vazia", () => {
  for (const chave of noHtml.keys()) assert.ok((TEXTOS.en[chave] || "").trim().length > 1, "sem inglês: " + chave);
});
test("a tradução mantém os mesmos números ligados aos dados", () => {
  for (const [chave, pt] of noHtml) assert.deepEqual(dadosDe(TEXTOS.en[chave]), dadosDe(pt), "data-dado diferente em " + chave);
});
test("textos dinâmicos existem nos dois idiomas", () => {
  for (const chave of Object.keys(TEXTOS.pt)) assert.ok(chave in TEXTOS.en, "sem inglês: " + chave);
  for (const chave of Object.keys(TEXTOS.en)) assert.ok(chave in TEXTOS.pt || noHtml.has(chave), "chave órfã em inglês: " + chave);
});
test("os 7 grupos e as 9 características têm nome nos dois idiomas", () => {
  for (const idioma of ["pt", "en"]) {
    for (let g = 0; g < 7; g++) assert.ok(t("grupo." + g, idioma).length > 2);
    for (const f of ["danceability", "energy", "loudness", "speechiness", "acousticness", "instrumentalness", "liveness", "valence", "tempo"])
      assert.ok(t("feature." + f, idioma).length > 2);
  }
});
test("t() troca variáveis e recusa chave inexistente", () => {
  assert.equal(t("grupo.6", "en"), "Live");
  assert.match(t("graf.k.desc", "pt", { k: "7", silhueta: "0,196" }), /7.*0,196/);
  assert.throws(() => t("nao.existe", "pt"));
});
