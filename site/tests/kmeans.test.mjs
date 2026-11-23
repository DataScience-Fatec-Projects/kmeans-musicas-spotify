import test from "node:test";
import assert from "node:assert/strict";
import { dados } from "./apoio.mjs";
import { criarSorteador, inicializar, atribuir, atualizar, inercia, rodarAteConvergir, prever } from "../js/kmeans.js";

const pontos = dados.simulador_passo.pontos;
const g = dados.simulador_grupo;

test("o mesmo sorteio gera sempre os mesmos números", () => {
  const a = criarSorteador(7), b = criarSorteador(7);
  assert.deepEqual([a(), a(), a()], [b(), b(), b()]);
});
test("inicializar escolhe k pontos distintos dos dados", () => {
  const c = inicializar(pontos, 3, 1);
  assert.equal(c.length, 3);
  assert.equal(new Set(c.map(String)).size, 3);
  assert.ok(c.every(ci => pontos.some(p => p[0] === ci[0] && p[1] === ci[1])));
});
test("sorteios 0, 1 e 2 chegam ao ótimo e o 3 para num mínimo local (k = 3)", () => {
  for (const s of [0, 1, 2]) assert.equal(rodarAteConvergir(pontos, 3, s).inercia.toFixed(1), "1718.2");
  const r = rodarAteConvergir(pontos, 3, 3);
  assert.equal(r.inercia.toFixed(1), "3878.5");
  assert.equal(r.iteracoes, 7);
});
test("atribuir e atualizar nunca aumentam a inércia", () => {
  let c = inicializar(pontos, 4, 5), anterior = Infinity;
  for (let i = 0; i < 6; i++) {
    const r = atribuir(pontos, c);
    const depoisDeAtribuir = inercia(pontos, r, c);
    assert.ok(depoisDeAtribuir <= anterior + 1e-9);
    c = atualizar(pontos, r, c).centroides;
    anterior = inercia(pontos, r, c);
    assert.ok(anterior <= depoisDeAtribuir + 1e-9);
  }
});
test("grupo vazio mantém o centroide", () => {
  const r = atualizar([[0, 0], [1, 1]], [0, 0], [[0, 0], [99, 99]]);
  assert.deepEqual(r.centroides, [[0.5, 0.5], [99, 99]]);
});
test("a música média cai em Dançante e alegre, quase empatada com Intenso e pesado", () => {
  const r = prever(g.media, g.media, g.escala, g.centroides);
  assert.equal(r.grupo, 0);
  assert.equal(r.distancias[0].toFixed(2), "1.44");
  assert.equal(r.distancias[4].toFixed(2), "1.55");
  assert.ok(r.z.every(v => Math.abs(v) < 1e-9));
});
test("cada faixa de exemplo cai no próprio grupo", () => {
  g.exemplos.forEach((ex, i) => assert.equal(prever(ex.valores, g.media, g.escala, g.centroides).grupo, i));
});
