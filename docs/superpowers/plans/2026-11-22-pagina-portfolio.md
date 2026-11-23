# Página de portfólio (GitHub Pages) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publicar no GitHub Pages uma página única, em português e inglês, que apresenta o projeto K-Means a recrutadores, com os dados vindos do notebook.

**Architecture:** Arquivos estáticos em `site/` (HTML, CSS e módulos JavaScript, sem build). Um script Python executa o notebook e exporta `site/dados/aula.json`; a página lê esse arquivo e desenha a abertura (canvas), os gráficos (SVG) e os dois simuladores. A lógica pura (K-Means, previsão, idioma, formatação) fica em módulos sem DOM, testados com `node --test`.

**Tech Stack:** HTML5, CSS, JavaScript (módulos ES, sem bibliotecas), Python 3.12 (`nbclient`, `pytest`), Node 22 só para testes, GitHub Actions + GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-22-pagina-portfolio-design.md`

## Global Constraints

- Nenhuma dependência externa em tempo de execução: nenhum CDN, nenhuma biblioteca de terceiros, nenhuma fonte de outro domínio.
- Todos os caminhos dentro de `site/` são **relativos** (a página fica em `/kmeans-musicas-spotify/`).
- Todo número e todo gráfico vem de `site/dados/aula.json`. É proibido digitar número de resultado no HTML ou no JavaScript, e o exportador só exporta valores que o notebook já calcula.
- Idiomas: português (padrão, presente no HTML e visível sem JavaScript) e inglês. Números seguem o idioma (`89.583` / `0,196` em pt; `89,583` / `0.196` em en). Nomes de músicas, artistas e gêneros não são traduzidos.
- Cores: preto, branco, cinzas e as 7 cores dos grupos vindas do JSON (`tab10` do notebook).
- `prefers-reduced-motion`: nada se move e os pontos já aparecem agrupados.
- Largura mínima suportada: 360 px. Contraste AA.
- Nada em `notebooks/`, `scripts/validar_notebook.py` ou `.github/workflows/notebook.yml` é alterado.
- Calendário: o trabalho fica na branch `portfolio` (criada a partir de `portfolio-design`). O merge na `main` e a publicação só acontecem **a partir de 25/11/2026**.
- Repositório (`CLAUDE.md`): PR com `--assignee WellingtonTorres --project "Projeto Final - Algoritmo K-Means"` e `Closes #N`; board atualizado a cada passo.
- Para abrir a página localmente: `python -m http.server 8000 --directory site` (módulos ES e `fetch` não funcionam em `file://`).

## Review Focus

1. **`aula.json` não carrega** (404, rede, `file://`): o texto e os números em português continuam legíveis e aparece um aviso curto no lugar dos gráficos; nenhum erro deixa a página em branco. → teste na Task 3.
2. **Tela de 360 px**: o letreiro, a navegação e os simuladores cabem sem rolagem horizontal. → captura e checagem de `scrollWidth` na Task 3 e na Task 7.
3. **Troca de idioma com gráficos já desenhados**: rótulos, nomes dos grupos e números dos gráficos e simuladores mudam junto, sem recarregar e sem perder o estado do simulador. → teste na Task 4 e na Task 7.
4. **Animações desativadas ou janela redimensionada**: os pontos aparecem agrupados e o canvas se redesenha nítido no novo tamanho. → teste na Task 5.
5. **Chave de tradução faltando**: um texto sem versão em inglês não pode aparecer vazio nem como nome de chave. → teste de completude na Task 4.

## File Structure

```text
site/
  index.html              todo o texto em pt, com data-i18n em cada trecho traduzível
  css/base.css            variáveis, tipografia (Inter), grade de linhas, navegação, rodapé
  css/secoes.css          abertura, capítulos, gráficos, simuladores, responsivo
  fonts/InterVariable.woff2, fonts/OFL.txt
  dados/aula.json         exportado do notebook (versionado)
  js/main.js              carrega o JSON, liga os módulos, trata falha de carga
  js/formato.js           (puro) formatação de números por idioma
  js/idioma.js            (puro + DOM) escolha, troca e persistência do idioma
  js/textos.js            dicionários pt/en dos textos dinâmicos e o en dos textos do HTML
  js/kmeans.js            (puro) sorteio, atribuição, atualização, inércia, previsão
  js/abertura.js          campo de pontos em canvas comandado pelo scroll
  js/graficos.js          funil, barras de contribuição, cotovelo+silhueta, mapas de calor (SVG)
  js/sim-passo.js         simulador "K-Means passo a passo"
  js/sim-grupo.js         simulador "Em que grupo cairia a sua música?"
  tests/*.test.mjs        testes com node --test
  README.md               como rodar, reexportar os dados e publicar
scripts/exportar_dados_site.py   executa o notebook e escreve/checa o JSON
scripts/capturar_site.py         capturas de tela (computador e celular) com navegador headless
tests/test_exportar_dados_site.py
.github/workflows/site.yml       testes em PR que mexe no site; publicação no Pages na main
```

