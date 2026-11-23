import test from "node:test";
import assert from "node:assert/strict";
import { formatar } from "../js/formato.js";

test("formata inteiros por idioma", () => {
  assert.equal(formatar(89583, 0, "pt"), "89.583");
  assert.equal(formatar(89583, 0, "en"), "89,583");
});
test("formata decimais por idioma", () => {
  assert.equal(formatar(0.196, 3, "pt"), "0,196");
  assert.equal(formatar(0.196, 3, "en"), "0.196");
});
test("usa o sinal de menos tipográfico", () => {
  assert.equal(formatar(-8.5, 1, "pt"), "−8,5");
  assert.equal(formatar(-8.5, 1, "en"), "−8.5");
});
test("arredonda meios para o par, como o Python do notebook (34,5 → 34; 31,5 → 32)", () => {
  assert.equal(formatar(34.5, 0, "pt"), "34");
  assert.equal(formatar(31.5, 0, "pt"), "32");
  assert.equal(formatar(0.5, 0, "en"), "0");
});
