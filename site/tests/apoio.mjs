// Apoio dos testes: lê os arquivos do site direto do disco.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const raizSite = fileURLToPath(new URL("..", import.meta.url));
export const ler = caminho => readFileSync(raizSite + caminho, "utf8");
export const dados = JSON.parse(ler("dados/aula.json"));