Antes da Task 1: criar a branch `portfolio` a partir de `portfolio-design`; criar a issue-pai "Página de portfólio (GitHub Pages)" e uma sub-issue por task (título `P0N: …`), todas no Project; renomear a #51 para "Explorador de clusters em Angular" e comentar nela a decisão do design (seção 4). Mover para In progress conforme o `CLAUDE.md`.

---

### Task 1: Exportador de dados do notebook

**Files:**
- Create: `scripts/exportar_dados_site.py`, `tests/test_exportar_dados_site.py`, `site/dados/aula.json`
- Modify: `requirements.txt` (acrescentar `pytest`)

**Interfaces:**
- Produces: `exportar(notebook: Path) -> dict`, `checar(atual: dict, novo: dict, tolerancia: float = 1e-3) -> list[str]` (lista de divergências; vazia = em dia) e a linha de comando `python scripts/exportar_dados_site.py [--checar]`.
- Produces: o formato de `aula.json`, que todas as tasks seguintes consomem:

```jsonc
{
  "meta": {"notebook": "notebooks/aula_kmeans_spotify.ipynb", "k": 7, "random_state": 42},
  "limpeza": {"linhas": 114000, "sem_ausentes": 0, "sem_identicas": 0, "pares": 113392,
              "faixas": 89583, "generos": 114, "features": 9},
  "features": [{"id": "danceability", "nome": "dançabilidade"}],        // 9, na ordem de FEATURES
  "escala": {"faixa_a": "…", "faixa_b": "…", "sem_padronizar": [9], "padronizado": [9],
             "ari_sem_padronizar": 0.039},                               // % por feature
  "k": {"valores": [1,2,3,4,5,6,7,8,9,10], "inercias": [10], "silhuetas": [null, 9 valores]},
  "grupos": [{"id": 0, "nome": "Dançante e alegre", "cor": "#1f77b4", "faixas": 27523,
              "pct": 30.7, "centroide_z": [9], "centroide_original": [9], "pca": [0.0, 0.0]}],
  "pca_variancia": [0.32, 0.16],
  "pontos": {"x": [6000], "y": [6000], "grupo": [6000]},                 // 3 casas decimais
  "generos": [{"genero": "brazil", "br": true, "pct": [7]}],             // 13, BR primeiro
  "ao_vivo": [{"genero": "pagode", "no_grupo": 89.0, "fora": 35.0}],     // 7 gêneros BR
  "simulador_passo": {"pontos": [[0,0]], "cores": ["#…"]},               // dados_passo_a_passo
  "simulador_grupo": {"features": [], "media": [], "escala": [], "centroides": [],
                      "nomes": [], "cores": [], "exemplos": []}          // dados_simulador
}
```

Origem de cada campo no notebook: `df_bruto`, `sem_ausentes`, `sem_identicas`, `df_pares`, `df_faixas`, `FEATURES`, `NOMES_FEATURES_PT`, `contribuicao`, `faixa_a`/`faixa_b`, `ari`, `inercias`, `silhuetas`, `NOMES_CLUSTERS`, `CORES_CLUSTERS`, `perfil_clusters`, `centroides_padronizados`, `scaler`, `centroides_2d`, `variancia`, `pontos_2d`, `rotulos[amostra_idx]`, `genero_x_cluster`, `GENEROS_BR`, `GENEROS_CONTRASTE`, `ao_vivo_br`, `dados_passo_a_passo`, `dados_simulador`.

- [ ] **Step 1: Testes que falham** em `tests/test_exportar_dados_site.py`, sobre o JSON versionado (rápidos, sem executar o notebook):

