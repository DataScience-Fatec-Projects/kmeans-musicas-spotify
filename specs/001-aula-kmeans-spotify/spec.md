# Feature Specification: Aula interativa de K-Means com músicas do Spotify

**Feature Branch**: `001-aula-kmeans-spotify`

**Created**: 2026-11-07

**Status**: Draft

**Input**: User description: "Notebook no Google Colab que funcione como uma aula completa sobre o uso do
K-Means em Ciência de Dados (Projeto Final de ICD-004, enunciado em `docs/enunciado.md`), aplicando o
algoritmo para agrupar músicas do Spotify pelas características de áudio (dataset
maharshipandya/spotify-tracks-dataset). O notebook segue as seções I–V do enunciado, é entregue por
link público do Colab e serve também como peça de portfólio."

## Contexto

O público principal da aula é **o professor** (que avalia pela rubrica) e **os colegas de turma** (que
nunca usaram K-Means). Quem visita o portfólio é um público secundário. O "usuário" de cada história é
quem lê a aula de cima para baixo no Colab.

Fatos do dataset levantados em 2026-11-07, para embasar requisitos e casos de borda:

| Fato | Valor |
|------|-------|
| Linhas × colunas | 114.000 × 20 (mais a coluna de índice) |
| Gêneros (`track_genre`) | 114, com 1.000 faixas cada antes da limpeza |
| `track_id` repetido (mesma faixa em vários gêneros) | 24.259 linhas, o que deixa 89.741 faixas únicas |
| Linhas idênticas | 450 |
| Valores ausentes | 1 linha (`artists`, `album_name`, `track_name`) |
| `tempo` = 0 (faixas sem batida detectável) | 157 |
| Features contínuas de áudio | danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence, tempo |
| Escalas | a maioria vai de 0 a 1, mas loudness vai de −49,5 a +4,5 dB e tempo de 0 a 243 BPM, o que justifica padronizar |
| Varredura de k = 1..10 (todas as faixas únicas, 9 features) | curva de inércia suave, sem "joelho" nítido. Leva ~10 s localmente |
| Silhueta (amostra de 10 mil) para k = 3..6 | 0,16 a 0,19, ou seja, clusters pouco separados |

## Clarifications

### Session 2026-11-07

- Q: A Seção I inclui uma implementação "do zero" do K-Means com análise de complexidade? → A: Sim.
  Implementação curta num exemplo 2D, comparada com o scikit-learn, com análise Big-O
  (FR-013, FR-014).
- Q: O agrupamento usa a base completa ou um recorte de gêneros? → A: Ambos. Treina com todas as
  faixas únicas e, na interpretação, destaca os gêneros brasileiros comparados com gêneros
  internacionais de contraste (FR-034, FR-053).
- Q: Quais features de áudio entram no K-Means? → A: As 9 contínuas (FR-035).
- Q: O que conta como "interativo" na aula, além de executar as células? → A: Células
  "experimente". São blocos com um parâmetro editável e a instrução "mude e rode de novo". Não há
  widgets nem gráficos que só aparecem executando (FR-007).
- Q: Como tratar faixas que aparecem em mais de um gênero na análise por gênero? → A: Rotular e
  devolver. O treino usa cada faixa uma única vez, e depois o rótulo do cluster volta para todas as
  linhas (faixa, gênero), então cada gênero mantém suas faixas na análise (FR-033, FR-053).

## User Scenarios & Testing *(mandatory)*

As histórias seguem a **ordem das seções do enunciado** (US1 = Seção I, … US5 = Seção V), para que
cada issue-pai no GitHub corresponda a uma seção do notebook. A prioridade (P1–P3) vem do peso na
rubrica, não da ordem de leitura.

### User Story 1 - Seção I: entender o que é K-Means antes de ver código (Priority: P2)

