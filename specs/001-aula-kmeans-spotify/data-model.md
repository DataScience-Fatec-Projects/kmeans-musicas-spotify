# Data Model: Aula interativa de K-Means com músicas do Spotify

**Feature**: [spec.md](spec.md) | **Data**: 2026-11-07

As entidades viram **variáveis do notebook** com nomes fixos. É o que permite que pessoas diferentes
trabalhem em seções diferentes sem quebrar as outras (ver
[contracts/estrutura-notebook.md](contracts/estrutura-notebook.md)).

## Fluxo

```text
URL_DATASET ──read_csv──► df_bruto (114.000 × 20)
        │ remove ausentes, linhas idênticas e tempo = 0
        ▼
   df_pares (≈113.392 pares faixa–gênero) ──drop_duplicates('track_id')──► df_faixas (≈89.583)
        │                                                                   │ FEATURES (9)
        │                                                                   ▼
        │                                              scaler.fit_transform ► X (≈89.583 × 9)
        │                                                                   │ KMeans(K_ESCOLHIDO)
        │                                                                   ▼
        │                                     modelo ─► rotulos, centroides_padronizados
        │                                                                   │ inverse_transform
        │                                                                   ▼
        │                                     centroides_originais, perfil_clusters, NOMES_CLUSTERS
        ▼  merge por track_id
   df_pares['cluster'] ──► genero_x_cluster (proporções; destaque BR + contrastes)
```

## Entidades

### Faixa: `df_faixas`
Uma linha por `track_id`. É a **base de treino**.

| Campo | Tipo | Faixa observada | Papel |
|---|---|---|---|
| track_id | texto | único | chave |
| artists, album_name, track_name | texto | — | exemplos na Seção V |
| popularity | int | 0–100 | contexto (não treina) |
| duration_ms | int | 8.586 ms – 87 min | contexto (não treina) |
| explicit | bool | — | contexto (não treina) |
| danceability, energy, speechiness, acousticness, instrumentalness, liveness, valence | float | 0–1 | **feature de treino** |
| loudness | float | −49,5 a +4,5 dB | **feature de treino** |
| tempo | float | >0 a 243 BPM (sem os zeros) | **feature de treino** |
| key, mode, time_signature | int | categóricas | fora (justificado) |
| cluster | int | 0..K−1 | resultado (`rotulos`) |

**Regras de validação**
- `track_id` único em `df_faixas`.
- Nenhum ausente nas `FEATURES`.
- `tempo` > 0.
- As features de uma faixa são iguais em todas as suas cópias de `df_pares` (verificado na
  pesquisa e reafirmado no notebook com um `assert`).

### Associação faixa–gênero: `df_pares`
Uma linha por par (faixa, `track_genre`). Uma faixa tem de 1 a 9 gêneros.
- Recebe a coluna `cluster` por merge com `df_faixas` via `track_id` (FR-053).
- É a unidade de contagem da análise por gênero. Cada gênero mantém cerca de 1.000 faixas, menos
  as removidas na limpeza.

### Matriz padronizada: `X` e `scaler`
- `X = scaler.fit_transform(df_faixas[FEATURES])`. Depois disso, a média de cada coluna é ≈ 0 e o
  desvio-padrão ≈ 1 (verificado com uma tabela, FR-036).
- `scaler` é guardado para reverter os centroides (`inverse_transform`).

### Modelo e clusters: `modelo`, `rotulos`, `centroides_*`
- `modelo = KMeans(n_clusters=K_ESCOLHIDO, n_init=10, random_state=RANDOM_STATE).fit(X)`
- `rotulos = modelo.labels_`, com um valor por faixa de `df_faixas`. Ficam guardados também em
  `df_faixas['cluster']` (IV.2), que a Seção V usa para exemplos e para o merge.
- `centroides_padronizados = modelo.cluster_centers_` (K × 9)
- `centroides_originais = DataFrame(scaler.inverse_transform(...), columns=FEATURES)`
- `perfil_clusters`: tabela por cluster com tamanho, % do total e centroides originais (V.1). A
  coluna `nome` entra na V.2, depois que `NOMES_CLUSTERS` existe.
- `NOMES_CLUSTERS`: dicionário {rótulo: nome descritivo}. É escrito **depois** de olhar o perfil
  e cada nome MUST citar pelo menos 3 valores que o justificam (SC-005).

### Gênero × cluster: `genero_x_cluster`
- `pd.crosstab(df_pares.track_genre, df_pares.cluster, normalize='index')`
- `GENEROS_BR = ['brazil', 'mpb', 'sertanejo', 'pagode', 'samba', 'forro', 'funk']`
- `GENEROS_CONTRASTE = ['classical', 'metal', 'sleep', 'hip-hop', 'edm', 'comedy']`

### Amostras (constantes na configuração)
- `TAMANHO_AMOSTRA_SILHUETA = 10_000`: silhueta na IV.1 (a exata é O(n²)).
- `TAMANHO_AMOSTRA_GRAFICOS = 6_000`: `amostra_idx`, sorteada uma vez com `RANDOM_STATE` na IV.3
  e reaproveitada na IV.4. É o bastante para ver a forma de cada cluster sem virar um borrão.

### Exemplo de brinquedo (Seção I): `X_brinquedo`
- `make_blobs` com cerca de 150 pontos 2D e `random_state=RANDOM_STATE`. Usado só na
  implementação do zero, na comparação com o scikit-learn (ARI) e nas células "Experimente".

## Estados

Não há ciclo de vida persistente. A única "transição" é a sequência de execução do notebook:
`bruto → limpo → treino → padronizado → agrupado → interpretado`. Cada etapa depende da anterior
estar executada. Por isso as seções III → IV → V são sequenciais, enquanto I e II são
independentes dos dados.
