import test from "node:test";
import assert from "node:assert/strict";
import { dados } from "./apoio.mjs";
import { progressoDoScroll, criarEspalhados, normalizarPontos, posicaoDoPonto } from "../js/abertura.js";

test("progresso do scroll vai de 0 a 1 ao longo do trecho preso", () => {
  const altura = 3400, janela = 1000;
  assert.equal(progressoDoScroll(120, altura, janela), 0);            // ainda não chegou ao topo
  assert.equal(progressoDoScroll(0, altura, janela), 0);
  assert.equal(progressoDoScroll(-1200, altura, janela), 0.5);        // metade dos 2400 px de curso
  assert.equal(progressoDoScroll(-2400, altura, janela), 1);
  assert.equal(progressoDoScroll(-5000, altura, janela), 1);          // já passou
});
test("trecho sem curso de rolagem (animações desativadas) fica no estado final", () => {
  assert.equal(progressoDoScroll(0, 900, 900), 1);
});
test("o estado espalhado é sempre o mesmo", () => {
  assert.deepEqual(criarEspalhados(50), criarEspalhados(50));
  const e = criarEspalhados(200);
  assert.ok(e.x.every(v => v >= 0 && v <= 1) && e.y.every(v => v >= 0 && v <= 1));
});
test("pontos normalizados cabem no quadrado unitário e mantêm a proporção", () => {
  const n = normalizarPontos(dados.pontos, dados.grupos.map(g => g.pca));
  assert.equal(n.x.length, 6000);
  assert.ok(Math.min(...n.x) >= 0 && Math.max(...n.x) <= 1 && Math.min(...n.y) >= 0 && Math.max(...n.y) <= 1);
  assert.equal(n.centroides.length, 7);
  assert.ok(n.proporcao > 0);
});
test("cada ponto sai da posição espalhada e chega à posição real", () => {
  const destino = { x: [0.9, 0.1], y: [0.2, 0.8] };
  const espalhados = { x: [0.3, 0.6], y: [0.5, 0.4], atraso: [0, 1] };
  assert.deepEqual(posicaoDoPonto(0, 0, destino, espalhados), [0.3, 0.5]);
  assert.deepEqual(posicaoDoPonto(1, 0, destino, espalhados), [0.6, 0.4]);
  assert.deepEqual(posicaoDoPonto(0, 1, destino, espalhados), [0.9, 0.2]);
  assert.deepEqual(posicaoDoPonto(1, 1, destino, espalhados), [0.1, 0.8]);
  const [x] = posicaoDoPonto(0, 0.5, destino, espalhados);
  assert.ok(x > 0.3 && x < 0.9);
});
