# Constituição do Projeto kmeans-musicas-spotify

## Core Principles

### I. Colab-first (INEGOCIÁVEL)
O produto é um notebook que roda do zero com "Ambiente de execução → Executar tudo" no
Google Colab, sem passos manuais.
- O dataset MUST ser lido de uma URL pública (sem upload, Google Drive ou login).
- Toda dependência fora do Colab padrão MUST ser instalada numa célula `%pip` no início do
  notebook. Nada de arquivo local.
- O link entregue é o Colab apontando para o GitHub
  (`colab.research.google.com/github/...`), então o `.ipynb` versionado na `main` é a versão
  oficial.

Justificativa: a entrega da disciplina é o link público do Colab. Se não roda lá, não vale.

### II. Aula antes do código
O notebook é uma aula, não um relatório de código.
- Toda célula de código MUST vir logo depois de uma célula de markdown que diz o que vai ser
  feito e por quê.
- O texto MUST estar em português do Brasil, numa linguagem que um colega de turma que nunca
  viu K-Means consiga acompanhar. Todo termo técnico é definido na primeira vez que aparece.
- Toda saída relevante (gráfico, tabela, métrica) MUST ser comentada numa célula de markdown
  logo depois dela.

Justificativa: "Clareza da Explicação" vale 30% da nota, e o notebook é a aula.

### III. Enunciado é requisito
O enunciado (`docs/enunciado.md`) é a fonte da verdade do que tem que existir.
- As seções I a V do enunciado MUST aparecer no notebook, nessa ordem e com esses títulos.
- Todo item obrigatório do enunciado é critério de aceite: aprendizado não supervisionado e
  clustering, funcionamento do K-Means, Método do Cotovelo, scikit-learn e importações,
  dataset com link e dicionário de variáveis, pré-processamento com StandardScaler
  justificado, escolha de k pelo cotovelo, `KMeans(...)`, `.fit`, centroides e `.labels_`,
  pelo menos duas visualizações distintas, interpretação dos clusters, limitações e próximos
  passos, e o nome completo dos alunos no início.
- Na hora de priorizar, vale a rubrica: rigor técnico 40%, clareza 30%, aplicação 20%,
  organização 10%.

Justificativa: o projeto é avaliado pelo enunciado. Requisito fora dele é opcional.

### IV. Reprodutibilidade
Duas execuções do notebook do zero MUST produzir os mesmos clusters, números e gráficos.
- Todo componente aleatório (`KMeans`, amostragens, PCA com solver aleatório) MUST usar uma
  constante `RANDOM_STATE` definida uma única vez no início.
- As versões de Python, pandas, numpy, scikit-learn, matplotlib e seaborn MUST ser impressas
  numa célula no início.
- A amostragem, se houver, MUST ser explícita e justificada (tamanho, semente e motivo).

Justificativa: quem avalia, ou um colega que pegue uma issue, tem que ver o mesmo resultado.

### V. Rigor na interpretação
Toda afirmação sobre os dados MUST ser sustentada por uma saída do próprio notebook.
- Os perfis dos clusters MUST ser descritos na escala original das variáveis (centroides
  revertidos da padronização com `inverse_transform`, ou médias por cluster nos dados
  originais).
- Um nome de cluster ("músicas acústicas e calmas") MUST citar os valores que o justificam.
- `track_genre` NÃO entra no treino. Ela só é usada depois, para validar e interpretar os
  clusters, e o notebook MUST dizer isso explicitamente.
- Escolhas técnicas (features, k, tratamento de duplicatas) MUST ter justificativa escrita.

Justificativa: "Rigor Técnico" vale 40% e é onde aplicação de K-Means mais costuma errar.

### VI. Simplicidade
O escopo é o notebook da entrega e nada mais.
- O stack é Python com pandas, numpy, matplotlib, seaborn e scikit-learn. Qualquer
  biblioteca a mais MUST justificar o ganho didático ou técnico na spec.
- Código auxiliar da análise fora do notebook (módulos `.py`) MAY existir só se eliminar duplicação
  real. Funções pequenas ficam no próprio notebook.
- App Streamlit, front-end Angular e outros algoritmos de clustering como entrega são
  backlog pós-entrega e NÃO entram nas specs até 24/11/2026.

Justificativa: o prazo é curto e o critério de nota é o notebook.

### VII. Colaboração rastreável
O projeto MUST poder ser tocado por quem não participou do início.
- Todo trabalho nasce de uma issue no GitHub ligada a uma tarefa do `tasks.md` (`T0NN`).
- Toda mudança entra por PR que referencia a issue (`Closes #N`) e traz o checklist da
  rubrica preenchido.
- Duas pessoas NÃO editam a mesma seção do `.ipynb` em paralelo. A issue-pai da seção
  indica quem está nela.
- spec, plan e tasks MUST ser atualizados quando uma decisão mudar. O artefato não pode
  ficar desatualizado em relação ao notebook.

Justificativa: o repo é portfólio e pode ganhar colaboradores no meio do caminho.

## Restrições de Dados e Ferramentas

- Dataset: `maharshipandya/spotify-tracks-dataset` (Hugging Face, licença BSD), lido de
  `https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset/resolve/main/dataset.csv`.
  A fonte e a licença MUST ser citadas no notebook e no README.
- Ambiente-alvo: o runtime padrão do Google Colab (Python 3.12 na data de ratificação).
  Rodar localmente é útil para validar, mas não é requisito.
- Nenhum segredo, token ou credencial no repositório. O dataset é público e não precisa de
  nenhum.
- A API de audio-features do Spotify foi descontinuada em nov/2024. As specs MUST NOT
  depender dela.

## Fluxo de Trabalho e Portões de Qualidade

- Fluxo SDD com spec-kit: `constitution` → `specify` → `clarify` → `plan` → `checklist` →
  `tasks` → `analyze` → issues no GitHub (Project 3 da org) → `implement` → `converge`.
- Portões antes do merge de um PR:
  1. o notebook executa do zero sem erro (`jupyter nbconvert --to notebook --execute` ou
     "Executar tudo" no Colab);
  2. os itens da rubrica tocados pela tarefa estão marcados no checklist do PR;
  3. o texto novo segue o Princípio II (markdown antes e depois do código).
- Portão final de entrega (até 24/11/2026 23:59): o link do Colab abre a versão da `main` já
  executada, com os outputs salvos, e a capa tem o nome completo de todos os integrantes.

## Governance

Esta constituição tem precedência sobre outras práticas do repositório. Toda spec, plano e
PR MUST ser compatível com ela. Uma violação só é aceita se estiver justificada na seção
"Complexity Tracking" do `plan.md`.

- Emendas: entram por PR que altera `.specify/memory/constitution.md`, com a justificativa
  na descrição, e precisam da aprovação de pelo menos um integrante além do autor (se o
  autor estiver sozinho, ele mesmo aprova e registra o motivo no PR).
- Versionamento semântico: MAJOR quando um princípio é removido ou redefinido, MINOR quando
  um princípio ou seção é adicionado, PATCH para esclarecimentos.
- Revisão de conformidade: o `/speckit-analyze` roda antes de gerar as issues e antes da
  entrega. Achados CRITICAL bloqueiam.

**Version**: 1.0.0 | **Ratified**: 2026-11-07 | **Last Amended**: 2026-11-07
