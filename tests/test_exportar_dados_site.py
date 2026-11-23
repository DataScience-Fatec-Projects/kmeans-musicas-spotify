"""Testes do exportador de dados do site (rápidos: usam o JSON versionado)."""
import copy
import json
import sys
from pathlib import Path

import pytest

RAIZ = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(RAIZ / "scripts"))
from exportar_dados_site import checar  # noqa: E402


@pytest.fixture(scope="module")
def dados():
    return json.loads((RAIZ / "site" / "dados" / "aula.json").read_text(encoding="utf-8"))


def test_numeros_da_aula(dados):
    assert dados["limpeza"]["faixas"] == 89583 and dados["limpeza"]["pares"] == 113392
    assert dados["limpeza"]["linhas"] == 114000 and dados["limpeza"]["generos"] == 114
    assert dados["meta"]["k"] == 7 and len(dados["grupos"]) == 7
    assert [g["faixas"] for g in dados["grupos"]] == [27523, 18082, 10094, 1045, 20162, 6464, 6213]
    assert round(dados["k"]["silhuetas"][7 - 1], 3) == 0.196 and dados["k"]["silhuetas"][0] is None
    assert round(dados["escala"]["ari_sem_padronizar"], 3) == 0.039


def test_formas(dados):
    assert len(dados["features"]) == 9 and len(dados["k"]["inercias"]) == 10
    assert len(dados["pontos"]["x"]) == len(dados["pontos"]["y"]) == len(dados["pontos"]["grupo"]) == 6000
    assert len(dados["generos"]) == 13 and all(abs(sum(g["pct"]) - 100) < 0.6 for g in dados["generos"])
    assert [g["br"] for g in dados["generos"]] == [True] * 7 + [False] * 6
    assert all(len(g["centroide_z"]) == 9 and len(g["centroide_original"]) == 9 for g in dados["grupos"])
    assert len(dados["escala"]["sem_padronizar"]) == len(dados["escala"]["padronizado"]) == 9
    assert len(dados["ao_vivo"]) == 7 and len(dados["simulador_grupo"]["exemplos"]) == 7
    assert len(dados["simulador_passo"]["pontos"]) == 150


def test_checar_aponta_divergencia(dados):
    outro = copy.deepcopy(dados)
    outro["grupos"][0]["faixas"] += 1
    assert checar(dados, dados) == []
    assert "grupos" in checar(dados, outro)[0]


def test_checar_tolera_ruido_numerico(dados):
    outro = copy.deepcopy(dados)
    outro["k"]["inercias"][3] *= 1 + 1e-6
    assert checar(dados, outro) == []
def test_porcentagens_inteiras_arredondadas_pelo_python(dados):
    for g in dados["generos"]:
        assert g["pct_int"] == [int(f"{v:.0f}") for v in g["pct"]]
    pagode = next(g for g in dados["generos"] if g["genero"] == "pagode")
    assert pagode["pct_int"][0] == 34 and pagode["pct_int"][6] == 50
    for a in dados["ao_vivo"]:
        assert isinstance(a["no_grupo_int"], int) and isinstance(a["fora_int"], int)
