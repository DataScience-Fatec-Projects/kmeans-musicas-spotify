import test from "node:test";
import assert from "node:assert/strict";
import { dados } from "./apoio.mjs";
import { prepararEscala, posicaoEscala, partesDaDistancia, misturaDoProgresso, opacidades } from "../js/escala.js";

const prep = prepararEscala(dados.escala_anim);
const area = { x: 0, y: 0, lado: 400 };
const nuvem = e => prep.bruto.map((p, i) => posicaoEscala(p, prep.z[i], prep, e, area));
const largura = pts => { const x = pts.map(p => p[0]); return Math.max(...x) - Math.min(...x); };
const altura = pts => { const y = pts.map(p => p[1]); return Math.max(...y) - Math.min(...y); };

test("padroniza com a média e o desvio do scaler da aula", () => {
  const [md, mt] = dados.escala_anim.media, [sd, st] = dados.escala_anim.desvio;
  assert.deepEqual(prep.a.z, [(dados.escala_anim.a[0] - md) / sd, (dados.escala_anim.a[1] - mt) / st]);
  assert.equal(prep.bruto.length, 600);
});
test("sem padronizar, a nuvem é uma linha vertical; padronizada, se abre", () => {
  const bruta = nuvem(0), padronizada = nuvem(1);
  assert.ok(largura(bruta) < altura(bruta) / 50, "a nuvem original deveria ser uma linha");
  assert.ok(largura(padronizada) > altura(padronizada) * 0.6, "a nuvem padronizada deveria ser arredondada");
});
test("todos os pontos ficam dentro da área nos dois estados", () => {
  for (const e of [0, 0.5, 1])
    for (const [x, y] of nuvem(e)) assert.ok(x >= 0 && x <= area.lado && y >= 0 && y <= area.lado, `fora da área em e = ${e}`);
});
test("a parte de cada característica na distância bate com a figura da aula (III.5)", () => {
  assert.equal(partesDaDistancia(prep, 0).andamento.toFixed(1), "99.9");
  assert.equal(partesDaDistancia(prep, 1).danca.toFixed(1), "94.5");
  const meio = partesDaDistancia(prep, 0.5);
  assert.ok(Math.abs(meio.danca + meio.andamento - 100) < 1e-9);
});
test("o progresso do scroll vira a mistura dos dois estados, com folga nas pontas", () => {
  assert.equal(misturaDoProgresso(0), 0);
  assert.equal(misturaDoProgresso(0.1), 0);
  assert.equal(misturaDoProgresso(0.5), 0.5);
  assert.equal(misturaDoProgresso(0.9), 1);
  assert.equal(misturaDoProgresso(0.4, true), 0);  // sem movimento: só troca de estado, sem transição
  assert.equal(misturaDoProgresso(0.6, true), 1);
});
test("os rótulos dos dois estados nunca aparecem juntos", () => {
  for (const e of [0, 0.25, 0.5, 0.75, 1]) { const [a, b] = opacidades(e); assert.ok(a === 0 || b === 0, `sobreposição em e = ${e}`); }
  assert.deepEqual(opacidades(0), [1, 0]);
  assert.deepEqual(opacidades(1), [0, 1]);
});
