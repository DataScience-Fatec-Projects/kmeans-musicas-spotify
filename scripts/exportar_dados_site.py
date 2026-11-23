#!/usr/bin/env python3
"""Exporta os resultados do notebook para o site (site/dados/aula.json).

O notebook é a única fonte dos números da página. Este script executa o notebook inteiro,
acrescenta uma célula que junta as variáveis já calculadas e grava o JSON. Ele não calcula
resultado novo: só copia o que a aula já calculou.

Uso:
    python scripts/exportar_dados_site.py            # executa o notebook e grava o JSON
    python scripts/exportar_dados_site.py --checar   # executa e compara com o JSON versionado
"""

from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
NOTEBOOK = RAIZ / "notebooks" / "aula_kmeans_spotify.ipynb"
SAIDA = RAIZ / "site" / "dados" / "aula.json"
INICIO, FIM = "<<<DADOS_DO_SITE", "DADOS_DO_SITE>>>"

# Célula acrescentada ao fim do notebook. Usa só variáveis que a aula já definiu.
CELULA_DE_EXPORTACAO = r'''
import json as _json

_generos = GENEROS_BR + GENEROS_CONTRASTE
_centroides_originais = scaler.inverse_transform(centroides_padronizados)
_dados = {
    "meta": {"notebook": "notebooks/aula_kmeans_spotify.ipynb", "k": int(K_ESCOLHIDO),
             "random_state": int(RANDOM_STATE)},
    "limpeza": {
        "linhas": int(len(df_bruto)), "sem_ausentes": int(len(sem_ausentes)),
        "sem_identicas": int(len(sem_identicas)), "pares": int(len(df_pares)),
        "faixas": int(len(df_faixas)), "generos": int(df_pares["track_genre"].nunique()),
        "features": len(FEATURES),
    },
    "features": [{"id": f, "nome": NOMES_FEATURES_PT[f]} for f in FEATURES],
    "escala": {
        "faixa_a": f"{faixa_a['track_name']} ({faixa_a['artists']})",
        "faixa_b": f"{faixa_b['track_name']} ({faixa_b['artists']})",
        "sem_padronizar": [float(v) for v in contribuicao["sem padronizar (%)"]],
        "padronizado": [float(v) for v in contribuicao["padronizado (%)"]],
        "ari_sem_padronizar": float(ari),
    },
    "k": {"valores": list(range(1, 11)), "inercias": [float(v) for v in inercias],
          "silhuetas": [None] + [float(v) for v in silhuetas]},
    "grupos": [
        {"id": c, "nome": NOMES_CLUSTERS[c], "cor": CORES_CLUSTERS.as_hex()[c],
         "faixas": int(perfil_clusters.loc[c, "faixas"]),
         "pct": float(perfil_clusters.loc[c, "% do total"]),
         "centroide_z": [float(v) for v in centroides_padronizados[c]],
         "centroide_original": [float(v) for v in _centroides_originais[c]],
         "pca": [float(v) for v in centroides_2d[c]]}
        for c in range(K_ESCOLHIDO)
    ],
    "pca_variancia": [float(v) for v in variancia],
    "pontos": {"x": [round(float(v), 3) for v in pontos_2d[:, 0]],
               "y": [round(float(v), 3) for v in pontos_2d[:, 1]],
               "grupo": [int(v) for v in rotulos[amostra_idx]]},
    "generos": [
        {"genero": g, "br": g in GENEROS_BR,
         "pct": [round(100 * float(genero_x_cluster.loc[g, c]), 4) for c in range(K_ESCOLHIDO)]}
        for g in _generos
    ],
    "ao_vivo": [
        {"genero": g, "no_grupo": round(100 * float(ao_vivo_br.loc[g, "no cluster Ao vivo"]), 4),
         "fora": round(100 * float(ao_vivo_br.loc[g, "nos outros clusters"]), 4)}
        for g in GENEROS_BR
    ],
    "simulador_passo": dados_passo_a_passo,
    "simulador_grupo": dados_simulador,
}
print("<<<DADOS_DO_SITE" + _json.dumps(_dados, ensure_ascii=False) + "DADOS_DO_SITE>>>")
'''


def exportar(notebook: Path = NOTEBOOK) -> dict:
    """Executa o notebook e devolve o dicionário de dados do site."""
    import nbformat
    from nbclient import NotebookClient

    nb = nbformat.read(notebook, as_version=4)
    nb.cells.append(nbformat.v4.new_code_cell(CELULA_DE_EXPORTACAO))
    NotebookClient(nb, timeout=180, kernel_name="python3").execute()
    texto = "".join(o.get("text", "") for o in nb.cells[-1].outputs if o.output_type == "stream")
    if INICIO not in texto or FIM not in texto:
        raise RuntimeError("A célula de exportação não imprimiu os dados.")
    return json.loads(texto.split(INICIO, 1)[1].rsplit(FIM, 1)[0])


def checar(atual, novo, tolerancia: float = 1e-3, caminho: str = "") -> list[str]:
    """Lista as divergências entre dois dicionários de dados (vazia = iguais)."""
    onde = caminho or "raiz"
    if isinstance(atual, dict) and isinstance(novo, dict):
        if atual.keys() != novo.keys():
            return [f"{onde}: chaves diferentes ({sorted(atual.keys() ^ novo.keys())})"]
        return [d for k in atual for d in checar(atual[k], novo[k], tolerancia, f"{caminho}.{k}".lstrip("."))]
    if isinstance(atual, list) and isinstance(novo, list):
        if len(atual) != len(novo):
            return [f"{onde}: tamanhos diferentes ({len(atual)} e {len(novo)})"]
        return [d for i, (a, b) in enumerate(zip(atual, novo))
                for d in checar(a, b, tolerancia, f"{caminho}[{i}]")]
    eh_float = lambda v: isinstance(v, float)  # noqa: E731
    eh_numero = lambda v: isinstance(v, (int, float)) and not isinstance(v, bool)  # noqa: E731
    if eh_numero(atual) and eh_numero(novo) and (eh_float(atual) or eh_float(novo)):
        if math.isclose(atual, novo, rel_tol=tolerancia, abs_tol=tolerancia):
            return []
        return [f"{onde}: {atual} != {novo}"]
    return [] if atual == novo and type(atual) is type(novo) else [f"{onde}: {atual!r} != {novo!r}"]


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser.add_argument("--checar", action="store_true",
                        help="compara o JSON versionado com o que o notebook gera, sem gravar")
    args = parser.parse_args()
    novo = exportar()
    if args.checar:
        divergencias = checar(json.loads(SAIDA.read_text(encoding="utf-8")), novo)
        for d in divergencias[:30]:
            print("DIVERGE", d)
        print("JSON em dia com o notebook." if not divergencias
              else f"{len(divergencias)} divergência(s): rode o script sem --checar e versione o JSON.")
        return 1 if divergencias else 0
    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_bytes((json.dumps(novo, ensure_ascii=False, separators=(",", ":")) + "\n").encode("utf-8"))
    print(f"Gravado {SAIDA.relative_to(RAIZ)} ({SAIDA.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
