# Página de portfólio do projeto K-Means: design

**Data**: 2026-11-22 · **Autor**: Wellington Junior Torres de Melo · **Issue de origem**: #51

## 1. Intenção

Uma página única, publicada no GitHub Pages, que apresenta o projeto "K-Means com músicas do
Spotify" a **recrutadores**. Quem sai da página deve concluir: *esta pessoa domina ciência de
dados*. A prova está nas decisões (por que limpar assim, por que padronizar, por que k = 7, o
que o método não faz), e não na quantidade de texto.

A aula completa continua sendo o notebook do Colab. A página é o resumo: nada do conteúdo
essencial se perde, mas cada parte vira uma decisão, um número e um gráfico, com link para a
seção correspondente da aula.

## 2. Objetivos, não objetivos e o que seria um fracasso

**Objetivos**

- Em menos de 10 segundos, sem rolar, o visitante entende o que foi feito: 89.583 músicas,
  nenhum gênero informado, 7 perfis de som.
- Rolando, ele vê o caminho inteiro em 7 capítulos numerados e pode mexer nos dois simuladores.
- O visual tem o impacto das referências (gianlucaboccia.me e santalarch.com): tipografia
  enorme, grade de linhas finas, quase nenhuma cor, história contada pelo scroll.
- Todo número e todo gráfico da página vem do notebook, por um arquivo exportado, e não de
  valores digitados à mão.

**Não objetivos**

- Angular ou qualquer framework (decisão registrada na seção 4). Um explorador de clusters em
  Angular fica como projeto separado, na issue #51 (a #50 é o app Streamlit).
- Blog, formulário de contato, analytics, cookies.
- Chamar a API do Spotify ou qualquer backend. A página é estática.
- Substituir o notebook ou mudar qualquer coisa nele.

**Seria um fracasso se**

- a animação atrapalhasse a leitura, deixasse a página lenta ou escondesse conteúdo de quem
  desativa animações;
- algum número da página divergisse do notebook;
- a página parecesse um template genérico de portfólio;
- o texto ficasse ilegível no celular.

## 3. Restrições

- **Hospedagem**: GitHub Pages do repositório `DataScience-Fatec-Projects/kmeans-musicas-spotify`,
  no endereço `https://datascience-fatec-projects.github.io/kmeans-musicas-spotify/`. Os caminhos
  dos arquivos MUST ser relativos, porque a página fica numa subpasta do domínio.
- **Sem etapa de build e sem dependência externa em tempo de execução**: nenhum CDN, nenhuma
  biblioteca de terceiros, nenhuma fonte carregada de outro domínio.
- **Idioma** (pedido do autor na aprovação): português do Brasil e inglês, com um seletor
  **PT / EN** sempre visível na navegação. Os números seguem o idioma (89.583 e 0,196 em
  português; 89,583 e 0.196 em inglês). O notebook continua só em português.
- **Fonte dos dados**: o notebook `notebooks/aula_kmeans_spotify.ipynb` é a única fonte da
  verdade. O dataset é o `maharshipandya/spotify-tracks-dataset` (licença BSD), e a atribuição
  MUST aparecer na página.
- **Convenções do repositório** (`CLAUDE.md`): PR com assignee `WellingtonTorres`, vinculado ao
  Project "Projeto Final - Algoritmo K-Means", com `Closes #N`, e o board refletindo o trabalho.
- A entrega da disciplina é em 24/11/2026 e não depende desta página. Nada aqui pode quebrar o
  notebook, o validador ou o CI existentes.

## 4. Abordagens consideradas

