## Tarefa

Closes #<!-- número da sub-issue -->

**Tarefa(s):** `T0NN`. **Seção do notebook:** <!-- I, II, III, IV, V ou "fora do notebook" -->

## O que mudou

<!-- 2 ou 3 linhas -->

## Checklist

- [ ] Markdown **antes** de cada célula de código nova e comentário **depois** das saídas relevantes
- [ ] Texto em pt-BR, com termos técnicos definidos na primeira vez
- [ ] Nomes de variáveis conforme o [contrato](../specs/001-aula-kmeans-spotify/contracts/estrutura-notebook.md) (ou contrato atualizado neste PR)
- [ ] `python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb` → OK
- [ ] Notebook executado do zero sem erro (local ou Colab) e CI verde
- [ ] Tarefa marcada como `[X]` no `tasks.md`
- [ ] Se mudou alguma decisão: `spec.md`, `plan.md` ou `research.md` atualizados

## Itens da rubrica tocados

- [ ] Rigor técnico (40%): K-Means, StandardScaler, escolha de k
- [ ] Clareza da explicação (30%)
- [ ] Qualidade da aplicação (20%): tema e visualizações
- [ ] Organização do notebook (10%)
