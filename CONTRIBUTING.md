# Como contribuir

Este guia é para quem chega no meio do caminho e quer pegar uma tarefa sem precisar perguntar
nada. Leia uma vez e siga o fluxo.

## 1. Entenda o projeto em 5 minutos

1. [`docs/enunciado.md`](docs/enunciado.md): o que a disciplina pede.
2. [`.specify/memory/constitution.md`](.specify/memory/constitution.md): as regras do projeto (7 princípios).
3. [`specs/001-aula-kmeans-spotify/spec.md`](specs/001-aula-kmeans-spotify/spec.md): o que a aula precisa ter.
4. [`contracts/estrutura-notebook.md`](specs/001-aula-kmeans-spotify/contracts/estrutura-notebook.md):
   títulos, regras de célula e **nomes de variáveis** de cada seção.

## 2. Pegue uma tarefa

1. Abra o [board](https://github.com/orgs/DataScience-Fatec-Projects/projects/3) e escolha uma
   sub-issue em **Ready** (`T0NN: …`).
2. **Uma pessoa por seção do notebook por vez.** Se a issue-pai da seção (ex.: "Seção IV – …")
   não tiver ninguém atribuído, atribua a você. Se tiver, escolha outra seção ou combine com a
   pessoa.
3. Atribua a sub-issue a você e mova para **In progress**.

> Tarefas com a label `paralelizavel` não dependem das anteriores da mesma fase.
> As Seções I e II não dependem dos dados e podem andar em paralelo com III → IV → V.

## 3. Faça a tarefa

```bash
git switch main && git pull
git switch -c T013-cotovelo          # branch = id da tarefa + resumo
```

Edite `notebooks/aula_kmeans_spotify.ipynb`:

- **Localmente**: Jupyter ou VS Code.
- **No Colab**: abra pelo badge do README e, ao terminar, use *Arquivo → Salvar uma cópia no
  GitHub*, escolhendo **a sua branch**.

Regras do notebook (vêm da constituição e o validador confere):

| Regra | Por quê |
|---|---|
| Markdown **antes** de toda célula de código e comentário **depois** de toda saída relevante | o notebook é uma aula |
| Texto em português do Brasil, com termo técnico definido na primeira vez | público: colegas de turma |
| Use os **nomes de variáveis do contrato** (`df_faixas`, `X`, `modelo`…) | outra pessoa depende deles na seção seguinte |
| Nada de nova semente: use `RANDOM_STATE` | reprodutibilidade |
| Nada de upload, Drive, widgets ou plotly | tem que rodar e aparecer no link público |

Se precisar mudar uma decisão (k, features, um nome de variável), atualize o artefato
correspondente (`spec.md`, `plan.md`, contrato ou `tasks.md`) **no mesmo PR**.

## 4. Valide antes do PR

```bash
uv venv --python 3.12 .venv && uv pip install -r requirements.txt
.venv/Scripts/python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb
.venv/Scripts/jupyter nbconvert --to notebook --execute --output aula_executada.ipynb notebooks/aula_kmeans_spotify.ipynb
```

No Linux/Mac use `.venv/bin/`. Mais detalhes no
[`quickstart.md`](specs/001-aula-kmeans-spotify/quickstart.md).

## 5. Abra o PR

- Título: `T013: cotovelo na IV.1`
- Descrição: `Closes #<número da sub-issue>`, depois o template com o checklist da rubrica.
- Marque a tarefa como `[X]` no [`tasks.md`](specs/001-aula-kmeans-spotify/tasks.md).
- O CI executa o notebook do zero. PR só entra com o CI verde.
- Mova a sub-issue para **In review**. Ao fazer o merge, ela fecha sozinha.

**Conflitos em `.ipynb`**: como cada pessoa fica numa seção, eles são raros. Se acontecer, mantenha
a versão da `main`, reaplique a sua mudança e rode tudo de novo.

## 6. Usando o spec-kit (opcional)

O repo tem os comandos do spec-kit para o **Claude Code** em `.claude/skills/`. Abra o Claude Code na
raiz do repo e use:

| Comando | Quando |
|---|---|
| `/speckit-implement` | implementar tarefas do `tasks.md` |
| `/speckit-converge` | conferir notebook × spec e acrescentar tarefas que faltam |
| `/speckit-analyze` | checar a consistência entre spec, plano e tarefas |

Quem não usa agente de IA pode ignorar esta seção. As issues são autoexplicativas.

## 7. Sincronizando tarefas novas com o board

Se o `tasks.md` ganhar tarefas novas (à mão ou pelo `/speckit-converge`):

```bash
python scripts/sync_issues.py --dry-run   # confira o que será criado
python scripts/sync_issues.py             # cria só o que falta
python scripts/sync_issues.py --reparar-board   # preenche Status/Prioridade/Prazo que ficaram vazios
```

Requer o `gh` autenticado com os escopos `repo` e `project` (`gh auth refresh -s project`).

> Prioridade e Prazo são campos **do próprio board**. Os issue fields da org (Priority, Target
> date) foram retirados deste projeto porque o GitHub não deixa um board público usar issue
> fields restritos.
