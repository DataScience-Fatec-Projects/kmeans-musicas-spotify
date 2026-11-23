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
  assert.match(html, /<title[^>]*>[^<]{10,}<\/title>/);
  assert.match(html, /<meta name="description" content="[^"]{40,}"/);
});
test("o seletor de idioma fica fora da navegação rolável, para estar sempre visível", () => {
  const nav = html.match(/<nav[\s\S]*?<\/nav>/)[0];
  assert.doesNotMatch(nav, /data-idioma/);
  assert.match(html, /data-idioma="en"/);
});
test("sem JavaScript, cada gráfico mostra um aviso em vez de ficar em branco", () => {
  for (const m of html.matchAll(/<figure[^>]*data-grafico="(\w+)"[^>]*>([\s\S]*?)<\/figure>/g))
    assert.match(m[2], /class="aviso"/, "figura vazia: " + m[1]);
});
test("a abertura só fica alta (trecho preso) quando o script a anima", () => {
  assert.doesNotMatch(css, /\.abertura \{[^}]*height: 340vh/);
  assert.match(css, /\.abertura\.animada \{[^}]*height: 340vh/);
});
test("os links 'ver na aula' apontam para células que existem no notebook", () => {
  const nb = JSON.parse(ler("../notebooks/aula_kmeans_spotify.ipynb"));
  const ids = new Set(nb.cells.map(c => c.id));
  const ancoras = [...html.matchAll(/ipynb#scrollTo=([\w-]+)"/g)].map(m => m[1]);
  assert.equal(ancoras.length, 7);
  for (const id of ancoras) assert.ok(ids.has(id), "célula inexistente: " + id);
});
test("tem favicon e metadados para a prévia do link", () => {
  assert.match(html, /<link rel="icon" href="favicon\.svg"/);
  for (const p of ["og:title", "og:description", "og:image", "og:url", "og:type"])
    assert.match(html, new RegExp('<meta property="' + p + '" content="[^"]+"'), p);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image"/);
});
test("porcentagens mostradas sem casas decimais usam o inteiro já arredondado pelo notebook", () => {
  for (const m of html.matchAll(/data-dado="((?:generos|ao_vivo)\.[^"]+)" data-casas="0"/g))
    assert.match(m[1], /_int/, "use o campo _int: " + m[1]);
});
