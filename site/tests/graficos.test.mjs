import test from "node:test";
import assert from "node:assert/strict";
import { dados } from "./apoio.mjs";
import { escalaLinear, descreverFunil, descreverContribuicao, descreverK, descreverPerfis, descreverGeneros, corDivergente, corSequencial, corDoTexto } from "../js/graficos.js";

test("escala linear", () => {
  const e = escalaLinear([0, 10], [0, 100]);
  assert.equal(e(2.5), 25);
  assert.equal(escalaLinear([10, 0], [0, 100])(2.5), 75);
});
test("descrição do funil traz os três números, no formato do idioma", () => {
  const pt = descreverFunil(dados, "pt");
  for (const n of ["114.000", "113.392", "89.583"]) assert.ok(pt.includes(n), n);
  assert.ok(descreverFunil(dados, "en").includes("89,583"));
});
test("descrição da contribuição cita volume e andamento sem padronizar", () => {
  const pt = descreverContribuicao(dados, "pt");
  assert.ok(pt.includes("50,0") && pt.includes("49,4"));
});
test("descrição do gráfico de k cita o k escolhido e a silhueta", () => {
  assert.match(descreverK(dados, "pt"), /k = 7.*0,196/);
  assert.match(descreverK(dados, "en"), /k = 7.*0\.196/);
});
test("descrição dos perfis cita o maior valor: fala no grupo Fala e comédia", () => {
  const pt = descreverPerfis(dados, "pt");
  assert.ok(pt.includes("Fala e comédia") && pt.includes("presença de fala") && pt.includes("6,7"));
  assert.ok(descreverPerfis(dados, "en").includes("Speech & comedy"));
});
test("descrição dos gêneros cita pagode, sertanejo e samba no grupo Ao vivo", () => {
  const pt = descreverGeneros(dados, "pt");
  assert.match(pt, /Ao vivo.*pagode 50.*sertanejo 44.*samba 42/);
});
test("cores dos mapas de calor sempre deixam o texto legível (contraste AA)", () => {
  const luminancia = ([r, g, b]) => [r, g, b].map(v => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
  const contraste = (a, b) => { const [x, y] = [luminancia(a), luminancia(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  const rgb = cor => cor.match(/\d+/g).map(Number);
  for (let v = -3; v <= 7; v += 0.25) assert.ok(contraste(rgb(corDivergente(v)), rgb(corDoTexto(corDivergente(v)))) >= 4.5, "divergente " + v);
  for (let v = 0; v <= 100; v += 5) assert.ok(contraste(rgb(corSequencial(v)), rgb(corDoTexto(corSequencial(v)))) >= 4.5, "sequencial " + v);
});
test("cada gráfico tem um nome acessível nos dois idiomas", async () => {
  const { tituloDoGrafico } = await import("../js/graficos.js");
  for (const nome of ["funil", "contribuicao", "k", "perfis", "generos"]) {
    assert.ok(tituloDoGrafico(nome, "pt").length > 8);
    assert.notEqual(tituloDoGrafico(nome, "pt"), tituloDoGrafico(nome, "en"));
  }
});
