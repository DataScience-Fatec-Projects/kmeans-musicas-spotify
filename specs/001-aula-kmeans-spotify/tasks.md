---

description: "Lista de tarefas da feature 001: aula interativa de K-Means com músicas do Spotify"
---

# Tasks: Aula interativa de K-Means com músicas do Spotify

**Input**: Design documents from `/specs/001-aula-kmeans-spotify/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/estrutura-notebook.md, quickstart.md

**Tests**: a spec não pede TDD. A verificação usa `scripts/validar_notebook.py` (contrato
estrutural), a execução do notebook do zero (local e em CI) e os cenários do
[quickstart.md](quickstart.md).

**Organization**: as tarefas estão agrupadas por user story. As histórias seguem a numeração das
seções do enunciado (US1 = Seção I … US5 = Seção V). As fases estão na ordem de prioridade.

## Format: `[ID] [P?] [Story] Título — arquivo §seção: detalhes`

- **[P]**: pode rodar em paralelo. Num arquivo comum, isso quer dizer arquivo diferente. No
  notebook, quer dizer **seção diferente** (vale a regra "uma pessoa por seção" da constituição VII).
- **[Story]**: a história (seção) a que a tarefa pertence (US1…US5).
- O trecho antes de " — " vira o título da issue no GitHub (`scripts/sync_issues.py`).
- `aula.ipynb` = `notebooks/aula_kmeans_spotify.ipynb`. Nomes de variáveis e títulos seguem
  [contracts/estrutura-notebook.md](contracts/estrutura-notebook.md).
- Todo gráfico segue o FR-044: título, eixos em pt-BR, legenda e, na dispersão, `alpha` ou
  amostra.

## Mapeamento para o GitHub (Project 3)

| Fase | Issue-pai | Milestone |
|---|---|---|
| 1–2 | Setup e base do notebook | M1 Dados e modelo (13/11) |
| US3, US4 | Seção III, Seção IV | M1 Dados e modelo (13/11) |
| US1, US2, US5 | Seção I, Seção II, Seção V | M2 Aula completa (20/11) |
| Polish | Entrega e portfólio | M3 Entrega (24/11) |

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: ambiente de validação, validador estrutural e esqueleto do notebook

- [ ] T001 Ambiente de validação local e de CI — `requirements.txt` na raiz (pandas, numpy, scikit-learn, matplotlib, seaborn, nbformat, nbconvert, ipykernel, sem versões fixas, R8), conferindo se o `.gitignore` já cobre `.venv/` e `*_executada.ipynb`
- [ ] T002 [P] Validador estrutural do notebook — `scripts/validar_notebook.py` com todas as checagens ✔auto do contrato §1 e §2: títulos `## I.`…`## V.` em ordem e com o texto exato do enunciado; primeira célula markdown com "Integrantes"; toda célula de código precedida por markdown não vazio; `RANDOM_STATE =` em exatamente 1 célula; `URL_DATASET` do Hugging Face sem `files.upload`/`drive.mount`; ≥ 4 markdowns começando com "🧪 Experimente"; nenhum output `error`; nenhum `ipywidgets`/`plotly`. Imprime `OK` ou a lista de falhas e sai com código 0 ou 1
- [ ] T003 Esqueleto do notebook com capa e sumário — `aula.ipynb`: todos os títulos do contrato §1 em markdown (com uma linha "🚧 em construção — ver issue" em cada subseção), a capa (título, disciplina ICD-004, Prof. Humberto Zanetti, Fatec Jundiaí, "Integrantes:" com o nome completo do autor e um lugar para outros, data, link do repo) e o sumário com links para cada seção

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: configuração comum a todas as seções, portão automático de PR e infra de colaboração

**⚠️ CRITICAL**: nenhuma seção começa antes desta fase

