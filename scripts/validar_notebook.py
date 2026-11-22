"""Checagem estrutural do notebook da aula contra o contrato.

Contrato: specs/001-aula-kmeans-spotify/contracts/estrutura-notebook.md (§1 e §2, itens ✔auto).

Uso:
    python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb
    python scripts/validar_notebook.py --entrega notebooks/aula_kmeans_spotify.ipynb

O modo padrão roda em todo PR. O modo --entrega é o portão da versão final (T041): além das
checagens padrão, exige que não sobre nenhum "🚧" e que toda célula de código esteja executada e
salva com outputs (FR-004).

Imprime "OK" e sai com código 0, ou lista as falhas e sai com código 1.
"""

from __future__ import annotations

import argparse
import ast
import re
import sys
from pathlib import Path

import nbformat

# §1: títulos de nível 2, fixos e nesta ordem. Os de I a V são copiados do enunciado.
TITULOS_NIVEL_2 = [
    "Sumário",
    "⚙️ Configuração do ambiente",
    "I. Introdução e Contextualização",
    "II. Ferramentas de Trabalho (Scikit-learn e Python)",
    "III. Escolha do Tema e Preparação dos Dados",
    "IV. Implementação e Aplicação Prática",
    "V. Análise e conclusão",
    "Referências",
]

# §2 / §4: subseções que precisam de pelo menos uma célula "🧪 Experimente".
SUBSECOES_EXPERIMENTE = ["I.3", "IV.2", "IV.4", "V.3"]
MINIMO_EXPERIMENTE = 4

MARCADOR_EM_CONSTRUCAO = "🚧"

RE_TITULO = re.compile(r"^(#{1,6})\s+(.+?)\s*#*\s*$", re.MULTILINE)
RE_RANDOM_STATE = re.compile(r"^\s*RANDOM_STATE\s*=(?!=)", re.MULTILINE)
RE_PROIBIDO_DADOS = re.compile(r"files\.upload|drive\.mount")
RE_PROIBIDO_INTERATIVO = re.compile(r"\b(ipywidgets|plotly)\b")
RE_INICIO_MARKDOWN = re.compile(r"^[\s#>*_]+")


def normalizar(texto: str) -> str:
    """Remove o seletor de variação de emoji (U+FE0F), que alguns editores tiram ou põem."""
    return texto.replace("️", "").strip()


def titulos(celula) -> list[tuple[int, str]]:
    """Títulos markdown de uma célula: (nível, texto)."""
    return [(len(m.group(1)), m.group(2).strip()) for m in RE_TITULO.finditer(celula.source)]


def checar_titulos(nb) -> list[str]:
    encontrados = [
        normalizar(texto)
        for celula in nb.cells
        if celula.cell_type == "markdown"
        for nivel, texto in titulos(celula)
        if nivel == 2
    ]
    falhas = []
    esperados = [normalizar(t) for t in TITULOS_NIVEL_2]
    for titulo in esperados:
        if titulo not in encontrados:
            falhas.append(f"Título obrigatório ausente (ou com texto diferente): '## {titulo}'")
    presentes = [t for t in encontrados if t in esperados]
    ordem_esperada = [t for t in esperados if t in presentes]
    if presentes != ordem_esperada:
        falhas.append(
            "Títulos de nível 2 fora da ordem do contrato §1: " + " → ".join(presentes)
        )
    return falhas


URL_COLAB = (
    "https://colab.research.google.com/github/DataScience-Fatec-Projects/kmeans-musicas-spotify"
    "/blob/main/notebooks/aula_kmeans_spotify.ipynb"
)


def checar_botao_colab(nb) -> list[str]:
    """A 1ª célula é só o botão "Open In Colab", no padrão dos notebooks da disciplina."""
    if not nb.cells or nb.cells[0].cell_type != "markdown":
        return ["A primeira célula precisa ser markdown com o botão 'Open In Colab'."]
    texto = nb.cells[0].source
    if "colab-badge.svg" not in texto or URL_COLAB not in texto:
        return [f"A primeira célula precisa ter o botão 'Open In Colab' apontando para {URL_COLAB}."]
    return []


