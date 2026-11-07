# Quickstart: validar a aula de K-Means

**Feature**: [spec.md](spec.md)

## A. Validação oficial (Colab, como o professor vai abrir)

1. Abrir
   `https://colab.research.google.com/github/DataScience-Fatec-Projects/kmeans-musicas-spotify/blob/main/notebooks/aula_kmeans_spotify.ipynb`.
2. **Sem executar**, conferir que os gráficos e tabelas aparecem (SC-006).
3. Ir em "Ambiente de execução → Desconectar e excluir ambiente de execução" e depois em
   "Executar tudo".
4. Esperado:
   - nenhuma célula com erro;
   - tempo total < 5 min (SC-001);
   - as versões impressas na célula de configuração.

## B. Validação local (antes de abrir PR)

```bash
uv venv --python 3.12 .venv
uv pip install -r requirements.txt
# checagem estrutural (contrato em contracts/estrutura-notebook.md)
.venv/Scripts/python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb
# execução de ponta a ponta (gera um arquivo novo e não sobrescreve o original)
.venv/Scripts/jupyter nbconvert --to notebook --execute \
  --ExecutePreprocessor.timeout=120 \
  --output /tmp/aula_executada.ipynb notebooks/aula_kmeans_spotify.ipynb
```

No Linux/Mac use `.venv/bin/` no lugar de `.venv/Scripts/`.

Esperado:
- o `validar_notebook.py` termina com `OK` e código 0;
- o `nbconvert` termina sem `CellExecutionError`.

## C. Cenários de aceite por seção

| Seção | Como verificar | Resultado esperado |
|---|---|---|
| I | executar até I.5 | o do zero converge em ≥ 3 iterações visíveis; ARI com o scikit-learn (mesma inicialização) = 1,0; tabela de complexidade e contagem de cálculos × n presentes |
| II | executar a configuração e II | versões impressas; tabela de bibliotecas; parâmetros do `KMeans` explicados |
| III | executar até III.5 | `df_faixas` com ≈ 89,6 mil linhas; contagens removidas por regra; médias ≈ 0 e desvios ≈ 1 em `X` |
| IV | executar até IV.4 | cotovelo k = 1..10, silhueta k = 2..10; `K_ESCOLHIDO` justificado; tabela de tamanhos e centroides; ≥ 2 gráficos (separação e centroides) |
| V | executar tudo | um nome por cluster com ≥ 3 valores; exemplos de faixas; heatmap gênero × cluster com destaque BR; ≥ 3 limitações e ≥ 2 próximos passos |
| Reprodutibilidade | executar tudo 2× | tamanhos dos clusters, centroides e gráficos idênticos (SC-004) |

## D. Leitor-teste (SC-003)

Antes da entrega, uma pessoa que não conhece K-Means lê a aula no link e responde, sem consultar:
1. Quais são os passos do K-Means?
2. Por que padronizar os dados antes?
3. O que o cotovelo indica?

O resultado fica registrado na issue de entrega.
