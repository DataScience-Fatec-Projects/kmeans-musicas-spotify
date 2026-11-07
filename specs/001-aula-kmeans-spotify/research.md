# Research: Aula interativa de K-Means com músicas do Spotify

**Feature**: [spec.md](spec.md) | **Data**: 2026-11-07

Os números abaixo saíram de experimentos locais (Python 3.12, pandas e scikit-learn atuais) com o
CSV completo. São referência para o plano. Os valores definitivos são os que o notebook calcular.

## R1. Limpeza e unidade de treino

- **Decision**: remover nesta ordem: a linha com ausentes (1), as linhas idênticas (450) e as
  faixas com `tempo` = 0 (157). Isso deixa **113.392 pares (faixa, gênero)**. A base de treino é
  `drop_duplicates('track_id')`, com **89.583 faixas únicas**.
- **Rationale**: as 9 features de áudio são **idênticas** entre as cópias de uma mesma faixa (0
  divergências, verificado), então deduplicar não perde informação de áudio. Só `popularity`
  difere em 720 faixas, e ela não entra no treino. Uma faixa chega a ter até 9 gêneros. Treinar
  com as cópias daria peso extra a faixas multi-gênero.
- **Alternatives considered**: manter as cópias (distorce os centroides); ficar com o primeiro
  gênero (descartada na clarificação, porque enviesa a análise por gênero).

## R2. Escolha de k

- **Decision**: varrer k = 1..10 (inércia) e k = 2..10 (silhueta numa amostra de 10.000 pontos
  com `RANDOM_STATE`). Decidir combinando cotovelo, silhueta e interpretabilidade. Os
  experimentos indicam **k = 5** como o candidato mais forte (k = 6 é a alternativa).
- **Rationale**: a curva de inércia é suave (807.660 → 632.735 → 561.696 → 505.598 → 455.891 →
  414.346 … para k = 1..6), sem joelho nítido. A silhueta fica baixa (0,16 a 0,19 para k = 3..6),
  o que é típico de dados de áudio contínuos. Com k = 5 surgem 5 perfis musicais nítidos (R4).
  k = 6 só separa um grupo "ao vivo" (liveness alto). O notebook MUST mostrar essa ambiguidade
  com honestidade, porque ela é um bom gancho didático para as limitações.
- **Alternatives considered**: só o cotovelo (ambíguo demais); o método gap statistic (caro e
  fora do enunciado); fixar k por conhecimento de domínio sem mostrar a curva (viola o enunciado).

## R3. Custo computacional e amostragem

- **Decision**: o K-Means roda na base completa (`n_init=10`). Silhueta e gráficos de dispersão
  usam amostras de tamanho fixo, definidas como constantes na célula de configuração:
  `TAMANHO_AMOSTRA_SILHUETA = 10_000` e `TAMANHO_AMOSTRA_GRAFICOS = 6_000`, sempre com
  `RANDOM_STATE`. Uma única `amostra_idx` serve aos dois gráficos da Seção IV, para que mostrem os
  mesmos pontos.
- **Rationale**: um `fit` com k = 5 leva cerca de 0,3 s e a varredura k = 1..10 leva cerca de 10 s
  localmente. A silhueta exata é O(n²) e, com 89 mil pontos, passaria de minutos e de GBs de
  memória. Com 10 mil pontos leva cerca de 1,2 s por k. Dispersão com 89 mil pontos vira um
  borrão. Tudo cabe com folga no limite de 5 minutos do SC-001.
- **Alternatives considered**: MiniBatchKMeans (desnecessário nesse volume e acrescenta um
  conceito extra); silhueta exata (inviável).

## R4. Perfis esperados com k = 5 (referência para a Seção V)

| Cluster (exp.) | Tamanho | Perfil (escala original) | Gêneros típicos |
|---|---|---|---|
| Acústico/calmo | ~20,7 mil | energy 0,39 · acousticness 0,67 · loudness −10,5 dB | mpb, brazil (parte) |
| Fala/comédia | ~1,1 mil | speechiness 0,83 · liveness 0,67 | comedy (81%) |
| Intenso/pesado | ~26,8 mil | energy 0,82 · loudness −6,0 dB · valence 0,32 · tempo 136 | metal (73%) |
| Dançante/alegre | ~33,7 mil | danceability 0,69 · valence 0,69 · energy 0,73 | forro (83%), hip-hop (78%), funk (74%), samba (63%), pagode (59%), sertanejo (52%) |
| Instrumental/ambiente | ~7,3 mil | instrumentalness 0,79 · acousticness 0,82 · loudness −20,5 dB | sleep (84%), classical (74%) |

- **Decision**: o destaque brasileiro (FR-034) compara brazil, mpb, sertanejo, pagode, samba,
  forro e funk com os contrastes classical, metal, sleep, hip-hop, edm e comedy, num heatmap com a
  proporção de faixas do gênero em cada cluster (cada linha soma 1).
- **Rationale**: esses contrastes "puxam" clusters distintos e deixam a leitura imediata. Os
  gêneros brasileiros se dividem entre "dançante" e "acústico", o que rende boa discussão (MPB mais
  acústica, forró e funk mais dançantes).

## R5. Visualizações obrigatórias (FR-043)

