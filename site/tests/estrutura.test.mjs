import test from "node:test";
import assert from "node:assert/strict";
import { dados, ler } from "./apoio.mjs";

const html = ler("index.html");
const css = ler("css/base.css") + ler("css/secoes.css");
const atributos = nome => [...html.matchAll(new RegExp(nome + '="([^"]+)"', "g"))].map(m => m[1]);

test("tem as 9 seções", () => {
  for (const id of ["abertura", "dados", "escala", "quantos", "grupos", "brasil", "simuladores", "limites", "contato"])
    assert.match(html, new RegExp('id="' + id + '"'), "falta a seção " + id);
});
test("tem os 5 gráficos e os 2 simuladores", () => {
  assert.deepEqual(atributos("data-grafico").sort(), ["contribuicao", "funil", "generos", "k", "perfis"]);
  assert.deepEqual(atributos("data-simulador").sort(), ["grupo", "passo"]);
});
test("nenhum recurso é carregado de outro domínio", () => {
  assert.doesNotMatch(html, /<(script|link|img|source)[^>]+(src|href)="https?:/);
  assert.doesNotMatch(css, /url\(["']?https?:/);
  assert.doesNotMatch(css, /@import/);
});
test("todo caminho local é relativo", () => assert.doesNotMatch(html, /(src|href)="\//));
test("todo data-dado aponta para um campo numérico que existe no aula.json", () => {
  const caminhos = atributos("data-dado");
  assert.ok(caminhos.length >= 10, "poucos números ligados aos dados");
  for (const caminho of caminhos) {
    const valor = caminho.split(".").reduce((o, k) => (o == null ? o : o[k]), dados);
    assert.equal(typeof valor, "number", "data-dado inválido: " + caminho);
  }
});
test("a página declara o idioma e tem título e descrição", () => {
  assert.match(html, /<html lang="pt-BR"/);
  assert.match(html, /<title>[^<]{10,}<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{40,}"/);
});