```python
def test_numeros_da_aula(dados):            # fixture: json.load de site/dados/aula.json
    assert dados["limpeza"]["faixas"] == 89583 and dados["limpeza"]["pares"] == 113392
    assert dados["meta"]["k"] == 7 and len(dados["grupos"]) == 7
    assert [g["faixas"] for g in dados["grupos"]] == [27523, 18082, 10094, 1045, 20162, 6464, 6213]
    assert round(dados["k"]["silhuetas"][7 - 1], 3) == 0.196 and dados["k"]["silhuetas"][0] is None

def test_formas(dados):
    assert len(dados["features"]) == 9 and len(dados["k"]["inercias"]) == 10
    assert len(dados["pontos"]["x"]) == len(dados["pontos"]["y"]) == len(dados["pontos"]["grupo"]) == 6000
    assert len(dados["generos"]) == 13 and all(abs(sum(g["pct"]) - 100) < 0.6 for g in dados["generos"])
    assert all(len(g["centroide_z"]) == 9 for g in dados["grupos"])

def test_checar_aponta_divergencia(dados):
    outro = copy.deepcopy(dados); outro["grupos"][0]["faixas"] += 1
    assert checar(dados, dados) == [] and "grupos" in checar(dados, outro)[0]

def test_checar_tolera_ruido_numerico(dados):
    outro = copy.deepcopy(dados); outro["k"]["inercias"][3] *= 1 + 1e-6
    assert checar(dados, outro) == []
```

- [ ] **Step 2:** `pytest tests/test_exportar_dados_site.py -v` → FAIL (arquivo e função inexistentes).
- [ ] **Step 3: Implementar** `exportar` (lê o notebook com `nbformat`, acrescenta uma célula que monta o dicionário e o imprime como JSON entre marcadores, executa com `nbclient` com timeout de 180 s por célula e extrai o JSON da saída), `checar` (percorre as duas estruturas: inteiros e textos exatos, floats com tolerância relativa) e o `main` (`--checar` sai com código 1 e lista as divergências; sem a opção, grava `site/dados/aula.json` com `ensure_ascii=False` e fim de linha LF).
- [ ] **Step 4:** `python scripts/exportar_dados_site.py` e depois `pytest tests/test_exportar_dados_site.py -v` → PASS; `python scripts/exportar_dados_site.py --checar` → código 0.
- [ ] **Step 5: Commit** `P01: exportador dos dados do notebook para o site`.

### Task 2: Lógica pura (formatação e K-Means)

**Files:**
- Create: `site/js/formato.js`, `site/js/kmeans.js`, `site/tests/formato.test.mjs`, `site/tests/kmeans.test.mjs`

**Interfaces:**
- Produces (`formato.js`): `formatar(valor: number, casas: number, idioma: "pt"|"en"): string` (usa `−` para negativos), `formatarPct(valor, casas, idioma): string`.
- Produces (`kmeans.js`): `criarSorteador(semente: number): () => number` (mulberry32, igual ao da aula); `inicializar(pontos: number[][], k: number, semente: number): number[][]`; `atribuir(pontos, centroides): number[]`; `atualizar(pontos, rotulos, centroides): {centroides: number[][], deslocamento: number}` (grupo vazio mantém o centroide); `inercia(pontos, rotulos, centroides): number`; `rodarAteConvergir(pontos, k, semente, tol = 1e-4): {rotulos, centroides, iteracoes, inercia}`; `prever(valores: number[], media: number[], escala: number[], centroides: number[][]): {grupo: number, distancias: number[], z: number[]}`.
- A lógica é a dos simuladores do notebook (células com `HTML_PASSO_A_PASSO` e `HTML_GRUPO`), extraída sem mudar o comportamento.

- [ ] **Step 1: Testes que falham**, com `aula.json` lido do disco:

```js
test("formata por idioma", () => {
  assert.equal(formatar(89583, 0, "pt"), "89.583"); assert.equal(formatar(89583, 0, "en"), "89,583");
  assert.equal(formatar(0.196, 3, "pt"), "0,196"); assert.equal(formatar(-8.5, 1, "pt"), "−8,5");
});
test("sorteios 0, 1 e 2 chegam ao ótimo e o 3 para num mínimo local (k = 3)", () => {
  const p = dados.simulador_passo.pontos;
  for (const s of [0, 1, 2]) assert.equal(rodarAteConvergir(p, 3, s).inercia.toFixed(1), "1718.2");
  assert.equal(rodarAteConvergir(p, 3, 3).inercia.toFixed(1), "3878.5");
});
test("a música média cai em Dançante e alegre, quase empatada com Intenso e pesado", () => {
  const g = dados.simulador_grupo, r = prever(g.media, g.media, g.escala, g.centroides);
  assert.equal(r.grupo, 0); assert.equal(r.distancias[0].toFixed(2), "1.44"); assert.equal(r.distancias[4].toFixed(2), "1.55");
});
test("cada faixa de exemplo cai no próprio grupo", () => {
  const g = dados.simulador_grupo;
  g.exemplos.forEach((ex, i) => assert.equal(prever(ex.valores, g.media, g.escala, g.centroides).grupo, i));
});
test("grupo vazio mantém o centroide", () => { /* 2 pontos, k = 2, um centroide longe */ });
```

- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar** os dois módulos (ES modules, sem DOM).
- [ ] **Step 4:** `node --test site/tests/` → PASS.
- [ ] **Step 5: Commit** `P02: lógica pura de formatação e K-Means com testes`.

### Task 3: Esqueleto da página, tipografia, grade e conteúdo em português

**Files:**
- Create: `site/index.html`, `site/css/base.css`, `site/css/secoes.css`, `site/fonts/InterVariable.woff2`, `site/fonts/OFL.txt`, `site/js/main.js`, `scripts/capturar_site.py`, `site/tests/estrutura.test.mjs`

**Interfaces:**
- Produces (HTML): seções com `id` `abertura`, `dados`, `escala`, `quantos`, `grupos`, `brasil`, `simuladores`, `limites`, `contato`; cada gráfico num contêiner `data-grafico="funil|contribuicao|k|perfis|generos"`; cada simulador em `data-simulador="passo|grupo"`; todo trecho traduzível com `data-i18n="chave"`; todo número vindo dos dados com `data-dado="caminho.no.json"` e `data-casas="N"`, com o valor em português já escrito como conteúdo de reserva.
- Produces (`main.js`): `carregarDados(): Promise<object>`; ao falhar, acrescenta a classe `sem-dados` em `<html>` e escreve o aviso `data-i18n="aviso.sem_dados"` em cada contêiner de gráfico e simulador.
- Produces (`capturar_site.py`): `python scripts/capturar_site.py [--largura 1440|360]` sobe um servidor local em `site/`, tira capturas com Edge ou Chrome headless (caminho pela variável `NAVEGADOR`, com detecção automática) em `site/.capturas/` (ignorada pelo git) e imprime `scrollWidth` e `innerWidth` da página.

Conteúdo: o roteiro da seção 5.3 do spec, capítulo por capítulo, resumido do notebook e do `README.md`. Rodapé conforme a 5.5; LinkedIn e e-mail entram como `href="#PENDENTE"` até o autor informar (a Task 8 barra a publicação com pendência). Visual conforme 5.2 e seção 6 do spec: fundo `#0c0c0c`, texto `#f2f2f2`, letreiro "K-MEANS" em peso 900 ocupando a largura e cortado no topo, linhas verticais de grade visíveis, navegação alinhada às colunas, capítulos com o número na coluna estreita. A Inter variável vem do pacote oficial (rsms/inter, OFL), copiada para `site/fonts/`.

- [ ] **Step 1: Teste que falha** (`estrutura.test.mjs`, lendo o HTML como texto):

```js
test("tem as 9 seções, os 5 gráficos e os 2 simuladores", () => { /* ids e data-* acima */ });
test("nenhum recurso externo", () => {
  assert.doesNotMatch(html + css, /(src|href)="https?:\/\/(?!colab\.research\.google\.com|github\.com|www\.linkedin\.com|huggingface\.co)/);
  assert.doesNotMatch(css, /url\(["']?https?:/);
});
test("todo caminho local é relativo", () => assert.doesNotMatch(html, /(src|href)="\//));
test("todo data-dado aponta para um campo que existe no aula.json", () => { /* resolve cada caminho */ });
```

- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar** HTML, CSS e `main.js` (preenche os `data-dado` com `formatar`; sem gráficos ainda).
- [ ] **Step 4:** `node --test site/tests/` → PASS. `python scripts/capturar_site.py` e `--largura 360` → abrir as capturas e conferir: letreiro cortado no topo, grade visível, texto legível; saída com `scrollWidth <= innerWidth` nas duas larguras. Renomear temporariamente `site/dados/aula.json` e capturar de novo → texto em português intacto e aviso no lugar dos gráficos (Review Focus 1 e 2).
- [ ] **Step 5: Commit** `P03: esqueleto, tipografia, grade e conteúdo em português`.