- **Decision**:
  1. **Separação**: dispersão 2D das **duas features originais com maior dispersão entre os
     centroides padronizados**. O par é calculado no notebook e não fixado no código. Pontos
     coloridos por cluster, com amostra e `alpha`.
  2. **Centroides × pontos**: projeção PCA 2D (PC1 + PC2 explicam cerca de 48% da variância) com
     a amostra de pontos e os centroides projetados com marcador "X" grande e rótulo com o nome do
     cluster.
  3. Na Seção V: perfil dos clusters (heatmap dos centroides padronizados mais uma tabela na escala
     original) e heatmap gênero × cluster.
- **Rationale**: o item 1 segue o exemplo do enunciado com eixos interpretáveis. O item 2 mostra
  os centroides levando todas as 9 dimensões em conta. Com k ≥ 5, `speechiness` lidera a dispersão
  por causa do cluster pequeno de fala, e o notebook comenta isso ao escolher os eixos.
- **Alternatives considered**: só PCA (eixos difíceis de explicar); pairplot das 9 features (pesado
  e confuso); t-SNE/UMAP (biblioteca extra e fora do escopo, constituição VI).

## R6. Implementação "do zero" e complexidade (FR-013, FR-014)

- **Decision**: uma função `kmeans_do_zero(X, k, semente, max_iter, tol)` com numpy (cerca de 15
  linhas), sobre `make_blobs` com cerca de 150 pontos 2D. As iterações extras vêm de **blobs mais
  sobrepostos** (`cluster_std` maior), não de uma inicialização ruim, até aparecerem **pelo menos 3
  iterações**, mostradas numa grade de gráficos, um por iteração. A função também devolve os
  centroides iniciais e o número de iterações. A comparação com o scikit-learn parte **dos mesmos
  centroides iniciais** (`KMeans(init=centroides_iniciais, n_init=1)`), o que garante o mesmo
  resultado. Ela usa o Adjusted Rand Index (ARI), que ignora a numeração dos rótulos e deve dar
  1,0.
- **Rationale**: com `cluster_std=0.9` o algoritmo converge em 2 iterações e ARI = 1,0, o que é
  rápido demais para ilustrar. Uma inicialização ruim poderia cair num mínimo local diferente do
  scikit-learn (que usa k-means++ e várias inicializações) e quebrar o ARI = 1,0. Partir dos mesmos
  centroides elimina esse risco. O ARI resolve o caso de borda dos rótulos trocados.
- **Complexidade a apresentar**: atribuição O(n·k·d) e atualização O(n·d) por iteração, total
  O(n·k·d·i), memória O(n·d + k·d). Cotovelo: × |valores de k| × `n_init`. Silhueta exata: O(n²·d).
- **Evidência empírica determinística**: em vez de cronometrar, o que mudaria a cada execução e
  violaria a constituição IV, o notebook **conta os cálculos de distância** (n·k por iteração ×
  iterações) de `kmeans_do_zero` sobre `make_blobs` com `RANDOM_STATE` para n = 1.000, 2.000,
  4.000 e 8.000. Mostra a tabela e o gráfico "cálculos × n", com crescimento ≈ linear. Os tempos de
  relógio medidos na pesquisa (R3) podem ser citados no texto como referência fixa.

## R7. Ordem das células: imports antes da Seção I

- **Decision**: logo depois da capa vem uma célula curta "⚙️ Configuração do ambiente", com todos
  os imports, `RANDOM_STATE`, as versões e o estilo dos gráficos. A Seção II explica cada
  biblioteca numa tabela e apresenta a API do `KMeans`, referenciando essa célula.
- **Rationale**: a Seção I (do zero) já usa numpy e matplotlib. A constituição (IV) pede uma
  semente definida uma única vez no início. Repetir imports em várias seções confunde quem pega
  só uma issue.
- **Alternatives considered**: imports dentro da Seção II (a Seção I quebraria ao rodar em
  ordem); levar a implementação do zero para a Seção II (contraria a clarificação, que pediu na
  Seção I).

## R8. Ambiente e validação

- **Decision**: alvo = runtime padrão do Colab (Python 3.12, bibliotecas pré-instaladas, sem
  `%pip`). Validação local e em CI com Python 3.12 + `requirements.txt` (pandas, numpy,
  scikit-learn, matplotlib, seaborn, nbformat, nbconvert, ipykernel), sem fixar versões exatas,
  para acompanhar o Colab:
  - `scripts/validar_notebook.py` faz a checagem estrutural (contrato em
    [contracts/estrutura-notebook.md](contracts/estrutura-notebook.md));
  - `jupyter nbconvert --to notebook --execute` faz a execução de ponta a ponta;
  - o GitHub Actions roda as duas em todo PR que mexe em `notebooks/`.
- **Rationale**: transforma os portões da constituição (executa do zero, markdown antes do código,
  seções I–V) em verificação automática, o que serve para colaboradores novos e para o portfólio.
- **Alternatives considered**: testes pytest célula a célula (pesado para um notebook didático);
  só verificação manual no Colab (não escala para colaboradores).

## R9. Dataset indisponível

- **Decision**: a célula de carga envolve o `read_csv` num try/except que mostra uma mensagem em
  pt-BR com o link da página do dataset e relança o erro. O notebook entregue fica salvo com
  outputs (FR-004).
- **Rationale**: a URL do Hugging Face redireciona para uma CDN e funciona sem login (verificado
  em 2026-11-03 e 2026-11-07). Se cair, quem lê o link continua vendo os resultados salvos.