O leitor abre o notebook e, antes de qualquer código de análise com os dados reais, aprende:
- o que é aprendizado não supervisionado e em que ele difere do supervisionado;
- o que é clustering;
- como o K-Means funciona: inicialização, atribuição, atualização dos centroides e critério de parada,
  vendo o algoritmo implementado "do zero" num exemplo pequeno;
- quanto o algoritmo custa (complexidade), o que liga a aula à disciplina de Análise de Algoritmos;
- como avaliar o resultado: inércia e Método do Cotovelo.

**Why this priority**: compõe "Clareza da Explicação" (30%), mas o leitor só confia na teoria se a
parte prática (P1) estiver correta.

**Independent Test**: executar só a Seção I (ela usa dados de brinquedo, não o dataset). A
implementação do zero converge e coincide com o scikit-learn, e um colega que não conhece K-Means
consegue explicar com as próprias palavras os 4 passos do algoritmo e para que serve o cotovelo.

**Acceptance Scenarios**:

1. **Given** um leitor sem conhecimento prévio, **When** ele lê a Seção I, **Then** encontra a
   definição de aprendizado não supervisionado e de clustering, com pelo menos um exemplo do
   cotidiano.
2. **Given** a explicação do algoritmo, **When** o leitor chega ao critério de parada, **Then** os
   quatro passos foram apresentados em ordem, cada um com uma frase curta e ilustrados por uma
   implementação "do zero" num exemplo 2D pequeno, com as iterações visíveis.
3. **Given** a parte de avaliação, **When** o leitor termina a seção, **Then** sabe o que é inércia
   e como o Método do Cotovelo ajuda a escolher k.
4. **Given** a implementação do zero, **When** o leitor compara com o scikit-learn nos mesmos
   pontos, **Then** os agrupamentos coincidem (a menos da numeração dos rótulos) e há uma análise
   de complexidade em Big-O.

---

### User Story 2 - Seção II: conhecer as ferramentas usadas (Priority: P3)

O leitor vê quais bibliotecas Python a aula usa, para que serve cada uma e como o scikit-learn
expõe o K-Means (a classe de agrupamento, seus parâmetros principais e os atributos de resultado).

**Why this priority**: o enunciado pede, mas pesa pouco na nota e não tem risco técnico.

**Independent Test**: executar a célula de importações num runtime novo do Colab. Ela roda sem erro,
imprime as versões, e cada biblioteca tem uma linha explicando o papel dela na aula.

**Acceptance Scenarios**:

1. **Given** um runtime novo, **When** o leitor executa a célula de importações, **Then** não há erro
   e as versões das bibliotecas aparecem.
2. **Given** a apresentação do scikit-learn, **When** o leitor termina a seção, **Then** sabe o que
   significam os parâmetros principais (número de clusters, número de inicializações, semente) e
   os atributos de resultado (rótulos, centroides, inércia).

---

### User Story 3 - Seção III: conhecer o tema e preparar os dados (Priority: P1)

O leitor entende por que agrupar músicas é um problema interessante (playlists, recomendação,
descoberta de "climas" musicais), de onde vêm os dados (com link e licença) e o que significa cada
variável. Em seguida acompanha a preparação: carregar, tratar ausentes, duplicatas e valores
inválidos, escolher as features e padronizar, sempre com o porquê de cada decisão.

**Why this priority**: o "Rigor Técnico" (40%) depende de uma padronização correta e justificada.
Sem esta seção, a Seção IV não existe.

**Independent Test**: executar o notebook até o fim da Seção III. Os dados preparados têm o número
de linhas esperado, nenhum valor ausente nas features e média ≈ 0 e desvio ≈ 1 em cada feature
padronizada.

**Acceptance Scenarios**:

1. **Given** o notebook aberto no Colab, **When** a célula de carga roda, **Then** os dados vêm da
   URL pública, sem upload, e o notebook mostra formato, primeiras linhas e tipos.
2. **Given** a apresentação do dataset, **When** o leitor procura uma variável, **Then** encontra um
   dicionário com nome, significado em português, faixa de valores e se a variável entra no
   agrupamento.