### Task 4: Idioma PT / EN

**Files:**
- Create: `site/js/idioma.js`, `site/js/textos.js`, `site/tests/idioma.test.mjs`
- Modify: `site/index.html` (seletor `PT / EN` na navegação), `site/js/main.js`

**Interfaces:**
- Produces (`idioma.js`): `escolherIdioma({consulta, salvo, navegador}: {consulta: string, salvo: string|null, navegador: string}): "pt"|"en"` (ordem: `?lang=` válido, depois o salvo, depois `pt` se o navegador começa com `pt`, senão `en`); `aplicarIdioma(idioma, raiz = document)` (troca os `data-i18n`, reformata os `data-dado`, ajusta `<html lang>`, salva em `localStorage` na chave `kmeans-idioma` e dispara o evento `idioma` em `document` com `detail: {idioma}`); `idiomaAtual(): "pt"|"en"`.
- Produces (`textos.js`): `TEXTOS = {pt: {...}, en: {...}}` para textos dinâmicos (rótulos de gráficos, mensagens dos simuladores, `grupo.0`…`grupo.6`, `feature.<id>`) e `TEXTOS.en` também com todas as chaves `data-i18n` do HTML; `t(chave: string, idioma: string, variaveis?: object): string`.
- Os módulos de gráficos e simuladores (Tasks 6 e 7) ouvem o evento `idioma` e se redesenham.

- [ ] **Step 1: Testes que falham:**

```js
test("ordem de escolha", () => {
  assert.equal(escolherIdioma({consulta: "?lang=en", salvo: "pt", navegador: "pt-BR"}), "en");
  assert.equal(escolherIdioma({consulta: "", salvo: "en", navegador: "pt-BR"}), "en");
  assert.equal(escolherIdioma({consulta: "", salvo: null, navegador: "pt-BR"}), "pt");
  assert.equal(escolherIdioma({consulta: "?lang=xx", salvo: null, navegador: "de-DE"}), "en");
});
test("toda chave data-i18n do HTML existe em TEXTOS.en e não está vazia", () => { /* Review Focus 5 */ });
test("pt e en têm as mesmas chaves dinâmicas", () => assert.deepEqual(chaves(TEXTOS.pt), chavesDinamicas(TEXTOS.en)));
test("t() nunca devolve a chave nem texto vazio", () => { /* chave inexistente → lança erro */ });
```

- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar.** A tradução para o inglês é redação do implementador (tom direto, primeira pessoa); nomes dos grupos em inglês: Danceable & upbeat, Acoustic & calm, Energetic instrumental, Speech & comedy, Intense & heavy, Ambient & classical, Live.
- [ ] **Step 4:** testes → PASS. Captura com `?lang=en` nas duas larguras → nenhum texto em português fora de nomes de músicas, artistas e gêneros; números em formato inglês.
- [ ] **Step 5: Commit** `P04: seletor de idioma PT/EN`.

### Task 5: Abertura com os pontos comandados pelo scroll

**Files:**
- Create: `site/js/abertura.js`, `site/tests/abertura.test.mjs`
- Modify: `site/index.html`, `site/css/secoes.css`, `site/js/main.js`

**Interfaces:**
- Consumes: `dados.pontos`, `dados.grupos[].cor`, `dados.grupos[].pca`, `t("grupo.N")`, evento `idioma`.
- Produces: `progressoDoScroll(topo: number, altura: number, alturaJanela: number): number` (0 no início do trecho preso, 1 no fim, limitado a [0, 1]); `posicaoDoPonto(i, progresso, pontos, espalhados): [x, y]` (interpolação com suavização; `espalhados` vem de `criarSorteador(42)`, para o estado inicial ser sempre o mesmo); `iniciarAbertura(elemento, dados)`.