def checar_capa(nb) -> list[str]:
    if len(nb.cells) < 2 or nb.cells[1].cell_type != "markdown":
        return ["A segunda célula precisa ser markdown (a capa, logo depois do botão do Colab)."]
    texto = nb.cells[1].source
    posicao = texto.find("Integrantes")
    if posicao < 0:
        return ["A capa (segunda célula) precisa conter 'Integrantes' seguido dos nomes."]
    depois = re.sub(r"^[\s*_:\-–—]+", "", texto[posicao + len("Integrantes"):])
    if not re.match(r"[A-Za-zÀ-ÿ]{2,}", depois):
        return ["A capa tem 'Integrantes', mas nenhum nome logo depois."]
    return []


def checar_markdown_antes_do_codigo(nb) -> list[str]:
    falhas = []
    for i, celula in enumerate(nb.cells):
        if celula.cell_type != "code":
            continue
        anterior = nb.cells[i - 1] if i > 0 else None
        if anterior is None or anterior.cell_type != "markdown" or not anterior.source.strip():
            trecho = celula.source.strip().splitlines()[0][:60] if celula.source.strip() else "(vazia)"
            falhas.append(
                f"Célula {i + 1} (código: '{trecho}') não é precedida por markdown não vazio."
            )
    return falhas


def checar_random_state(nb) -> list[str]:
    celulas = [
        i + 1
        for i, c in enumerate(nb.cells)
        if c.cell_type == "code" and RE_RANDOM_STATE.search(c.source)
    ]
    if len(celulas) != 1:
        return [
            f"'RANDOM_STATE =' deve aparecer em exatamente 1 célula de código; "
            f"apareceu em {len(celulas)} {celulas if celulas else ''}".rstrip()
        ]
    return []


def valor_de_url_dataset(fonte: str) -> str | None:
    """Valor de `URL_DATASET = "..."` numa célula, aceitando a string quebrada em várias linhas."""
    sem_magicas = "\n".join(
        "" if linha.lstrip().startswith(("%", "!")) else linha for linha in fonte.splitlines()
    )
    try:
        arvore = ast.parse(sem_magicas)
    except SyntaxError:
        return None
    for no in ast.walk(arvore):
        if isinstance(no, ast.Assign) and any(
            isinstance(alvo, ast.Name) and alvo.id == "URL_DATASET" for alvo in no.targets
        ):
            if isinstance(no.value, ast.Constant) and isinstance(no.value.value, str):
                return no.value.value
    return None


def checar_dados(nb) -> list[str]:
    codigo = [c.source for c in nb.cells if c.cell_type == "code"]
    falhas = []
    urls = [valor_de_url_dataset(src) for src in codigo]
    if not any(url and url.startswith("https://huggingface.co/") for url in urls):
        falhas.append("'URL_DATASET' precisa ser definida com uma URL do Hugging Face (https://huggingface.co/...).")
    if any(RE_PROIBIDO_DADOS.search(src) for src in codigo):
        falhas.append("O notebook não pode usar 'files.upload' nem 'drive.mount' (constituição I).")
    return falhas


def checar_experimente(nb) -> list[str]:
    subsecao_atual = None
    total = 0
    por_subsecao = {s: 0 for s in SUBSECOES_EXPERIMENTE}
    for celula in nb.cells:
        if celula.cell_type != "markdown":
            continue
        for nivel, texto in titulos(celula):
            if nivel == 2:
                subsecao_atual = None
            elif nivel == 3:
                subsecao_atual = texto.split()[0] if texto.split() else None
        inicio = RE_INICIO_MARKDOWN.sub("", celula.source)
        if inicio.startswith("🧪 Experimente"):
            total += 1
            if subsecao_atual in por_subsecao:
                por_subsecao[subsecao_atual] += 1
    falhas = []
    if total < MINIMO_EXPERIMENTE:
        falhas.append(f"São exigidas pelo menos {MINIMO_EXPERIMENTE} células '🧪 Experimente'; há {total}.")
    for subsecao, n in por_subsecao.items():
        if n == 0:
            falhas.append(f"Falta uma célula '🧪 Experimente' na subseção {subsecao}.")
    return falhas


