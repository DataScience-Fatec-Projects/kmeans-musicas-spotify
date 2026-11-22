# 🎧 K-Means na prática: agrupando músicas do Spotify

[![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/DataScience-Fatec-Projects/kmeans-musicas-spotify/blob/main/notebooks/aula_kmeans_spotify.ipynb)
[![Licença: MIT](https://img.shields.io/badge/licen%C3%A7a-MIT-blue.svg)](LICENSE)
[![Spec-Driven Development](https://img.shields.io/badge/SDD-spec--kit-6f42c1)](https://github.com/github/spec-kit)
[![Board](https://img.shields.io/badge/board-GitHub%20Project-24292f)](https://github.com/orgs/DataScience-Fatec-Projects/projects/3)

Aula interativa em **Google Colab** sobre o algoritmo **K-Means** em Ciência de Dados. Ela agrupa
cerca de 90 mil músicas do Spotify pelas características de áudio (energia, dançabilidade,
valência, acústica…) e mostra que perfis de som existem nelas, com destaque para a música
brasileira.

> Projeto Final da disciplina ICD-004 Análise de Algoritmos (Fatec Jundiaí, Prof. Humberto
> Zanetti), com entrega em **24/11/2026**. Link da aula: [`link_colab.txt`](link_colab.txt).
> O andamento está no [board do projeto](https://github.com/orgs/DataScience-Fatec-Projects/projects/3).

## O que a aula cobre

| Seção | Conteúdo |
|---|---|
| **I. Introdução** | Aprendizado não supervisionado, clustering, o K-Means **implementado do zero** passo a passo, **complexidade O(n·k·d·i)** e avaliação (inércia, cotovelo, silhueta) |
| **II. Ferramentas** | numpy, pandas, matplotlib, seaborn e o `KMeans` do scikit-learn |
| **III. Dados** | Dataset, dicionário de variáveis, limpeza (duplicatas, valores inválidos) e padronização com `StandardScaler` |
| **IV. Aplicação** | Escolha de k (cotovelo e silhueta), treino, visualização dos clusters e dos centroides |
| **V. Análise** | Perfil e nome de cada grupo, cruzamento com gêneros (sertanejo, pagode, samba, forró, MPB…), limitações e melhorias |

Ao longo do notebook há células **🧪 Experimente**: blocos com um parâmetro para mudar e rodar de
novo.

## Dataset

[`maharshipandya/spotify-tracks-dataset`](https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset)
(Hugging Face, licença BSD). São 114 mil faixas de 114 gêneros, com características de áudio
coletadas pela API do Spotify. O notebook lê o CSV direto da URL pública, sem login e sem upload.
Por garantia, uma cópia idêntica fica em [`data/`](data/README.md) e é usada automaticamente se
o Hugging Face não responder.

## Resultados

Depois da limpeza, sobram **89.583 faixas** (uma por linha), descritas por 9 características de
áudio padronizadas. O gênero (`track_genre`) fica **fora do treino** e só é usado depois, para
conferir se os grupos fazem sentido musical.

**k = 7.** A curva do cotovelo é suave e aponta para a faixa de 5 a 7 grupos. Nessa faixa, a
silhueta é máxima em k = 7 (0,196), e os 7 perfis são todos interpretáveis.

| Cluster | Nome | Faixas | Por quê (média do grupo × média geral) |
|---|---|---:|---|
| 0 | Dançante e alegre | 27.523 (30,7%) | dançabilidade 0,71 × 0,56 · positividade 0,70 × 0,47 |
| 1 | Acústico e calmo | 18.082 (20,2%) | acústica 0,69 × 0,33 · energia 0,38 × 0,64 |
| 2 | Instrumental enérgico | 10.094 (11,3%) | instrumental 0,80 × 0,17 · energia 0,74 × 0,64 |
| 3 | Fala e comédia | 1.045 (1,2%) | presença de fala 0,85 × 0,09 · 56% das faixas explícitas |
| 4 | Intenso e pesado | 20.162 (22,5%) | energia 0,82 × 0,64 · volume −5,3 dB × −8,5 dB · 141 BPM × 122 |
| 5 | Ambiente e clássico | 6.464 (7,2%) | volume −21,3 dB × −8,5 dB · acústica 0,87 × 0,33 · instrumental 0,79 × 0,17 |
| 6 | Ao vivo | 6.213 (6,9%) | ao vivo 0,74 × 0,22 |

![Perfil dos clusters: centroides padronizados](docs/img/perfil_clusters.png)

**Os grupos fazem sentido musical.** Sem nunca ter visto um gênero, o K-Means colocou 81% do
`comedy` em *Fala e comédia*, 74% do `classical` em *Ambiente e clássico* e 72% do `metal` em
*Intenso e pesado*.

**A música brasileira se divide em três perfis:**

- **Dançante**: forró (68%) e funk (69%). O rótulo `funk` mistura o funk norte-americano e o
  brasileiro.
- **Espalhada**: a mpb e o rótulo `brazil` se dividem entre vários grupos.
- **Ao vivo**: pagode (50%), sertanejo (44%) e samba (42%). Nesses gêneros, 80% a 89% das faixas
  do grupo *Ao vivo* têm "ao vivo" no nome da faixa ou do álbum. Esse grupo reflete **como a
  música foi gravada**, não o estilo, e é uma das limitações discutidas na aula.

![Gêneros brasileiros e de contraste por cluster](docs/img/generos_brasileiros.png)

## Como usar

- **No Colab** (recomendado): clique no badge *Open in Colab* e depois em *Ambiente de execução →
  Executar tudo*.
- **Localmente**: veja [`quickstart.md`](specs/001-aula-kmeans-spotify/quickstart.md).

## Como este projeto é conduzido: Spec-Driven Development

O projeto usa o [spec-kit](https://github.com/github/spec-kit) do GitHub. Primeiro se escreve **o que**
a aula precisa ter e **por quê**, depois **como**, e só então o notebook. Cada tarefa vira uma issue
no board.

```mermaid
flowchart LR
    E[Enunciado da disciplina] --> C[Constituição<br/>princípios]
    C --> S[Spec<br/>o quê e por quê]
    S --> Q[Clarify<br/>decisões]
    Q --> P[Plano<br/>como]
    P --> T[Tarefas]
    T --> I[Issues + board]
    I --> N[Notebook]
```

| Artefato | Para que serve |
|---|---|
| [`constitution.md`](.specify/memory/constitution.md) | 7 princípios inegociáveis: Colab-first, aula antes do código, reprodutibilidade… |
| [`spec.md`](specs/001-aula-kmeans-spotify/spec.md) | User stories (uma por seção), requisitos e critérios de sucesso |
| [`plan.md`](specs/001-aula-kmeans-spotify/plan.md) · [`research.md`](specs/001-aula-kmeans-spotify/research.md) | Decisões técnicas com evidência medida nos dados |
| [`estrutura-notebook.md`](specs/001-aula-kmeans-spotify/contracts/estrutura-notebook.md) | Contrato do notebook: títulos, regras de célula e variáveis por seção |
| [`tasks.md`](specs/001-aula-kmeans-spotify/tasks.md) | Tarefas `T0NN`, cada uma uma sub-issue no GitHub |
| [`sync_issues.py`](scripts/sync_issues.py) | Sincroniza o `tasks.md` com issues e sub-issues e com o Project |

## Estrutura

```text
notebooks/aula_kmeans_spotify.ipynb   # a aula (o produto)
specs/001-aula-kmeans-spotify/        # spec, plano, pesquisa, contrato, tarefas
.specify/                             # constituição e templates do spec-kit
.claude/skills/                       # comandos /speckit-* para o Claude Code
scripts/                              # validação do notebook e sincronização de issues
docs/enunciado.md                     # enunciado original
```

## Roadmap

- **M1 Dados e modelo** (13/11): base do notebook e Seções III e IV
- **M2 Aula completa** (20/11): Seções I, II e V
- **M3 Entrega** (24/11): revisão da rubrica, leitor-teste e link público
- **Depois da entrega** (backlog): app Streamlit para explorar os clusters e front-end Angular
  para o portfólio

## Contribuindo

Quer ajudar? Veja o [CONTRIBUTING.md](CONTRIBUTING.md): pegue uma issue em **Ready** no board, siga
o contrato do notebook e abra um PR.

## Autoria

- [Wellington Junior Torres de Melo](https://github.com/WellingtonTorres): Ciência de Dados, Fatec Jundiaí

---

### About (English)

An interactive **Google Colab lesson on K-Means clustering** that groups ~90k Spotify tracks by
audio features (energy, danceability, valence, acousticness…). It covers a from-scratch
implementation with complexity analysis, the elbow method and silhouette score, cluster
interpretation and a focus on Brazilian music genres. The project is built with
**Spec-Driven Development** using GitHub's [spec-kit](https://github.com/github/spec-kit):
constitution → spec → plan → tasks → GitHub issues and sub-issues tracked on a public
[project board](https://github.com/orgs/DataScience-Fatec-Projects/projects/3).
Final project for an Algorithm Analysis course (Fatec Jundiaí, Brazil).

**Licença**: código sob [MIT](LICENSE). O dataset pertence aos seus autores (licença BSD).
