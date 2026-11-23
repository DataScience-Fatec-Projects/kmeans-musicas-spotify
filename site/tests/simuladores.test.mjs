import test from "node:test";
import assert from "node:assert/strict";
import { dados } from "./apoio.mjs";
import { criarEstadoPasso } from "../js/sim-passo.js";
import { TEXTOS } from "../js/textos.js";

const pontos = dados.simulador_passo.pontos;
const convergir = e => { while (e.fase !== "convergiu") { e.atribuir(); e.atualizar(); } };

test("fases do passo a passo, do início à convergência (sorteio 3: mínimo local)", () => {
  const e = criarEstadoPasso(pontos, 3, 3);
  assert.equal(e.fase, "vazio");
  assert.equal(e.inercia, null);
  e.inicializar();
  assert.equal(e.fase, "inicializado");
  assert.equal(e.centroides.length, 3);
  e.atribuir();
  assert.equal(e.fase, "atribuido");
  assert.equal(e.iteracao, 1);
  e.atualizar();
  assert.equal(e.fase, "atualizado");
  convergir(e);
  assert.equal(e.inercia.toFixed(1), "3878.5");
  assert.equal(e.iteracao, 7);
});
test("sorteio 1 chega à inércia ótima", () => {
  const e = criarEstadoPasso(pontos, 3, 1);
  e.inicializar(); convergir(e);
  assert.equal(e.inercia.toFixed(1), "1718.2");
});
test("a inércia nunca sobe de um passo para o outro", () => {
  for (let s = 0; s < 8; s++) {
    const e = criarEstadoPasso(pontos, 4, s);
    e.inicializar();
    let anterior = Infinity;
    while (e.fase !== "convergiu") {
      e.atribuir(); assert.ok(e.inercia <= anterior + 1e-9); anterior = e.inercia;
      e.atualizar(); assert.ok(e.inercia <= anterior + 1e-9); anterior = e.inercia;
    }
  }
});
test("acrescentar um ponto volta para a fase inicializado e apaga os rótulos", () => {
  const e = criarEstadoPasso(pontos, 3, 1);
  e.inicializar(); e.atribuir();
  e.acrescentarPonto([0, 0]);
  assert.equal(e.pontos.length, 151);
  assert.equal(e.fase, "inicializado");
  assert.equal(e.rotulos, null);
  assert.equal(pontos.length, 150, "os pontos originais não podem ser alterados");
});
test("com menos pontos que grupos, inicializar não faz nada", () => {
  const e = criarEstadoPasso([[0, 0], [1, 1]], 3, 1);
  assert.equal(e.inicializar(), false);
  assert.equal(e.fase, "vazio");
});
test("fora de ordem, atribuir e atualizar não quebram", () => {
  const e = criarEstadoPasso(pontos, 3, 1);
  e.atribuir(); e.atualizar();
  assert.equal(e.fase, "vazio");
  assert.equal(e.iteracao, 0);
});
test("toda mensagem dos simuladores existe nos dois idiomas", () => {
  const chaves = Object.keys(TEXTOS.pt).filter(k => k.startsWith("simp.") || k.startsWith("simg."));
  assert.ok(chaves.length >= 20, "poucas chaves: " + chaves.length);
  for (const k of chaves) assert.ok(TEXTOS.en[k], "sem inglês: " + k);
});
test("as mensagens guardam números crus, para serem formatados no idioma da hora", async () => {
  const fonte = (await import("node:fs")).readFileSync(new URL("../js/sim-passo.js", import.meta.url), "utf8");
  assert.doesNotMatch(fonte, /dizer\([^)]*formatar\(/);
});
test("dá para acrescentar um ponto sem mouse: ponto ao acaso, dentro dos limites", () => {
  const e = criarEstadoPasso(pontos, 3, 1);
  const lim = { x0: -10, x1: 10, y0: -5, y1: 5 };
  e.acrescentarPontoAoAcaso(lim);
  e.acrescentarPontoAoAcaso(lim);
  assert.equal(e.pontos.length, 152);
  const [a, b] = e.pontos.slice(-2);
  assert.ok(a[0] >= -10 && a[0] <= 10 && a[1] >= -5 && a[1] <= 5);
  assert.notDeepEqual(a, b);
});
