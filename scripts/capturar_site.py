#!/usr/bin/env python3
"""Tira capturas de tela do site num navegador headless (Edge ou Chrome) e mede a largura.

Sobe um servidor local na pasta site/, abre a página, opcionalmente rola e executa um script,
e grava a imagem em site/.capturas/. Também imprime scrollWidth e innerWidth, para checar que
não há rolagem horizontal.

Uso:
    python scripts/capturar_site.py                         # 1440 px
    python scripts/capturar_site.py --largura 360 --altura 780
    python scripts/capturar_site.py --rolar 1.5             # rola 1,5 tela antes da captura
    python scripts/capturar_site.py --ancora dados --lang en
    python scripts/capturar_site.py --script teste.js       # roda o script na página antes
    python scripts/capturar_site.py --menos-movimento       # prefers-reduced-motion
    python scripts/capturar_site.py --sem-dados             # simula falha ao carregar o JSON
"""

from __future__ import annotations

import argparse
import functools
import html
import http.server
import json
import os
import re
import shutil
import subprocess
import sys
import threading
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]
SITE = RAIZ / "site"
SAIDA = SITE / ".capturas"
CANDIDATOS = [
    os.environ.get("NAVEGADOR", ""),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    "google-chrome", "chromium", "chromium-browser", "microsoft-edge",
]

MODELO_DE_INJECAO = """
window.addEventListener("load", () => setTimeout(async () => {
  document.documentElement.style.scrollBehavior = "auto";
  const ancora = __ANCORA__;
  if (ancora) document.getElementById(ancora).scrollIntoView();
  window.scrollBy(0, __ROLAR__ * window.innerHeight);
  await new Promise(r => setTimeout(r, 400));
  const saida = [];
  try { __SCRIPT__ } catch (e) { saida.push("ERRO: " + e.message); }
  await new Promise(r => setTimeout(r, 400));
  const m = document.createElement("pre");
  m.id = "metricas"; m.hidden = true;
  m.textContent = JSON.stringify({scrollWidth: document.documentElement.scrollWidth,
    innerWidth: window.innerWidth, lang: document.documentElement.lang, saida});
  document.body.appendChild(m);
}, 900));
"""


MOLDURA = """<!doctype html><meta charset="utf-8">
<body style="margin:0;background:#444">
<iframe id="q" src="__SRC__" style="border:0;display:block;width:__L__px;height:__A__px"></iframe>
<script>
const q = document.getElementById("q");
const espera = setInterval(() => {
  const m = q.contentDocument && q.contentDocument.getElementById("metricas");
  if (!m) return;
  clearInterval(espera);
  const copia = document.createElement("pre");
  copia.id = "metricas"; copia.hidden = true; copia.textContent = m.textContent;
  document.body.appendChild(copia);
}, 100);
</script></body>"""


def achar_navegador() -> str:
    for c in CANDIDATOS:
        if c and (Path(c).exists() or shutil.which(c)):
            return c
    sys.exit("Nenhum navegador encontrado. Informe o caminho na variável NAVEGADOR.")


def criar_servidor(injetar: str, sem_dados: bool):
    class Manipulador(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):  # silencioso
            pass

        def do_GET(self):
            caminho = self.path.split("?")[0]
            if sem_dados and caminho.endswith("aula.json"):
                self.send_error(404)
                return
            if caminho == "/_moldura":
                # Janelas headless não ficam mais estreitas que ~500 px: para simular um
                # celular, a página é aberta dentro de um iframe com a largura pedida.
                consulta = self.path.partition("?")[2]
                corpo = MOLDURA.replace("__SRC__", "/?" + consulta).encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(corpo)))
                self.end_headers()
                self.wfile.write(corpo)
                return
            if caminho in ("/", "/index.html"):
                corpo = (SITE / "index.html").read_text(encoding="utf-8").replace(
                    "</body>", f"<script>{injetar}</script></body>").encode("utf-8")
                self.send_response(200)
                self.send_header("Content-Type", "text/html; charset=utf-8")
                self.send_header("Content-Length", str(len(corpo)))
                self.end_headers()
                self.wfile.write(corpo)
                return
            super().do_GET()

    servidor = http.server.ThreadingHTTPServer(
        ("127.0.0.1", 0), functools.partial(Manipulador, directory=str(SITE)))
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor


def main() -> int:
    sys.stdout.reconfigure(encoding="utf-8")
    p = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    p.add_argument("--largura", type=int, default=1440)
    p.add_argument("--altura", type=int, default=900)
    p.add_argument("--rolar", type=float, default=0.0, help="quantas telas rolar antes da captura")
    p.add_argument("--ancora", default="", help="id de uma seção para rolar até ela")
    p.add_argument("--lang", default="", help="pt ou en (vai no endereço como ?lang=)")
    p.add_argument("--script", default="", help="arquivo .js executado na página antes da captura")
    p.add_argument("--menos-movimento", action="store_true")
    p.add_argument("--sem-dados", action="store_true")
    p.add_argument("--nome", default="", help="nome do arquivo de saída (sem extensão)")
    a = p.parse_args()

    extra = Path(a.script).read_text(encoding="utf-8") if a.script else ""
    injetar = (MODELO_DE_INJECAO.replace("__ANCORA__", json.dumps(a.ancora))
               .replace("__ROLAR__", str(a.rolar)).replace("__SCRIPT__", extra))

    global MOLDURA
    estreita = True  # sempre na moldura: a captura headless não acompanha a rolagem da janela
    MOLDURA = MOLDURA.replace("__L__", str(a.largura)).replace("__A__", str(a.altura))
    servidor = criar_servidor(injetar, a.sem_dados)
    url = (f"http://127.0.0.1:{servidor.server_address[1]}/" + ("_moldura" if estreita else "")
           + (f"?lang={a.lang}" if a.lang else ""))
    SAIDA.mkdir(exist_ok=True)
    nome = a.nome or "-".join(filter(None, [
        f"l{a.largura}", a.ancora, f"r{a.rolar:g}" if a.rolar else "", a.lang,
        "menos" if a.menos_movimento else "", "semdados" if a.sem_dados else "",
        Path(a.script).stem if a.script else ""]))
    imagem = SAIDA / f"{nome}.png"
    base = [achar_navegador(), "--headless", "--disable-gpu", "--hide-scrollbars",
            "--virtual-time-budget=7000", f"--window-size={max(a.largura, 500)},{a.altura}"]
    if a.menos_movimento:
        base.append("--force-prefers-reduced-motion")
    subprocess.run(base + [f"--screenshot={imagem}", url], capture_output=True, timeout=120)
    dom = subprocess.run(base + ["--dump-dom", url], capture_output=True, timeout=120,
                         text=True, encoding="utf-8", errors="replace").stdout
    servidor.shutdown()
    m = re.search(r'<pre id="metricas"[^>]*>(.*?)</pre>', dom, re.S)
    print(imagem)
    if not m:
        print("SEM MÉTRICAS (a página não terminou de carregar?)")
        return 1
    metricas = json.loads(html.unescape(m.group(1)))
    print(json.dumps(metricas, ensure_ascii=False))
    return 0 if metricas["scrollWidth"] <= metricas["innerWidth"] else 2


if __name__ == "__main__":
    sys.exit(main())