3. **Given** os dados brutos, **When** a limpeza roda, **Then** o notebook mostra quantas linhas
   cada regra removeu (ausentes, duplicatas por faixa, `tempo` = 0) e explica cada regra.
4. **Given** as features escolhidas, **When** a padronização roda, **Then** o notebook mostra as
   escalas antes e depois e explica por que o K-Means, que se baseia em distância, precisa disso.
5. **Given** a escolha de features, **When** o leitor procura a justificativa, **Then** encontra por
   que cada feature entrou ou ficou de fora (por exemplo, `key`, `mode` e `time_signature` são
   categóricas e `track_genre` é reservada para a validação).

---

### User Story 4 - Seção IV: escolher k, treinar e visualizar os clusters (Priority: P1)

O leitor vê a curva do cotovelo, entende como k foi escolhido, acompanha o treino do K-Means com os
dados padronizados e obtém centroides e rótulos. Por fim, vê pelo menos duas visualizações
distintas: uma com a separação dos clusters e outra com os centroides em relação aos pontos.

**Why this priority**: é o núcleo do "Rigor Técnico" (40%) e da "Qualidade da Aplicação" (20%).

**Independent Test**: executar o notebook até o fim da Seção IV. Surgem o gráfico do cotovelo, o
valor de k justificado, um rótulo de cluster para cada faixa, k centroides e os dois gráficos
exigidos. Uma segunda execução produz os mesmos números.

**Acceptance Scenarios**:

1. **Given** os dados padronizados, **When** o cotovelo roda para um intervalo de k, **Then** o
   gráfico de inércia × k aparece e um texto justifica o k escolhido. Como a curva é suave, a
   justificativa usa também um critério complementar (silhueta em amostra) e a interpretabilidade.
2. **Given** o k escolhido, **When** o modelo é treinado, **Then** o notebook mostra a quantidade de
   faixas em cada cluster e os centroides.
3. **Given** o modelo treinado, **When** a visualização de separação roda, **Then** aparece um
   gráfico de dispersão 2D com pontos coloridos por cluster e eixos nomeados.
4. **Given** o modelo treinado, **When** a visualização de centroides roda, **Then** os centroides
   aparecem destacados sobre os pontos (marcador distinto e legenda).
5. **Given** duas execuções completas do notebook, **When** os resultados são comparados, **Then**
   tamanhos de cluster, centroides e gráficos são idênticos.

---

### User Story 5 - Seção V: interpretar os grupos e concluir (Priority: P2)

O leitor descobre o que cada cluster significa em termos musicais:
- o perfil em escala original;
- um nome descritivo sustentado por números;
- exemplos de faixas e artistas;
- os gêneros mais frequentes em cada cluster, que foram usados só na validação.

Depois lê as limitações do K-Means neste problema e as sugestões de próximos passos.

**Why this priority**: "Clareza" (30%) e "Qualidade da Aplicação" (20%). É a parte que dá sentido
de negócio à aula, mas depende das Seções III e IV.

**Independent Test**: executar o notebook até o fim. Cada cluster tem nome, perfil numérico,
exemplos e gêneros predominantes, e há uma lista de limitações e de próximos passos.

**Acceptance Scenarios**:

1. **Given** os clusters treinados, **When** o leitor lê a interpretação, **Then** cada cluster tem
   um nome descritivo e os valores (na escala original) que o justificam.
2. **Given** os rótulos de cluster, **When** o cruzamento com `track_genre` roda, **Then** aparece
   uma tabela ou gráfico com os gêneros predominantes por cluster e um texto avaliando se os grupos
   fazem sentido musical.
3. **Given** os gêneros brasileiros (brazil, mpb, sertanejo, pagode, samba, forro, funk), **When**
   o leitor chega ao destaque, **Then** vê em que clusters cada um cai, comparado a gêneros
   internacionais de contraste, com um comentário.