- [ ] T004 Célula de configuração do ambiente — `aula.ipynb` §⚙️ Configuração: imports (numpy, pandas, matplotlib, seaborn, sklearn.preprocessing/cluster/metrics/decomposition/datasets), `RANDOM_STATE = 42`, `URL_DATASET`, `FEATURES` (9, na ordem do data-model), `GENEROS_BR = ['brazil', 'mpb', 'sertanejo', 'pagode', 'samba', 'forro', 'funk']`, `GENEROS_CONTRASTE = ['classical', 'metal', 'sleep', 'hip-hop', 'edm', 'comedy']`, `TAMANHO_AMOSTRA_SILHUETA = 10_000`, `TAMANHO_AMOSTRA_GRAFICOS = 6_000`, estilo padrão dos gráficos e impressão das versões **do Python** e das 5 bibliotecas, com markdown explicando a célula (R7, FR-022)
- [ ] T005 [P] CI que valida e executa o notebook — `.github/workflows/notebook.yml`: em `pull_request` e `push` na `main` que alterem `notebooks/**`, `scripts/validar_notebook.py` ou `requirements.txt`, rodar no ubuntu com Python 3.12 → `pip install -r requirements.txt` → `python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb` → `jupyter nbconvert --to notebook --execute --ExecutePreprocessor.timeout=120 --output aula_executada.ipynb notebooks/aula_kmeans_spotify.ipynb` (o timeout de 120 s por célula garante o limite de 2 min por etapa)
- [X] T006 [P] Infra de colaboração e portfólio — `CONTRIBUTING.md`, `README.md`, `.github/pull_request_template.md`, `.github/ISSUE_TEMPLATE/` e `scripts/sync_issues.py`, criados na estruturação SDD em 07/11/2026 (constituição VII). O README já cita a fonte e a licença do dataset

**Checkpoint**: base pronta. A partir daqui as seções podem ser trabalhadas, I e II em paralelo com III → IV → V.

---

## Phase 3: User Story 3 - Seção III: tema e preparação dos dados (Priority: P1) 🎯 MVP

**Goal**: dados carregados, limpos, com uma linha por faixa e padronizados, com cada decisão explicada

**Independent Test**: executar até o fim da III.5. `df_faixas` tem ≈ 89,6 mil linhas, a contagem por regra de limpeza aparece e `X` tem média ≈ 0 e desvio ≈ 1 por coluna

- [ ] T007 [US3] III.1 Tema: por que agrupar músicas — `aula.ipynb` §III.1: motivação (playlists, recomendação, descoberta de "climas") e a pergunta da aula ("que perfis de som existem nas músicas do Spotify?") (FR-030)
- [ ] T008 [US3] III.2 Dataset: origem, licença e dicionário de variáveis — `aula.ipynb` §III.2: link do Hugging Face, licença BSD, autor, coleta via API do Spotify e aviso de que a API de audio-features foi descontinuada em nov/2024. Dicionário em tabela (nome, significado em pt-BR, faixa de valores, "entra no agrupamento?") para as 20 colunas (FR-031, FR-032)
- [ ] T009 [US3] III.3 Carregamento do dataset com tratamento de falha — `aula.ipynb` §III.3: `df_bruto = pd.read_csv(URL_DATASET, index_col=0)` dentro de try/except com mensagem em pt-BR e o link da página do dataset (R9). Mostrar `shape` (114.000 × 20), `head()` e tipos, com comentário
- [ ] T010 [US3] III.3 Limpeza e base de treino com uma faixa por linha — `aula.ipynb` §III.3: nesta ordem, remover a linha com ausentes, as linhas idênticas e `tempo` = 0 → `df_pares`, imprimindo quantas linhas cada regra removeu (esperado 1, 450 e 157). Depois `assert` que as features são iguais entre as cópias de um mesmo `track_id`, e `df_faixas = df_pares.drop_duplicates('track_id')` (≈ 89.583), explicando por que treinar com faixas repetidas distorceria os centroides (FR-033, R1)
- [ ] T011 [US3] III.4 Escolha e justificativa das features — `aula.ipynb` §III.4: justificar as 9 `FEATURES` e as excluídas (`key`, `mode`, `time_signature` são categóricas; `popularity`, `duration_ms`, `explicit` são contexto; `track_genre` fica reservada para validar e não pode vazar para o treino). Mostrar `describe()` das 9, evidenciando as escalas diferentes (loudness −49,5 a +4,5 dB; tempo até 243 BPM) (FR-035)
- [ ] T012 [US3] III.5 Padronização com StandardScaler — `aula.ipynb` §III.5: `scaler = StandardScaler()`, `X = scaler.fit_transform(df_faixas[FEATURES])`, tabela de média e desvio antes e depois, e um exemplo numérico de distância euclidiana mostrando `tempo` dominando `danceability` sem padronizar (FR-036)