Comportamento (spec 5.2): trecho `position: sticky` com altura de rolagem de cerca de 250% da janela; pontos cinza espalhados em `progresso = 0`; em 1, cada ponto na posição do PCA com a cor do grupo, os 7 centroides e os 7 nomes visíveis, e o número grande passa de `limpeza.faixas` para `meta.k`. A linha "Um algoritmo encontrou 7 perfis de som." fica visível desde `progresso = 0`. Canvas dimensionado por `devicePixelRatio` e redesenhado em `resize`. Com `prefers-reduced-motion: reduce`, o trecho não fica preso e desenha direto o estado final. Em telas com menos de 600 px, usa 1 de cada 2 pontos.

- [ ] **Step 1: Testes que falham:** `progressoDoScroll` nos limites (antes do trecho → 0; depois → 1; meio → 0,5); `posicaoDoPonto` devolve o ponto espalhado em 0 e o do PCA em 1; o estado espalhado é idêntico em duas chamadas.
- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar.**
- [ ] **Step 4:** testes → PASS. Estender `capturar_site.py` com `--rolar <fração>` e capturar em 0, 0,5 e 1 → pontos cinza espalhados, a meio caminho, e 7 grupos coloridos com nomes. Capturar com `--forcar-menos-movimento` (flag `--force-prefers-reduced-motion` do navegador) → estado final sem rolar. Capturar em 360 px e em 1440 px depois de redimensionar → pontos nítidos (Review Focus 4).
- [ ] **Step 5: Commit** `P05: abertura com os pontos se organizando pelo scroll`.

### Task 6: Gráficos dos capítulos

**Files:**
- Create: `site/js/graficos.js`, `site/tests/graficos.test.mjs`
- Modify: `site/css/secoes.css`, `site/js/main.js`

**Interfaces:**
- Consumes: `dados`, `formatar`, `t`, evento `idioma`.
- Produces: `escalaLinear(dominio: [number, number], imagem: [number, number]): (v: number) => number`; `desenharGraficos(dados, idioma)`, que preenche cada `data-grafico` com um `<svg role="img">` com `<title>` e `<desc>` (resumo em texto dos números) e é chamada de novo no evento `idioma`.

Os cinco gráficos, com os números da seção 5.3 do spec:

| `data-grafico` | Mostra | Dados |
|---|---|---|
| `funil` | três barras decrescentes: linhas, pares, faixas | `limpeza` |
| `contribuicao` | por feature, duas barras: parte da distância sem padronizar e padronizada, entre as duas faixas do exemplo | `escala` |
| `k` | inércia (k = 1…10) e silhueta (k = 2…10) em dois painéis, com k = 7 marcado | `k`, `meta.k` |
| `perfis` | mapa de calor 7 × 9 dos centroides padronizados, com o valor em cada célula e a cor do grupo na linha | `grupos`, `features` |
| `generos` | mapa de calor 13 × 7 (% do gênero em cada grupo), com uma linha separando os 7 brasileiros dos 6 de contraste | `generos`, `grupos` |

Escala de cor dos mapas de calor: divergente azul/vermelho em torno de 0 para `perfis` e sequencial de uma cor para `generos`, as duas com texto legível sobre o fundo preto (contraste AA em cada célula).

- [ ] **Step 1: Testes que falham:** `escalaLinear([0, 10], [0, 100])(2.5) === 25`; para cada gráfico, uma função pura `descrever<Grafico>(dados, idioma): string` (o texto do `<desc>`) contém os números esperados: funil com "114.000", "113.392" e "89.583" em pt e "89,583" em en; `k` com "0,196"; `generos` com "pagode" e "50".
- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar.**
- [ ] **Step 4:** testes → PASS. Capturas em 1440 e 360 px e com `?lang=en` → os cinco gráficos legíveis, sem corte, com rótulos no idioma certo.
- [ ] **Step 5: Commit** `P06: gráficos dos capítulos em SVG`.

### Task 7: Os dois simuladores no visual da página

**Files:**
- Create: `site/js/sim-passo.js`, `site/js/sim-grupo.js`, `site/tests/simuladores.test.mjs`
- Modify: `site/css/secoes.css`, `site/js/main.js`

**Interfaces:**
- Consumes: tudo de `kmeans.js`, `dados.simulador_passo`, `dados.simulador_grupo`, `formatar`, `t`, evento `idioma`.
- Produces: `criarEstadoPasso(pontos, k, semente)` com os métodos `inicializar()`, `atribuir()`, `atualizar()`, `acrescentarPonto([x, y])` e os campos `fase` (`"vazio"|"inicializado"|"atribuido"|"atualizado"|"convergiu"`), `iteracao`, `inercia`; `iniciarSimuladorPasso(elemento, dados)`; `iniciarSimuladorGrupo(elemento, dados)`.