4. **Given** a conclusão, **When** o leitor termina, **Then** encontra pelo menos 3 limitações do
   K-Means ligadas a este problema e pelo menos 2 próximos passos concretos.

---

### Edge Cases

- **Faixa repetida em vários gêneros** (24.259 linhas): a faixa conta uma única vez no treino.
  Depois o rótulo do cluster volta para todas as linhas (faixa, gênero), então uma faixa que está
  em `mpb` e em `brazil` conta nos dois gêneros na análise e nenhum gênero perde faixas.
- **Linhas idênticas e linha com ausentes**: são removidas. O notebook mostra a contagem antes e
  depois.
- **`tempo` = 0** (157 faixas, geralmente faixas de fala, ruído ou silêncio): são tratadas como
  valor inválido e removidas, com a contagem mostrada.
- **Outliers de escala** (loudness até −49,5 dB, duração de até 87 min): a padronização evita que
  uma feature domine a distância, e os outliers são discutidos nas limitações.
- **Curva do cotovelo sem joelho nítido**: o notebook mostra a ambiguidade em vez de esconder e
  usa um critério complementar mais a interpretabilidade para decidir.
- **Cluster muito pequeno** (nos testes, apareceu um grupo de ~1.000 faixas com muita fala para
  k ≥ 5): se aparecer, ele é interpretado e não descartado em silêncio.
- **URL do dataset indisponível**: a célula de carga mostra uma mensagem clara com a fonte
  original. O notebook já salvo com outputs continua legível mesmo sem executar.
- **Execução lenta no Colab gratuito**: nenhuma etapa obrigatória pode passar de 2 minutos. As
  métricas caras (silhueta) usam amostra.
- **Implementação do zero vs. scikit-learn com rótulos trocados**: a numeração dos clusters é
  arbitrária, então a comparação usa uma métrica que ignora a numeração ou alinha os rótulos antes.

## Requirements *(mandatory)*

### Functional Requirements

**Estrutura e entrega**

- **FR-001**: O notebook MUST começar com uma capa: título da aula, disciplina, professor, nome
  completo de todos os integrantes, data e link do repositório.
- **FR-002**: O notebook MUST ter as seções I a V do enunciado, nessa ordem e com os títulos do
  enunciado, e um sumário no início.
- **FR-003**: O notebook MUST rodar do zero com "Executar tudo" num runtime padrão do Google Colab,
  sem upload, login ou passo manual.
- **FR-004**: A versão entregue MUST ficar salva com os outputs, para que o link público mostre os
  resultados sem precisar executar.
- **FR-005**: Toda célula de código MUST vir depois de um markdown explicando o objetivo dela, e
  toda saída relevante MUST ser comentada.
- **FR-006**: Todo texto MUST estar em português do Brasil.
- **FR-007**: A interatividade MUST vir de células "🧪 Experimente". São blocos com um parâmetro
  editável no topo e uma instrução do que mudar e o que observar. São **4 blocos obrigatórios**: I.3
  (k e semente do exemplo de brinquedo), IV.2 (outro valor de k), IV.4 (com e sem padronização) e
  V.3 (gêneros à escolha do leitor). Todos os gráficos MUST ser estáticos, para aparecerem no
  GitHub e no link sem executar. Widgets e gráficos que dependem de execução ficam fora do escopo.

**Seção I — Introdução**

- **FR-010**: MUST explicar aprendizado não supervisionado (em contraste com o supervisionado) e
  clustering, com exemplos.
- **FR-011**: MUST descrever os passos do K-Means (inicialização, atribuição, atualização dos
  centroides, critério de parada), com uma ilustração.
- **FR-012**: MUST apresentar inércia e Método do Cotovelo, e citar pelo menos um critério
  complementar (silhueta).
- **FR-013**: MUST trazer uma implementação "do zero" do K-Means em poucas linhas, num conjunto
  pequeno de pontos 2D, mostrando visualmente as iterações (atribuição → atualização) até a parada,
  e comparar o resultado com o do scikit-learn nos mesmos pontos.