**Checkpoint**: US3 completa e verificável sozinha (MVP dos dados)

---

## Phase 4: User Story 4 - Seção IV: escolher k, treinar e visualizar (Priority: P1)

**Goal**: k justificado, modelo treinado e as duas visualizações obrigatórias

**Independent Test**: executar até o fim da IV.4. Aparecem o cotovelo, a silhueta, `K_ESCOLHIDO` justificado, a tabela de tamanhos e centroides, o gráfico de separação e o gráfico de centroides. Uma segunda execução dá os mesmos números e gráficos

- [ ] T013 [US4] IV.1 Método do Cotovelo (k = 1..10) — `aula.ipynb` §IV.1: `inercias` com `KMeans(n_init=10, random_state=RANDOM_STATE)` e gráfico inércia × k (FR-044), com comentário honesto sobre a curva suave, sem joelho nítido (FR-040, R2)
- [ ] T014 [US4] IV.1 Silhueta em amostra (k = 2..10) — `aula.ipynb` §IV.1: `silhuetas` com `silhouette_score(..., sample_size=TAMANHO_AMOSTRA_SILHUETA, random_state=RANDOM_STATE)` e gráfico (FR-044), explicando o porquê da amostra (a silhueta exata é O(n²)) (FR-041, R3)
- [ ] T015 [US4] IV.1 Decisão justificada de K_ESCOLHIDO — `aula.ipynb` §IV.1: combinar cotovelo, silhueta e interpretabilidade (os experimentos indicam k = 5, R2), com justificativa por escrito
- [ ] T016 [US4] IV.2 Treino do K-Means: rótulos, tamanhos e centroides — `aula.ipynb` §IV.2: `modelo = KMeans(n_clusters=K_ESCOLHIDO, n_init=10, random_state=RANDOM_STATE).fit(X)`, `rotulos = modelo.labels_`, `df_faixas['cluster'] = rotulos`, `centroides_padronizados = modelo.cluster_centers_`. Mostrar a tabela de tamanho de cada cluster (contagem e %) **e a tabela dos centroides**, com comentário (FR-042)
- [ ] T017 [US4] IV.2 🧪 Experimente: outro valor de k — `aula.ipynb` §IV.2: célula com `K_TESTE` editável que re-treina e mostra tamanhos e centroides ao lado dos do `K_ESCOLHIDO` (FR-007, contrato §4)
- [ ] T018 [US4] IV.3 Gráfico de separação dos clusters — `aula.ipynb` §IV.3: calcular as 2 features com maior desvio entre `centroides_padronizados`, sortear `amostra_idx` (`TAMANHO_AMOSTRA_GRAFICOS`, `RANDOM_STATE`, explicando em markdown o porquê do tamanho) e plotar a dispersão colorida por cluster com `alpha` (FR-044), com comentário (inclusive se `speechiness` liderar por causa do cluster de fala) (FR-043a, R5)
- [ ] T019 [US4] IV.4 Gráfico de centroides em relação aos pontos (PCA 2D) — `aula.ipynb` §IV.4: PCA 2D ajustado em `X`, projetar `amostra_idx` e os centroides, marcar cada centroide com um "X" grande, rótulo e legenda (FR-044), variância explicada no título, com comentário (FR-043b, R5)
- [ ] T020 [US4] IV.4 🧪 Experimente: com e sem padronização — `aula.ipynb` §IV.4 (fim): célula com `USAR_PADRONIZACAO = True/False` que treina sem padronização e compara tamanhos e centroides, mostrando `tempo` e `loudness` dominando (FR-007, contrato §4)