Comportamento: o mesmo dos simuladores do notebook (spec 5.4): mesmos controles, mesmas mensagens (agora via `t`), mesma sequência de fases. Botões e controles deslizantes alcançáveis por teclado, com rótulo acessível. Trocar o idioma redesenha rótulos e mensagens **sem** reiniciar o estado (Review Focus 3).

- [ ] **Step 1: Testes que falham:**

```js
test("fases do passo a passo", () => {
  const e = criarEstadoPasso(pontos, 3, 3); assert.equal(e.fase, "vazio");
  e.inicializar(); assert.equal(e.fase, "inicializado"); e.atribuir(); assert.equal(e.iteracao, 1);
  while (e.fase !== "convergiu") { e.atualizar(); if (e.fase !== "convergiu") e.atribuir(); }
  assert.equal(e.inercia.toFixed(1), "3878.5"); assert.equal(e.iteracao, 7);
});
test("acrescentar ponto volta para a fase inicializado e zera os rótulos", () => { /* … */ });
test("a inércia nunca sobe de um passo para o outro", () => { /* sorteios 0 a 7 */ });
```

- [ ] **Step 2:** `node --test site/tests/` → FAIL.
- [ ] **Step 3: Implementar** os dois módulos.
- [ ] **Step 4:** testes → PASS. Estender `capturar_site.py` com `--script <arquivo.js>` (executado na página antes da captura) e conferir no navegador: sorteio 3 convergido mostra inércia "3.878,5"; a faixa "Thunderstruck" com energia 0,20 continua em *Intenso e pesado* e, com acústica 0,80, passa para *Acústico e calmo*; trocar para inglês no meio mantém a iteração e a inércia. Captura em 360 px → sem rolagem horizontal.
- [ ] **Step 5: Commit** `P07: simuladores no visual da página`.

### Task 8: Testes no CI, publicação no Pages e documentação

**Files:**
- Create: `.github/workflows/site.yml`, `site/README.md`, `site/tests/publicacao.test.mjs`
- Modify: `README.md` (link para a página, depois de publicada), `.gitignore` (`site/.capturas/`)

**Interfaces:**
- Produces: workflow com dois jobs. `testes` (em `pull_request` e `push` que mexem em `site/**`, `scripts/exportar_dados_site.py`, `tests/test_exportar_dados_site.py` ou no próprio workflow): Node 22 → `node --test site/tests/`; Python 3.12 → `pytest tests/test_exportar_dados_site.py` e `python scripts/exportar_dados_site.py --checar`. `publicar` (só em `push` na `main`, depois de `testes`): `actions/configure-pages`, `actions/upload-pages-artifact` com `path: site` e `actions/deploy-pages`, com `permissions: pages: write, id-token: write`. O workflow **não** é disparado por mudanças só em `notebooks/`.

- [ ] **Step 1: Teste que falha** (`publicacao.test.mjs`): nenhum arquivo de `site/` contém `#PENDENTE`. Falha enquanto o LinkedIn e o e-mail não forem informados.
- [ ] **Step 2: Pedir ao autor** o endereço do LinkedIn e o e-mail, preencher o rodapé e pedir que ele revise o texto em inglês. `node --test site/tests/` → PASS.
- [ ] **Step 3: Escrever** o workflow e o `site/README.md` (rodar localmente, reexportar o JSON quando o notebook mudar, como a publicação acontece).
- [ ] **Step 4:** abrir o PR da branch `portfolio` (não antes de 25/11/2026 para o merge) → job `testes` verde. Ativar o Pages com origem "GitHub Actions" (`gh api -X POST repos/DataScience-Fatec-Projects/kmeans-musicas-spotify/pages -f build_type=workflow`; se faltar permissão, pedir ao autor em Settings → Pages).
- [ ] **Step 5:** depois do merge, conferir `https://datascience-fatec-projects.github.io/kmeans-musicas-spotify/` e `?lang=en`: página carrega, pontos animam, gráficos e simuladores funcionam, nenhum 404 no console. Acrescentar o link no `README.md` da raiz, mover as issues para Done.
- [ ] **Step 6: Commit** `P08: CI, publicação no GitHub Pages e documentação`.
