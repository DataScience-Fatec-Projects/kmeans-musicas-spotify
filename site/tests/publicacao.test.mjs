import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { raizSite, ler } from "./apoio.mjs";

function arquivos(pasta) {
  return readdirSync(pasta).flatMap(nome => {
    const caminho = pasta + "/" + nome;
    if (nome === "tests" || nome.startsWith(".")) return [];
    return statSync(caminho).isDirectory() ? arquivos(caminho) : [caminho];
  });
}

test("nenhuma pendência vai para o ar", () => {
  for (const arquivo of arquivos(raizSite.replace(/[\/]$/, ""))) {
    if (!/\.(html|css|js|json|md)$/.test(arquivo)) continue;
    assert.doesNotMatch(readFileSync(arquivo, "utf8"), /PENDENTE/, "pendência em " + arquivo);
  }
});
test("todo arquivo que o HTML referencia existe", () => {
  const html = ler("index.html");
  for (const m of html.matchAll(/(?:src|href)="((?:css|js|fonts|dados)\/[^"]+)"/g))
    assert.ok(statSync(raizSite + m[1]).isFile(), "não existe: " + m[1]);
});
test("o rodapé tem a aula, o repositório e o GitHub do autor", () => {
  const html = ler("index.html");
  assert.match(html, /colab\.research\.google\.com\/github\/DataScience-Fatec-Projects\/kmeans-musicas-spotify/);
  assert.match(html, /href="https:\/\/github\.com\/WellingtonTorres"/);
  assert.match(html, /Maharshi Pandya/);
});