**Checkpoint**: US3 + US4 completas, ou seja, o núcleo de "Rigor Técnico" (40%) está entregue

---

## Phase 5: User Story 1 - Seção I: entender o K-Means antes do código real (Priority: P2)

**Goal**: teoria clara e K-Means implementado do zero, com análise de complexidade

**Independent Test**: executar só a configuração e a Seção I (dados de brinquedo). O do zero converge em ≥ 3 iterações visíveis, o ARI com o scikit-learn (mesma inicialização) dá 1,0 e há a tabela de complexidade com a contagem de cálculos × n

- [ ] T021 [P] [US1] I.1–I.2 Aprendizado não supervisionado e clustering — `aula.ipynb` §I.1–I.2: supervisionado × não supervisionado, com exemplos do cotidiano, e o que é clustering, com exemplos (playlists, segmentação de clientes) (FR-010)
- [ ] T022 [US1] I.3 K-Means do zero com iterações visíveis — `aula.ipynb` §I.3: `X_brinquedo` com `make_blobs` (~150 pontos 2D, `RANDOM_STATE`) e `kmeans_do_zero(X, k, semente, max_iter, tol)` com numpy (~15 linhas comentadas), devolvendo rótulos, centroides, centroides iniciais e número de iterações. Usar blobs sobrepostos (`cluster_std` maior, sem inicialização ruim) até ter **≥ 3 iterações**. Grade de gráficos, um por iteração (FR-044), e texto ligando cada trecho aos 4 passos: inicialização, atribuição, atualização e parada (FR-011, FR-013, R6)
- [ ] T023 [US1] I.3 Comparação do zero × scikit-learn (ARI) — `aula.ipynb` §I.3: `KMeans(n_clusters=k, init=centroides_iniciais, n_init=1)` no `X_brinquedo` e `adjusted_rand_score` com o resultado do zero (esperado 1,0), explicando por que o ARI resolve a numeração arbitrária dos rótulos e por que se usa a mesma inicialização (FR-013, Edge Cases, R6)
- [ ] T024 [US1] I.3 🧪 Experimente: k e semente do exemplo de brinquedo — `aula.ipynb` §I.3: célula com `K_BRINQUEDO` e `SEMENTE_INICIAL` editáveis, mostrando que inicializações diferentes mudam as iterações e às vezes o resultado (mínimo local) (FR-007, contrato §4)
- [ ] T025 [US1] I.4 Complexidade do K-Means (Big-O e contagem de operações) — `aula.ipynb` §I.4: tabela com atribuição O(n·k·d), atualização O(n·d), total O(n·k·d·i) e memória O(n·d + k·d), custo do cotovelo (× valores de k × `n_init`) e da silhueta exata (O(n²·d)). Experimento **determinístico**: contar os cálculos de distância (n·k × iterações) de `kmeans_do_zero` em `make_blobs` com `RANDOM_STATE` para n = 1k, 2k, 4k e 8k, com tabela e gráfico "cálculos × n" (FR-044) mostrando crescimento ≈ linear, sem cronometrar (constituição IV). Ligar à disciplina de Análise de Algoritmos (FR-014, R6)
- [ ] T026 [US1] I.5 Inércia, cotovelo e silhueta na teoria — `aula.ipynb` §I.5: inércia (fórmula e intuição), Método do Cotovelo ilustrado no `X_brinquedo` com k = 1..8 (gráfico, FR-044) e silhueta (intuição e s = (b − a) / max(a, b)) (FR-012)

**Checkpoint**: Seção I verificável isoladamente

---

## Phase 6: User Story 5 - Seção V: interpretar os grupos e concluir (Priority: P2)

**Goal**: cada cluster com nome, perfil e exemplos, cruzamento com gêneros com destaque brasileiro, e limitações

**Independent Test**: executar o notebook inteiro. Cada cluster tem nome, ≥ 3 valores, exemplos e gêneros predominantes, e há o heatmap BR + contrastes, ≥ 3 limitações e ≥ 2 próximos passos

