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

- **Decision** (revista em 2026-11-21, na implementação da Seção IV): **k = 7**. Varrer k = 1..10
  (inércia) e k = 2..10 (silhueta numa amostra de 10.000 pontos com `RANDOM_STATE`) e decidir
  pelos 3 critérios do FR-040, nesta ordem.
- **Rationale** (números da base limpa, 89.583 faixas):
  1. **Cotovelo**: inércia 806.247 → 632.596 → 561.059 → 504.715 → 455.853 → 414.123 → 376.640 →
     355.565 … para k = 1..8. Cada passo de k = 2 a k = 7 remove 9–11% da inércia; depois de
     k = 7 a queda cai para 4–6%. Não há joelho nítido: há uma dobra forte em k = 2 e outra, suave,
     em k = 7.
  2. **Silhueta**: k = 2 tem 0,26, mas dois grupos são genéricos demais para descrever perfis de
     som. Entre k ≥ 3, a maior é a de **k = 7 (0,196)**, contra 0,189 (k = 6) e 0,177 (k = 5). A
     ordem se repete em 5 amostras diferentes (médias 0,197 / 0,190 / 0,179). A silhueta é baixa em
     geral (< 0,2), típico de dados de áudio contínuos com grupos sobrepostos.
  3. **Interpretabilidade**: os 7 grupos têm perfis musicais claros (R4). Em relação a k = 5, k = 7
     separa a eletrônica instrumental (techno) e um grupo "ao vivo" dominado por pagode, sertanejo
     e samba. Com outras sementes do K-Means os grupos se repetem (ARI ≥ 0,99).
  - A previsão inicial (k = 5, com k = 6 como alternativa) foi feita antes de o FR-040 fixar a
    ordem dos critérios. Com a ordem fixada, os três critérios apontam para k = 7. O notebook MUST
    mostrar a ambiguidade da curva com honestidade.
- **Alternatives considered**: k = 5 (perfis mais simples, mas silhueta menor e sem o grupo "ao
  vivo"); k = 6 (intermediário); só o cotovelo (ambíguo demais); o método gap statistic (caro e
  fora do enunciado).

## R3. Custo computacional e amostragem

- **Decision**: o K-Means roda na base completa (`n_init=10`). Silhueta e gráficos de dispersão
  usam amostras de tamanho fixo, definidas como constantes na célula de configuração:
  `TAMANHO_AMOSTRA_SILHUETA = 10_000` e `TAMANHO_AMOSTRA_GRAFICOS = 6_000`, sempre com
  `RANDOM_STATE`. Uma única `amostra_idx` serve aos dois gráficos da Seção IV, para que mostrem os
  mesmos pontos.
- **Rationale**: um `fit` com k = 5 a 7 leva menos de 1 s e a varredura k = 1..10 leva cerca de 10 s
  localmente. A silhueta exata é O(n²) e, com 89 mil pontos, passaria de minutos e de GBs de
  memória. Com 10 mil pontos leva cerca de 1,2 s por k. Dispersão com 89 mil pontos vira um
  borrão. Tudo cabe com folga no limite de 5 minutos do SC-001.
- **Alternatives considered**: MiniBatchKMeans (desnecessário nesse volume e acrescenta um
  conceito extra); silhueta exata (inviável).

## R4. Perfis esperados com k = 7 (referência para a Seção V)

Numeração dos clusters com `RANDOM_STATE = 42`. Os percentuais dizem quanto das faixas do gênero
caem no cluster (cada gênero soma 100% entre os clusters).

| Cluster | Tamanho | Perfil (desvios da média) | Gêneros típicos |
|---|---|---|---|
| 0 Dançante/alegre | 27.523 (30,7%) | valence +0,86 · danceability +0,81 | reggaeton (85%), latino (83%), hip-hop (72%), funk (69%), forro (68%) |
| 1 Acústico/calmo | 18.082 (20,2%) | acousticness +1,06 · energy −1,02 | tango (78%), romance (77%), jazz (72%), mpb (32%) |
| 2 Eletrônica instrumental | 10.094 (11,3%) | instrumentalness +1,93 · acousticness −0,63 | minimal-techno (86%), detroit-techno (76%), techno (62%) |
| 3 Fala/comédia | 1.045 (1,2%) | speechiness +6,69 · liveness +2,32 | comedy (81%) |
| 4 Intenso/pesado | 20.162 (22,5%) | energy +0,71 · loudness +0,61 · tempo +0,62 · acousticness −0,74 | metalcore (85%), metal (72%), edm (38%) |
| 5 Ambiente/clássico | 6.464 (7,2%) | loudness −2,47 · instrumentalness +1,90 · energy −1,82 | new-age (78%), classical (74%), sleep (73%) |
| 6 Ao vivo | 6.213 (6,9%) | liveness +2,71 · energy +0,46 | pagode (50%), sertanejo (44%), samba (42%), mpb (28%) |

- **Decision**: o destaque brasileiro (FR-034) compara brazil, mpb, sertanejo, pagode, samba,
  forro e funk com os contrastes classical, metal, sleep, hip-hop, edm e comedy, num heatmap com a
  proporção de faixas do gênero em cada cluster (cada linha soma 1).
- **Rationale**: os contrastes "puxam" clusters distintos (classical/sleep → 5, metal → 4,
  comedy → 3, hip-hop → 0). Os gêneros brasileiros se dividem em três: forró e funk são dançantes
  (cluster 0); mpb se divide entre dançante, acústico e ao vivo; pagode, sertanejo e samba têm a
  maior parte no grupo "ao vivo", o que reflete o peso das gravações ao vivo nesses gêneros.

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

- **Decision** (revista em 2026-11-21): a célula de carga tenta duas fontes públicas, em ordem:
  `URL_DATASET` (Hugging Face) e `URL_DATASET_RESERVA`, uma cópia idêntica, byte a byte, guardada
  em `data/spotify_tracks.csv` e lida pelo `raw.githubusercontent.com` do repositório (SHA-256 e
  atribuição em `data/README.md`). Cada tentativa fica num try/except; se as duas falharem, uma
  mensagem em pt-BR com o link da página do dataset encerra a execução. O notebook entregue fica
  salvo com outputs (FR-004).
- **Rationale**: a URL do Hugging Face redireciona para uma CDN e funciona sem login (verificado
  em 2026-11-03 e 2026-11-07), mas o projeto não deve depender de um único serviço externo para
  ser reexecutado. São só 20 MB, a licença BSD permite redistribuir com atribuição, e a cópia
  continua sendo uma URL pública (constituição I). Testado: com o Hugging Face fora do ar, os dados
  vêm da reserva; com as duas fontes fora, aparece a mensagem.
- **Alternatives considered**: só a mensagem de erro (a aula deixaria de rodar se o Hugging Face
  caísse); ler a cópia por caminho local (não funciona no Colab aberto pelo link do GitHub, que
  não clona o repositório).