- **FR-014**: MUST trazer uma análise de complexidade do K-Means, ligando o projeto à disciplina:
  custo por iteração O(n·k·d), custo total O(n·k·d·i) e memória O(n·d + k·d). Também MUST explicar
  por que a varredura do cotovelo multiplica esse custo pelo número de valores de k testados e
  por que a silhueta exata é O(n²), o que justifica usar amostra.

**Seção II — Ferramentas**

- **FR-020**: MUST listar as bibliotecas usadas, com uma frase sobre o papel de cada uma.
- **FR-021**: MUST apresentar como o scikit-learn implementa o K-Means: a classe, os parâmetros
  principais e os atributos de resultado.
- **FR-022**: MUST imprimir as versões das bibliotecas e definir uma única semente aleatória para
  todo o notebook.

**Seção III — Tema e dados**

- **FR-030**: MUST apresentar o tema e a motivação (para que serve agrupar músicas).
- **FR-031**: MUST citar a origem do dataset com link e licença.
- **FR-032**: MUST trazer um dicionário de variáveis: nome, significado em pt-BR, faixa de valores
  e se entra no agrupamento.
- **FR-033**: MUST tratar ausentes, linhas idênticas e `tempo` = 0, mostrando a contagem afetada
  por cada regra. Também MUST montar a base de treino com uma linha por faixa (`track_id` único),
  explicando por que treinar com a mesma faixa repetida distorceria os centroides, e guardar a
  tabela (faixa, gênero) para a análise por gênero.
- **FR-034**: O agrupamento MUST usar todas as faixas únicas depois da limpeza (≈ 89,6 mil,
  89.583 na pesquisa, todos os 114 gêneros). A interpretação (Seção V) MUST dar destaque aos gêneros brasileiros presentes
  no dataset (brazil, mpb, sertanejo, pagode, samba, forro e funk): mostrar em que clusters eles
  caem e comparar com alguns gêneros internacionais de contraste.
- **FR-035**: O agrupamento MUST usar as 9 features contínuas de áudio: danceability, energy,
  loudness, speechiness, acousticness, instrumentalness, liveness, valence e tempo. As categóricas
  (`key`, `mode`, `time_signature`) e as de contexto (`popularity`, `duration_ms`, `explicit`)
  ficam de fora, com justificativa escrita.
- **FR-036**: MUST padronizar as features com StandardScaler, mostrando as escalas antes e depois
  e explicando por que isso é necessário para o K-Means.

**Seção IV — Implementação**

- **FR-040**: MUST rodar o Método do Cotovelo num intervalo de k que inclua pelo menos k = 1..10 e
  justificar o k escolhido por escrito.
- **FR-041**: MUST complementar o cotovelo com a silhueta calculada numa amostra de tamanho e
  semente fixos.
- **FR-042**: MUST instanciar o modelo com o k escolhido e a semente fixa, treinar com os dados
  padronizados e mostrar os centroides e a distribuição dos rótulos.
- **FR-043**: MUST ter pelo menos duas visualizações distintas: (a) separação dos clusters num
  gráfico de dispersão 2D colorido por rótulo, usando as duas features que mais diferenciam os
  clusters (ou componentes principais, se justificado); (b) centroides destacados em relação aos
  pontos.
- **FR-044**: Os gráficos MUST ter título, eixos nomeados em pt-BR e legenda. Os de dispersão MUST
  usar transparência ou amostragem para não virar um borrão com dezenas de milhares de pontos.

**Seção V — Análise e conclusão**

- **FR-050**: MUST mostrar o perfil de cada cluster na escala original das variáveis (tabela e um
  gráfico comparativo).