- [ ] T027 [US5] V.1 Perfil dos clusters na escala original — `aula.ipynb` §V.1: `centroides_originais` via `scaler.inverse_transform(centroides_padronizados)`, `perfil_clusters` (tamanho, % e médias na escala original) e heatmap anotado dos `centroides_padronizados` (FR-044), com comentário (FR-050)
- [ ] T028 [US5] V.2 Nomes dos clusters e exemplos de faixas — `aula.ipynb` §V.2: `NOMES_CLUSTERS` com um nome por cluster citando ≥ 3 valores que o justificam, coluna `nome` em `perfil_clusters` e tabela de exemplos a partir de `df_faixas['cluster']` (por exemplo, as 5 faixas mais populares de cada cluster, com artista) (FR-051, FR-052, SC-005)
- [ ] T029 [US5] V.3 Cruzamento clusters × gêneros — `aula.ipynb` §V.3: `df_pares['cluster']` por merge com `df_faixas[['track_id', 'cluster']]`, `genero_x_cluster = pd.crosstab(df_pares.track_genre, df_pares.cluster, normalize='index')` e tabela dos 5 gêneros mais frequentes de cada cluster (FR-053)
- [ ] T030 [US5] V.3 Destaque para os gêneros brasileiros — `aula.ipynb` §V.3: heatmap de `GENEROS_BR + GENEROS_CONTRASTE` × cluster com `NOMES_CLUSTERS` nos eixos (FR-044), um comentário (por exemplo, MPB mais acústica e forró/funk mais dançantes) e a nota sobre o rótulo `funk` (EUA × Brasil) (FR-034)
- [ ] T031 [US5] V.3 🧪 Experimente: gêneros à escolha — `aula.ipynb` §V.3: célula com `GENEROS_EXTRA` editável para o leitor ver onde caem gêneros à escolha (obrigatória, FR-007, contrato §4)
- [ ] T032 [US5] V.4–V.5 Limitações e próximos passos — `aula.ipynb` §V.4–V.5: ≥ 3 limitações ligadas ao problema (k fixo e escolhido com ambiguidade; clusters esféricos e de tamanho parecido; sensibilidade a outliers e escala; clusters pouco separados, com silhueta ≈ 0,18; gênero ≠ som) e ≥ 2 próximos passos (DBSCAN, GMM ou hierárquico; redução de dimensionalidade; outras features; app Streamlit) (FR-054)

**Checkpoint**: aula completa de I a V

---

## Phase 7: User Story 2 - Seção II: ferramentas (Priority: P3)

**Goal**: o leitor sabe para que serve cada biblioteca e como usar o `KMeans` do scikit-learn

**Independent Test**: executar a configuração e a Seção II. As versões são impressas e cada biblioteca e parâmetro está explicado

- [ ] T033 [P] [US2] II.1 Bibliotecas e o papel de cada uma — `aula.ipynb` §II.1: tabela com numpy, pandas, matplotlib, seaborn e os módulos do scikit-learn usados, com o papel de cada um na aula, referenciando a célula "⚙️ Configuração do ambiente" (FR-020)
- [ ] T034 [US2] II.2 O KMeans do scikit-learn: parâmetros e atributos — `aula.ipynb` §II.2: `sklearn.cluster.KMeans`, com os parâmetros (`n_clusters`, `init='k-means++'`, `n_init`, `max_iter`, `tol`, `random_state`), os atributos (`labels_`, `cluster_centers_`, `inertia_`, `n_iter_`), o padrão `fit`/`predict` e k-means++ × inicialização aleatória, ligando com a I.3 (FR-021)

**Checkpoint**: todas as seções completas

---

## Phase 8: Polish & Cross-Cutting Concerns (Entrega e portfólio)

**Purpose**: qualidade final, verificação da rubrica e entrega