def checar_outputs_de_erro(nb) -> list[str]:
    return [
        f"Célula {i + 1} tem um output de erro salvo."
        for i, c in enumerate(nb.cells)
        if c.cell_type == "code" and any(o.get("output_type") == "error" for o in c.get("outputs", []))
    ]


def checar_interativos(nb) -> list[str]:
    usados = sorted({
        m.group(1)
        for c in nb.cells
        if c.cell_type == "code"
        for m in RE_PROIBIDO_INTERATIVO.finditer(c.source)
    })
    if usados:
        return [f"Gráficos e widgets interativos não são permitidos (FR-007): {', '.join(usados)}."]
    return []


RE_SCRIPT_EXTERNO = re.compile(r"<script[^>]*\bsrc\s*=", re.IGNORECASE)


def checar_simuladores(nb) -> list[str]:
    """Simuladores HTML/JS (FR-008): célula de formulário e nenhum script externo."""
    falhas = []
    for i, c in enumerate(nb.cells):
        if c.cell_type != "code":
            continue
        htmls = [c.source] + [
            "".join(o.get("data", {}).get("text/html", ""))
            for o in c.get("outputs", [])
        ]
        if any(RE_SCRIPT_EXTERNO.search(h) for h in htmls):
            falhas.append(f"Célula {i + 1}: simulador carrega script externo (<script src>), proibido pela FR-008.")
        if "<script" in c.source and not c.source.lstrip().startswith("# @title"):
            falhas.append(f"Célula {i + 1}: simulador HTML precisa ser célula de formulário (# @title), FR-008.")
    return falhas


def checar_entrega(nb) -> list[str]:
    falhas = [
        f"Célula {i + 1} ainda está marcada como em construção ({MARCADOR_EM_CONSTRUCAO})."
        for i, c in enumerate(nb.cells)
        if MARCADOR_EM_CONSTRUCAO in c.source
    ]
    falhas += [
        f"Célula {i + 1} (código) não foi executada: a entrega precisa estar salva com outputs (FR-004)."
        for i, c in enumerate(nb.cells)
        if c.cell_type == "code" and c.source.strip() and c.get("execution_count") is None
    ]
    return falhas


CHECAGENS = [
    checar_titulos,
    checar_botao_colab,
    checar_capa,
    checar_markdown_antes_do_codigo,
    checar_random_state,
    checar_dados,
    checar_experimente,
    checar_outputs_de_erro,
    checar_interativos,
    checar_simuladores,
]


def validar(caminho: Path, entrega: bool = False) -> list[str]:
    nb = nbformat.read(caminho, as_version=4)
    falhas = []
    try:
        nbformat.validate(nb)
    except nbformat.ValidationError as erro:
        falhas.append(f"O arquivo não é um notebook válido (nbformat): {erro.message}")
    for checagem in CHECAGENS + ([checar_entrega] if entrega else []):
        falhas += checagem(nb)
    return falhas


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("notebook", type=Path)
    parser.add_argument(
        "--entrega",
        action="store_true",
        help="portão da versão final: sem '🚧' e com todas as células de código executadas",
    )
    args = parser.parse_args()
    if not args.notebook.exists():
        print(f"Arquivo não encontrado: {args.notebook}")
        return 1
    falhas = validar(args.notebook, entrega=args.entrega)
    if falhas:
        print(f"{len(falhas)} falha(s) em {args.notebook}:")
        for falha in falhas:
            print(f"  - {falha}")
        return 1
    print("OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
