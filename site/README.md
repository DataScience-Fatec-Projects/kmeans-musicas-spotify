# Página de portfólio

Página única que apresenta o projeto a recrutadores, em português e inglês:
<https://datascience-fatec-projects.github.io/kmeans-musicas-spotify/>
(em inglês: acrescente `?lang=en` ao endereço).

É feita em HTML, CSS e JavaScript puro, sem etapa de build e sem nada carregado de outro
domínio. O design está em
[`docs/superpowers/specs/2026-11-22-pagina-portfolio-design.md`](../docs/superpowers/specs/2026-11-22-pagina-portfolio-design.md).

## Rodar localmente

Os módulos JavaScript e o arquivo de dados não carregam abrindo o `index.html` direto do disco.
Suba um servidor local na pasta:

```bash
python -m http.server 8000 --directory site
# abra http://localhost:8000/
```

## De onde vêm os números

Todos os números e gráficos vêm de `dados/aula.json`, exportado do notebook da aula. Nenhum
número de resultado é digitado no HTML ou no JavaScript (o texto em português do HTML traz os
valores só como reserva, para quem abre a página sem JavaScript; um teste confere que cada um
aponta para um campo que existe no JSON).

Se o notebook mudar, reexporte e versione o JSON:

```bash
python scripts/exportar_dados_site.py            # executa o notebook e grava site/dados/aula.json
python scripts/exportar_dados_site.py --checar   # só confere se o JSON está em dia
```

## Testes

```bash
node --test "site/tests/*.test.mjs"                  # lógica, idiomas, gráficos, simuladores
python -m pytest tests/test_exportar_dados_site.py   # formato e números do JSON
python scripts/capturar_site.py --largura 360 --altura 780   # captura de tela e largura da página
```

`scripts/capturar_site.py` abre a página num navegador headless (Edge ou Chrome), tira uma
captura em `site/.capturas/` e avisa se houver rolagem horizontal. Veja as opções no topo do
arquivo (`--rolar`, `--ancora`, `--lang`, `--script`, `--menos-movimento`, `--sem-dados`).

## Organização

| Arquivo | Papel |
|---|---|
| `index.html` | Todo o texto em português, com `data-i18n` em cada trecho traduzível e `data-dado` em cada número |
| `css/base.css`, `css/secoes.css` | Tipografia (Inter), grade de linhas, capítulos, gráficos e simuladores |
| `js/main.js` | Carrega o JSON e liga os módulos |
| `js/textos.js`, `js/idioma.js` | Tradução para o inglês e a troca de idioma (PT / EN) |
| `js/formato.js`, `js/kmeans.js` | Lógica pura: formatação de números e o K-Means dos simuladores |
| `js/abertura.js` | Os 6.000 pontos que se organizam conforme o scroll |
| `js/graficos.js` | Os cinco gráficos, em SVG |
| `js/sim-passo.js`, `js/sim-grupo.js` | Os dois simuladores |

## Publicação

O workflow [`.github/workflows/site.yml`](../.github/workflows/site.yml) roda os testes em todo
PR que mexe em `site/` e, a cada push na `main`, publica a pasta no GitHub Pages. Mudanças só no
notebook não disparam esse workflow.

## Créditos

- Dados: [Spotify Tracks Dataset](https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset),
  de Maharshi Pandya (licença BSD).
- Fonte: [Inter](https://rsms.me/inter/), de Rasmus Andersson (licença OFL, em `fonts/OFL.txt`).