- [ ] T035 [P] Referências — `aula.ipynb` §Referências: enunciado, documentação do scikit-learn, dataset no Hugging Face e livro-base da disciplina
- [ ] T036 Revisão contra a rubrica e o enunciado — `aula.ipynb` × `specs/001-aula-kmeans-spotify/checklists/rubrica.md` e `docs/enunciado.md`: conferir cada item e ajustar o que faltar
- [ ] T037 Revisão de linguagem e do princípio II — `aula.ipynb` inteiro: pt-BR, termos definidos na primeira vez, markdown antes de cada código e comentário depois de cada saída relevante
- [ ] T038 Reprodutibilidade e tempo de execução — `aula.ipynb` (quickstart §B e §C): executar 2× do zero localmente comparando tamanhos, centroides e gráficos (SC-004), e executar no Colab gratuito medindo o tempo total (< 5 min, SC-001). Registrar no PR
- [ ] T039 Leitor-teste — quickstart §D (SC-003): pelo menos 1 colega lê a aula no link e responde às 3 perguntas. Registrar as respostas na issue
- [ ] T040 [P] README com resultados e link do Colab — `README.md` e `link_colab.txt`: k escolhido, nomes dos clusters e 1–2 figuras exportadas em `docs/img/`, mantendo a fonte e a licença do dataset (constituição, restrições de dados). Depende de T028 e T030
- [ ] T041 Capa final e versão executada na main — `aula.ipynb`: nome completo de todos os integrantes na capa, notebook executado e salvo com outputs na `main`, `scripts/validar_notebook.py` OK e link público aberto em janela anônima (SC-006)
- [ ] T042 Entrega do link público na plataforma da disciplina — `link_colab.txt`: enviar até 24/11/2026 23:59 (SC-007)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Fase 1)**: começa já. T002 roda em paralelo com T001 e T003.
- **Foundational (Fase 2)**: depende da Fase 1 (T004 depende de T003; T005 depende de T001 e T002). T006 já está concluída. A fase bloqueia todas as seções.
- **US3 → US4 → US5**: sequenciais (contrato §3: III entrega `X` e `df_faixas`, IV entrega `rotulos` e `df_faixas['cluster']`, V consome os dois).
- **US1 e US2**: dependem só da Fase 2 e podem rodar em paralelo entre si e com US3–US5 (seções diferentes do notebook).
- **Polish (Fase 8)**: depende de todas as seções. T035 pode ser adiantada. T040 depende de T028 e T030.

### User Story Dependencies

- **US3 (P1)**: depois da Fase 2. Não depende de outras histórias.
- **US4 (P1)**: depende de US3 (`X`, `df_faixas`).
- **US1 (P2)**: depois da Fase 2. Independente (dados de brinquedo).
- **US5 (P2)**: depende de US3 e US4.
- **US2 (P3)**: depois da Fase 2. Independente.

### Within Each User Story

- A ordem das tarefas acompanha a ordem das células da seção.
- Tarefas de texto (markdown) e de código de uma mesma subseção ficam na mesma tarefa, para respeitar o Princípio II.

## Parallel Example

```text
# Com 3 pessoas, depois da Fase 2:
Pessoa A: T007 → T012 (US3) → T013 → T020 (US4) → T027 → T032 (US5)
Pessoa B: T021 → T026 (US1)
Pessoa C: T033 → T034 (US2) → T035 (Referências)
```

## Implementation Strategy

### MVP primeiro (US3 + US4)

1. Fases 1 e 2 (esqueleto, validador, configuração, CI).
2. US3 → validar sozinha (independent test).
3. US4 → validar. Com isso, o "Rigor Técnico" (40%) está garantido até o M1 (13/11).

### Entrega incremental

1. M1 (13/11): Setup, Foundational, US3, US4.
2. M2 (20/11): US1, US5, US2. A aula fica completa.
3. M3 (24/11): Polish e entrega.

### Notes

- Cada tarefa vira uma sub-issue no GitHub (`T0NN: título`) dentro da issue-pai da sua seção (`scripts/sync_issues.py`). Tarefas já marcadas `[X]` são criadas fechadas, como registro.
- Commit e PR por tarefa ou por grupo pequeno de tarefas da mesma seção, com `Closes #N`.
- Ao terminar uma tarefa, marcar `[X]` aqui no mesmo PR.
