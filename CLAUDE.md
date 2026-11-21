# CLAUDE.md

Instruções para o Claude Code neste repositório. O fluxo de trabalho completo (issues, branches,
regras do notebook) está no [CONTRIBUTING.md](CONTRIBUTING.md); a constituição do projeto, em
[.specify/memory/constitution.md](.specify/memory/constitution.md). Tudo em português do Brasil.

## Pull requests

Todo PR aberto neste repositório MUST:

- ter o autor como responsável (**assignee**): `WellingtonTorres`;
- estar vinculado ao GitHub Project da org **"Projeto Final - Algoritmo K-Means"** (Project 3);
- fechar as sub-issues das tarefas com uma linha `Closes #N` por issue e seguir o
  [template de PR](.github/pull_request_template.md).

```bash
gh pr create --base main --head <branch> \
  --assignee WellingtonTorres \
  --project "Projeto Final - Algoritmo K-Means" \
  --title "T0NN: ..." --body-file <arquivo>
```

Depois de criar, confira: `gh pr view <n> --json assignees,projectItems,closingIssuesReferences`.

## Notebook

- Branch por tarefa ou grupo de tarefas da mesma seção (`T013-T020-secao-iv`), um commit por tarefa,
  com a tarefa marcada `[X]` no `tasks.md` no mesmo commit.
- Antes do PR: `scripts/validar_notebook.py` OK e o notebook **executado do zero e salvo com as
  saídas** (`jupyter nbconvert --execute`), com os metadados do kernel no padrão do Colab
  (`kernelspec` `python3` / "Python 3").
- Todo número citado num comentário tem que bater com a saída executada, e toda descrição de
  gráfico tem que bater com a figura gerada (constituição V).
- Mudou uma decisão (k, features, nomes de variáveis)? Atualize `spec.md`, `research.md`,
  `data-model.md`, o contrato ou o `tasks.md` no mesmo PR.
