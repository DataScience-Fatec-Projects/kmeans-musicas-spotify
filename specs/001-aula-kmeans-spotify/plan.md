# Implementation Plan: Aula interativa de K-Means com músicas do Spotify

**Branch**: `001-aula-kmeans-spotify` | **Date**: 2026-11-07 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-aula-kmeans-spotify/spec.md`

## Summary

O produto é um notebook do Google Colab que funciona como uma aula de K-Means, nas seções I–V do
enunciado, aplicada a ~89,6 mil faixas do Spotify descritas por 9 features de áudio. A Seção I
implementa o K-Means "do zero" num exemplo 2D e analisa a complexidade. As Seções III–IV limpam,
padronizam e escolhem k (cotovelo, silhueta em amostra e interpretabilidade, com k = 5 como
candidato). A Seção V interpreta os perfis na escala original e cruza com os gêneros, dando
destaque à música brasileira. Uma checagem estrutural automatizada e a execução em CI garantem os
portões da constituição para qualquer colaborador.

## Technical Context

**Language/Version**: Python 3.12 (runtime padrão do Google Colab em nov/2026)

**Primary Dependencies**: pandas, numpy, matplotlib, seaborn, scikit-learn (já instalados no
Colab, sem `%pip`). Para validar: nbformat, nbconvert, ipykernel.

**Storage**: N/A. O CSV público (20 MB) é lido do Hugging Face a cada execução.

**Testing**: `scripts/validar_notebook.py` (contrato estrutural) + `jupyter nbconvert --execute`
(ponta a ponta), local e no GitHub Actions em PRs que mexem em `notebooks/`

**Target Platform**: Google Colab gratuito (execução) e a renderização de `.ipynb` do GitHub
(leitura estática)

**Project Type**: notebook didático (um artefato principal) mais scripts de apoio ao repositório

**Performance Goals**: "Executar tudo" em < 5 min no Colab gratuito. Nenhuma célula > 2 min
(medido localmente: varredura k = 1..10 ≈ 10 s, silhueta com amostra de 10k ≈ 1,2 s por k)

**Constraints**:
- gráficos estáticos;
- sem upload, login ou Drive;
- `RANDOM_STATE` único;
- texto em pt-BR;
- markdown antes de todo código.

**Scale/Scope**:
- 114.000 linhas brutas → ≈113.392 pares faixa–gênero → ≈89.583 faixas de treino × 9 features;
- 114 gêneros;
- ~5 seções, com ~60 a 90 células.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Princípio | Como o plano atende | Status |
|---|---|---|
| I. Colab-first | `URL_DATASET` do HF, nada de upload/Drive, libs nativas do Colab, link entregue via GitHub ([quickstart A](quickstart.md)) | ✅ |
| II. Aula antes do código | contrato exige markdown antes de cada código (✔auto) e comentário depois das saídas (revisão de PR) | ✅ |
| III. Enunciado é requisito | esqueleto de títulos I–V fixo ([contrato §1](contracts/estrutura-notebook.md)); FRs mapeados 1:1 aos itens do enunciado | ✅ |
| IV. Reprodutibilidade | `RANDOM_STATE` numa única célula (✔auto); amostras com semente; versões impressas | ✅ |
| V. Rigor na interpretação | `inverse_transform` → `centroides_originais`; nomes citam ≥ 3 valores; `track_genre` fora do treino ([data-model](data-model.md)) | ✅ |
| VI. Simplicidade | só as 5 libs do enunciado; os scripts `validar_notebook.py` e `sync_issues.py` são ferramentas do repositório, não código da análise; sem app | ✅ |
| VII. Colaboração rastreável | nomes de variáveis por seção no contrato; issues por tarefa; CI no PR | ✅ |

**Re-check pós-design (Phase 1)**: ✅. Nenhuma violação, então a seção Complexity Tracking fica vazia.

## Project Structure

### Documentation (this feature)

```text
specs/001-aula-kmeans-spotify/
├── spec.md
├── plan.md              # este arquivo
├── research.md          # decisões R1–R9 com evidências
├── data-model.md        # entidades → variáveis do notebook
├── quickstart.md        # como validar (Colab, local, por seção, leitor-teste)
├── contracts/
│   └── estrutura-notebook.md   # títulos, regras de célula, variáveis por seção
├── checklists/
│   ├── requirements.md  # qualidade da spec
│   └── rubrica.md       # itens do enunciado e da rubrica (/speckit-checklist)
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
notebooks/
└── aula_kmeans_spotify.ipynb     # o produto (entregue com os outputs salvos)

scripts/
├── validar_notebook.py           # checagem estrutural do contrato (stdlib + nbformat)
└── sync_issues.py                # tasks.md → issues/sub-issues no GitHub Project 3

docs/
└── enunciado.md                  # enunciado original da disciplina

.github/
├── workflows/notebook.yml        # CI: validar + executar o notebook em PRs
├── ISSUE_TEMPLATE/tarefa.md
└── pull_request_template.md      # checklist da rubrica

requirements.txt                  # ambiente local/CI parecido com o Colab
README.md                         # portfólio + badge "Open in Colab"
CONTRIBUTING.md                   # fluxo de issues, branches, PRs e regras de .ipynb
link_colab.txt                    # link público para a entrega
```

**Structure Decision**: um único notebook como produto. Os scripts ficam em `scripts/` e não são
importados pelo notebook, que é autocontido (constituição I e VI). Não existe `src/` nem `tests/`,
porque a verificação é feita sobre o próprio notebook (R8).

## Ordem de implementação (orientação para o /speckit-tasks)

1. **Setup**: esqueleto do notebook com todos os títulos do contrato, capa, célula de configuração,
   `requirements.txt` e `validar_notebook.py`. O validador nasce primeiro e falha nos itens ainda
   não feitos.
2. **Foundational**: CI (`notebook.yml`, timeout de 120 s por célula). A infra de colaboração
   (CONTRIBUTING, templates de PR e issue, `sync_issues.py`, README) já foi criada na estruturação
   SDD e está registrada como tarefa concluída. Isso destrava o trabalho em paralelo com portões
   automáticos.
3. **US3 → US4 → US5** (sequenciais, porque dependem das variáveis do contrato §3).
4. **US1 e US2** podem rodar em paralelo com US3–US5, porque não dependem dos dados.
5. **Polish**: revisão da rubrica, leitor-teste, README/badge, `link_colab.txt`, execução final no
   Colab e entrega.

## Complexity Tracking

Nenhuma violação da constituição.