- **FR-051**: MUST dar a cada cluster um nome descritivo e citar os valores que o justificam.
- **FR-052**: MUST mostrar exemplos de faixas e artistas de cada cluster.
- **FR-053**: MUST cruzar os clusters com `track_genre` (que não foi usada no treino) e comentar se
  os grupos fazem sentido musical. O cruzamento MUST usar todas as linhas (faixa, gênero), com o
  rótulo de cada faixa propagado para todos os gêneros em que ela aparece. Com 114 gêneros, a visualização MUST se concentrar nos gêneros
  mais frequentes de cada cluster e no destaque aos gêneros brasileiros (FR-034), e não numa tabela
  com todos os gêneros.
- **FR-054**: MUST listar pelo menos 3 limitações do K-Means aplicadas a este problema (k fixo,
  clusters esféricos de tamanho parecido, sensibilidade a outliers e escala, clusters pouco
  separados) e pelo menos 2 próximos passos (outros algoritmos como DBSCAN, GMM ou hierárquico,
  redução de dimensionalidade, outras features).

### Key Entities

- **Faixa (track)**: uma música do dataset. Tem identificador, artistas, álbum, nome, popularidade,
  duração, se é explícita, 9 características contínuas de áudio, 3 características musicais
  categóricas (tom, modo e compasso). Na base de treino, cada faixa aparece uma única vez.
- **Associação faixa–gênero**: o par (faixa, `track_genre`) da fonte. Uma faixa pode ter vários
  gêneros. Cada par recebe o rótulo de cluster da sua faixa e é a unidade usada na análise por
  gênero.
- **Feature de áudio**: uma característica numérica da faixa usada para medir semelhança (por
  exemplo, energia, dançabilidade, acústica).
- **Cluster**: grupo de faixas parecidas, criado pelo algoritmo. Tem um rótulo numérico, um
  centroide, um tamanho, um perfil na escala original e um nome descritivo dado na interpretação.
- **Gênero (track_genre)**: categoria atribuída pela fonte. Não entra no agrupamento e serve só
  para validar e interpretar os clusters.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: O notebook executa do início ao fim num runtime novo do Colab gratuito sem nenhum
  erro, em menos de 5 minutos.
- **SC-002**: 100% dos itens obrigatórios do enunciado (seções I–V e subitens) estão presentes e
  podem ser localizados pelo sumário.
- **SC-003**: Um colega de turma que nunca usou K-Means, depois de ler a aula, consegue explicar os
  passos do algoritmo e por que padronizar os dados, verificado com pelo menos 1 leitor-teste antes
  da entrega.
- **SC-004**: Duas execuções completas produzem os mesmos tamanhos de cluster e os mesmos valores
  de centroide.
- **SC-005**: Cada cluster tem um nome e pelo menos 3 valores numéricos que o justificam, e o leitor
  consegue associar pelo menos 2 exemplos de faixas a cada perfil.
- **SC-006**: O link público abre o notebook com todos os gráficos e tabelas visíveis sem executar
  nada.
- **SC-007**: Entrega feita até 24/11/2026 23:59.

## Assumptions

- O público-alvo tem noções básicas de Python e estatística descritiva, mas não de aprendizado de
  máquina.
- O runtime padrão do Colab (Python 3.12 em nov/2026) já traz pandas, numpy, matplotlib, seaborn e
  scikit-learn. Esses nomes vêm do próprio enunciado, então são requisito e não escolha de
  implementação.
- `popularity`, `duration_ms` e `explicit` descrevem contexto e não "som". Ficam fora do
  agrupamento e são usadas na interpretação.
- Lista de gêneros brasileiros do destaque: brazil, mpb, sertanejo, pagode, samba, forro e funk.
  Os rótulos são da fonte, e `funk` pode misturar o funk norte-americano com o brasileiro, o que o
  notebook aponta.
- A API de audio-features do Spotify foi descontinuada em nov/2024. O projeto usa só o dataset
  estático.
- App Streamlit, front-end Angular e comparação formal com outros algoritmos estão fora do escopo
  desta feature (backlog pós-entrega).
- Por enquanto há um integrante. A capa e a lista de integrantes são atualizadas se outros
  entrarem.