| Abordagem | O que é | Por que sim ou não |
|---|---|---|
| **A. HTML, CSS e JavaScript puro** (escolhida) | Poucos arquivos estáticos numa pasta, publicados direto | Sem instalação nem manutenção. As referências são tipografia e scroll, que não pedem framework. Os simuladores da aula já são JavaScript puro e entram direto. |
| B. Angular | Aplicação com build e publicação por Actions | O autor trabalha com Angular e queria mostrá-lo. Descartada por ele mesmo como exagero: o recrutador vê a mesma página, e um framework inteiro para uma página de scroll não demonstra domínio do framework. O lugar certo para Angular é um explorador de clusters (#51). |
| C. Gerador estático (Astro ou Vite) | Componentes com build automático | Uma dependência e um pipeline a mais, com ganho pequeno para uma página só. |

Direção visual, escolhida pelo autor entre três esboços: **"os dados são o desenho"** (fundo
preto, pontos que se organizam em grupos conforme o scroll), **com a tipografia e a grade do
"letreiro"** (título gigante cortado na borda, linhas finas de grade à mostra).

## 5. A página

### 5.1 Estrutura, de cima para baixo

```
┌──────────────────────────────────────────────────────────┐
│ K-MEANS (letreiro gigante, cortado na borda)             │
│ Resultado · Caminho · Simuladores · Limites · Contato    │
│                                                          │
│  milhares de pontos cinza espalhados       · ·  ·  ·     │
│  89.583                                   ·   ·  ·       │
│  músicas. Nenhum gênero informado.          role ↓       │
├──────────────────────────────────────────────────────────┤
│ (rolando) os pontos migram e ganham cor: 7 grupos        │
│ 7 perfis de som  → os nomes aparecem ao lado dos grupos  │
├──────────────────────────────────────────────────────────┤
│ 01 Dados       114 mil linhas → 89.583 faixas, e por quê │
│ 02 Escala      por que padronizar (BPM contra 0 a 1)     │
│ 03 Quantos     cotovelo + silhueta → k = 7               │
│ 04 Grupos      mapa de calor dos 7 perfis, com nomes     │
│ 05 Brasil      pagode, samba e sertanejo no "Ao vivo"    │
├──────────────────────────────────────────────────────────┤
│ 06 Mexa você   os dois simuladores, no visual da página  │
│ 07 Limites     o que o método não faz, e o que eu faria  │
├──────────────────────────────────────────────────────────┤
│ Wellington Junior Torres de Melo · Colab ↗ · GitHub ↗    │
└──────────────────────────────────────────────────────────┘
```

### 5.2 Abertura (decisão do autor)

- Fundo preto. O letreiro "K-MEANS" ocupa a largura toda e é cortado na borda de cima.
- Um campo de pontos ocupa a tela. São as **6.000 faixas da amostra da aula**
  (`amostra_idx`), na posição do gráfico de centroides da IV.4 (as duas componentes do PCA).
- Estado inicial: pontos cinza, espalhados ao acaso. Conforme o visitante rola, cada ponto
  migra para a sua posição real e ganha a cor do seu grupo. No fim do trecho, os 7 centroides
  e os 7 nomes aparecem.
- O número "89.583" e a frase "músicas. Nenhum gênero informado." ficam sobre os pontos. Logo
  abaixo, já visível **sem rolar**, uma linha menor entrega o resultado: "Um algoritmo encontrou 7
  perfis de som." No fim da transição, o número grande vira "7" e os nomes dos grupos aparecem.
  Assim o objetivo dos 10 segundos não depende do scroll.
- O trecho fica "preso" na tela (sticky) enquanto o scroll comanda a animação. O progresso é
  função direta da posição do scroll: voltar o scroll desfaz a animação.

### 5.3 Capítulos (proposta de conteúdo, do agente; o autor aprovou o roteiro)

Cada capítulo tem: número e título na coluna estreita da grade, uma frase grande com a decisão,
um ou dois números de apoio, um gráfico e o link "ver na aula ↗" para a seção do Colab.

| Nº | Título | Decisão que mostra | Números (do notebook) | Gráfico |
|---|---|---|---|---|
| 01 | Dados | Uma faixa por linha; o gênero fica fora do treino para não vazar a resposta | 114.000 linhas → 113.392 pares → 89.583 faixas; 9 features; 114 gêneros | Funil da limpeza (3 etapas) |
| 02 | Escala | Padronizar, porque o K-Means mede distância, e o andamento (BPM) e o volume (dB) dominariam as features de 0 a 1 | No exemplo de duas faixas da III.5, sem padronizar, `loudness` e `tempo` respondem por 50,0% e 49,4% da distância; sem padronizar, os 7 grupos viram faixas de andamento (ARI 0,039 contra o modelo padronizado) | Barras com a parte de cada feature na distância entre as duas faixas da III.5, antes e depois de padronizar |
| 03 | Quantos grupos | k não vem dos dados: cotovelo, silhueta e interpretabilidade apontam k = 7 | Queda da inércia por k; silhueta 0,177 / 0,189 / 0,196 para k = 5, 6, 7 | Curva do cotovelo e da silhueta, com k = 7 marcado |
| 04 | Os 7 grupos | Todo nome cita os valores que o justificam | Tamanho e 2 valores por grupo (tabela do README) | Mapa de calor dos centroides padronizados |
| 05 | Brasil | Os grupos fazem sentido musical; e o achado: pagode, sertanejo e samba no "Ao vivo" | 81% do comedy, 74% do classical, 72% do metal; pagode 50%, sertanejo 44%, samba 42%; 89% contra 35% com "ao vivo" no nome | Mapa de calor gênero × grupo (7 brasileiros + 6 de contraste) |
| 06 | Mexa você mesmo | (interativo) | 100,0% de concordância com o `modelo.predict` | Os dois simuladores |
| 07 | Limites | Saber criticar o próprio resultado | Silhueta 0,196; o grupo "Ao vivo" reflete a gravação, não o estilo | Sem gráfico: 4 dos 6 limites da aula em frases curtas (k ambíguo, sobreposição, grupos "redondos", `liveness` mede a gravação) e 2 melhorias (GMM/DBSCAN, treinar sem `liveness`) |

O texto de cada capítulo é resumido a partir do notebook e do README. Reescrever é trabalho do
construtor; inventar número ou conclusão que não esteja no notebook é proibido.

### 5.4 Simuladores (capítulo 06)

Os dois simuladores da aula (FR-008) são reaproveitados: "K-Means passo a passo" e "Em que
grupo cairia a sua música?". A lógica em JavaScript é a mesma; o visual é refeito no estilo da
página (fundo preto, tipografia e grade da página, cores dos grupos). O comportamento MUST
continuar o mesmo, inclusive os casos citados na aula (com k = 3, o sorteio 3 para num mínimo
local; a música "média" cai em *Dançante e alegre*).

### 5.5 Rodapé

Nome completo, uma linha sobre o contexto ("Projeto final de Análise de Algoritmos, Fatec
Jundiaí, 2026"), e os links: **abrir a aula no Colab**, **repositório**, **LinkedIn**,
**e-mail** e **GitHub pessoal** (`github.com/WellingtonTorres`). Atribuição do dataset e da
licença. Os endereços do LinkedIn e do e-mail são informados pelo autor (pendência da seção 8).

## 6. Decisões de construção (do agente, salvo indicação)

- **Pasta**: `site/` na raiz do repositório. Não usar `docs/`, que já guarda o enunciado e as
  imagens do README.
- **Publicação**: workflow do GitHub Actions que publica a pasta `site/` no Pages a cada push
  na `main` que mexa nela. O Pages ainda não está ativado no repositório; ativá-lo (origem:
  GitHub Actions) faz parte do trabalho e precisa de permissão de administrador.
- **Dados**: um script (`scripts/exportar_dados_site.py`) executa o notebook e extrai as
  variáveis para `site/dados/aula.json`: os 6.000 pontos (posição no PCA e cluster), os
  centroides no PCA, nomes, cores e tamanhos dos grupos, inércias, silhuetas, centroides
  padronizados, a tabela gênero × grupo dos 13 gêneros em destaque, os números da limpeza e os
  dados dos dois simuladores, e a parte de cada feature na distância do exemplo da III.5. A página
  lê esse arquivo. O script só exporta valores que o notebook já calcula; não deriva número novo.
  O JSON fica versionado.
- **JSON em dia**: a checagem (reexportar e comparar, com tolerância numérica, porque o CI roda
  em Linux e o autor em Windows) roda só em PRs que mexem em `site/` ou no script de exportação.
  PRs que mexem só no notebook **não** falham por causa do site; se o notebook mudar, reexportar
  o JSON é um passo manual descrito no README do site.
- **Gráficos**: desenhados na página em SVG (ou canvas, para os 6.000 pontos) a partir do JSON,
  para combinarem com o fundo preto. Não se usam as imagens PNG do notebook.
- **Cores**: preto, branco, cinzas e as 7 cores dos grupos (as mesmas `tab10` do notebook).
  Nos mapas de calor, uma escala de uma cor só sobre o preto, ou a divergente azul/vermelho da
  aula, à escolha do construtor, desde que legível.
- **Tipografia**: uma família sem serifa com peso muito pesado disponível (Inter variável,
  licença OFL, hospedada na própria pasta do site), com pilha de fontes do sistema como reserva.
- **Grade**: colunas com linhas verticais finas visíveis, e a navegação alinhada a elas, como no
  Santal.
- **Animação**: scroll comandando o progresso, sem biblioteca. Com `prefers-reduced-motion`, os
  pontos já aparecem agrupados e nada se move.
- **Dois idiomas**: o HTML traz o texto em português, que é o padrão e o que aparece sem
  JavaScript. A tradução para o inglês fica num dicionário próprio (um arquivo por idioma ou
  atributos no HTML, à escolha do construtor), e o seletor troca todo o texto sem recarregar,
  inclusive os rótulos dos gráficos, os nomes dos 7 grupos e os textos dos simuladores. A escolha
  fica guardada no navegador e também pode vir pelo endereço (`?lang=en`), para o autor poder
  mandar o link já em inglês. Na primeira visita, vale o idioma do navegador: inglês para quem
  não usa português. O atributo `lang` da página acompanha a troca. Nomes de músicas, artistas e
  gêneros do dataset não são traduzidos.
- **Sem JavaScript**: o texto e os números de todos os capítulos continuam legíveis (estão no
  HTML). Só os gráficos e os simuladores dependem de script.
- **Responsivo**: funciona de 360 px a telas largas. No celular, a grade vira uma coluna e o
  campo de pontos usa menos pontos se for preciso para manter a fluidez.
- **Acessibilidade**: contraste AA, navegação por teclado nos simuladores, texto alternativo
  ou resumo em texto para cada gráfico.

## 7. O que fica com o construtor

- A divisão dos arquivos dentro de `site/` e a organização do JavaScript.
- A redação final de cada capítulo, dentro do roteiro da 5.3, e a tradução para o inglês (os
  nomes dos grupos em inglês inclusive), que o autor revisa antes da publicação.
- Detalhes de movimento (curvas, duração, o que entra antes).
- A forma exata de cada gráfico, desde que mostre os números da 5.3.
- Como testar: no mínimo, capturas de tela em largura de computador e de celular, a checagem do
  JSON contra o notebook e a conferência dos simuladores com os mesmos casos testados na aula.
- Como quebrar o trabalho em tarefas. No board, o trabalho fica sob uma **issue-pai nova**,
  "Página de portfólio (GitHub Pages)". A #51 continua aberta e passa a se chamar "Explorador de
  clusters em Angular", para a ideia não se perder.

## 8. Pendências com o autor

- Endereço do perfil no LinkedIn e o e-mail que deve aparecer no rodapé.

## 9. Aprovação

Aprovado pelo autor em 2026-11-22, com o acréscimo do seletor de idioma PT / EN. Fica valendo a
proposta de calendário: construir numa branch agora e fazer o merge na `main` e a publicação a
partir de 25/11, depois da entrega da disciplina (constituição VI).

**Revisto no mesmo dia (2026-11-22):** o autor liberou construir e publicar já, sem esperar
25/11. Os links de LinkedIn e e-mail do rodapé (5.5) ficam de fora até ele informar os endereços.
