# Contrato: estrutura do notebook `notebooks/aula_kmeans_spotify.ipynb`

**Feature**: [../spec.md](../spec.md)

Este contrato é a "interface" do produto, ou seja, o que o leitor (e o avaliador) encontra, e o que
cada seção **recebe** e **entrega** em variáveis. `scripts/validar_notebook.py` verifica
automaticamente os itens marcados com ✔auto.

## 1. Esqueleto de títulos (markdown)

Os títulos de nível 1 e 2 são fixos. Os de nível 3 podem ser ajustados.

```text
# Aula: K-Means em Ciência de Dados — agrupando músicas do Spotify      (capa)
## Sumário
## ⚙️ Configuração do ambiente
## I. Introdução e Contextualização                                     ✔auto
### I.1 Aprendizado não supervisionado
### I.2 Clustering (agrupamento)
### I.3 Como o K-Means funciona — implementado do zero
### I.4 Quanto custa? Complexidade do K-Means
### I.5 Como avaliar: inércia, Método do Cotovelo e silhueta
## II. Ferramentas de Trabalho (Scikit-learn e Python)                  ✔auto
### II.1 Bibliotecas e importações
### II.2 O KMeans do scikit-learn
## III. Escolha do Tema e Preparação dos Dados                          ✔auto
### III.1 Tema: por que agrupar músicas?
### III.2 O dataset: origem e dicionário de variáveis
### III.3 Carregamento e limpeza
### III.4 Escolha das features
### III.5 Padronização com StandardScaler
## IV. Implementação e Aplicação Prática                                ✔auto
### IV.1 Definindo k: Método do Cotovelo (e silhueta)
### IV.2 Treinando o K-Means
### IV.3 Visualizando a separação dos clusters
### IV.4 Centroides em relação aos pontos
## V. Análise e conclusão                                               ✔auto
### V.1 Perfil de cada cluster
### V.2 Dando nome aos grupos
### V.3 Clusters × gêneros (com destaque para a música brasileira)
### V.4 Limitações do K-Means
### V.5 Próximos passos
## Referências
```

✔auto: os 5 títulos `## I.` … `## V.` existem, nesta ordem, com exatamente esses textos. Eles
são copiados do enunciado, inclusive as maiúsculas e minúsculas ("V. Análise e conclusão").

## 2. Regras de células

| Regra | Verificação |
|---|---|
| A primeira célula é markdown e contém "Integrantes" seguido de pelo menos 1 nome | ✔auto |
| Toda célula de código é precedida por uma célula de markdown (não vazia) | ✔auto |
| `RANDOM_STATE =` aparece em exatamente 1 célula de código | ✔auto |
| `URL_DATASET` aponta para o Hugging Face e não há `files.upload` / `drive.mount` | ✔auto |
| Pelo menos 4 células markdown começando com "🧪 Experimente" (uma em I.3, IV.2, IV.4 e V.3) | ✔auto |
| Nenhum output de erro (`output_type == "error"`) salvo | ✔auto |
| Nenhum widget ou plotly (`ipywidgets`, `plotly`) | ✔auto |
| Toda saída relevante é comentada logo depois | revisão no PR |

## 3. Variáveis por seção (o que cada uma recebe e entrega)

| Seção | Recebe | Entrega (nomes fixos) |
|---|---|---|
| ⚙️ Configuração | — | imports, `RANDOM_STATE = 42`, `URL_DATASET`, `FEATURES` (9), `GENEROS_BR`, `GENEROS_CONTRASTE`, `TAMANHO_AMOSTRA_SILHUETA = 10_000`, `TAMANHO_AMOSTRA_GRAFICOS = 6_000`, estilo dos gráficos |
| I | `RANDOM_STATE` | `X_brinquedo`, `kmeans_do_zero()` (local à seção) |
| II | — | nenhuma nova (explica a API) |
| III | `URL_DATASET`, `FEATURES` | `df_bruto`, `df_pares`, `df_faixas`, `scaler`, `X` |
| IV | `X`, `df_faixas`, `RANDOM_STATE`, `TAMANHO_AMOSTRA_*` | `inercias`, `silhuetas`, `K_ESCOLHIDO`, `modelo`, `rotulos`, `df_faixas['cluster']`, `centroides_padronizados`, `amostra_idx` |
| V | `df_faixas` (com `cluster`), `df_pares`, `rotulos`, `centroides_padronizados`, `scaler`, `modelo` | `centroides_originais`, `perfil_clusters`, `NOMES_CLUSTERS`, `df_pares['cluster']`, `genero_x_cluster` |

Quem altera um nome desta tabela MUST atualizar este contrato no mesmo PR (constituição VII).

## 4. Células "🧪 Experimente" (FR-007): 4 obrigatórias

| Onde | Parâmetro editável | O que observar |
|---|---|---|
| I.3 | `K_BRINQUEDO` e `SEMENTE_INICIAL` | inicializações diferentes mudam as iterações e às vezes o resultado (mínimo local) |
| IV.2 | `K_TESTE` | como os perfis se dividem ou se fundem com mais ou menos clusters |
| IV.4 (fim) | `USAR_PADRONIZACAO = True/False` | sem padronizar, `tempo` e `loudness` dominam a distância e os clusters mudam |
| V.3 | `GENEROS_EXTRA` | onde caem os gêneros que o leitor escolher |
