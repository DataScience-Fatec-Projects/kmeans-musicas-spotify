#!/usr/bin/env python3
"""Sincroniza o tasks.md do spec-kit com issues do GitHub e com o Project da org.

Para cada fase do tasks.md existe uma issue-pai (uma por seção da aula, mais Setup e Entrega).
Cada tarefa `T0NN` vira uma sub-issue dessa issue-pai. Todas as issues entram no Project
"Projeto Final - Algoritmo K-Means" com Status, Prioridade e Prazo preenchidos.

Prioridade e Prazo são campos do próprio Project, não os issue fields da org (Priority,
Target date), porque board público não aceita issue fields restritos.

É idempotente: issues que já existem (pais pelo título exato, tarefas pelo prefixo `T0NN:`)
não são recriadas. Pode rodar de novo sempre que o tasks.md ganhar tarefas, por exemplo
depois do /speckit-converge.

Requer o GitHub CLI (`gh`) autenticado com os escopos `repo` e `project`.

Uso:
    python scripts/sync_issues.py --dry-run     # só mostra o que faria
    python scripts/sync_issues.py               # cria o que falta
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from dataclasses import dataclass, field
from pathlib import Path

REPO = "DataScience-Fatec-Projects/kmeans-musicas-spotify"
PROJECT_OWNER = "DataScience-Fatec-Projects"
PROJECT_NUMBER = 3
FEATURE_DIR = "specs/001-aula-kmeans-spotify"
BLOB = f"https://github.com/{REPO}/blob/main"

# Milestone -> (data de vencimento, descrição)
MILESTONES = {
    "M1 Dados e modelo": ("2026-11-13", "Setup, base do notebook e Seções III e IV (núcleo do rigor técnico, 40%)."),
    "M2 Aula completa": ("2026-11-20", "Seções I, II e V: a aula completa de ponta a ponta."),
    "M3 Entrega": ("2026-11-24", "Revisão da rubrica, leitor-teste, README e entrega do link público até 23:59."),
}

# Chave do grupo -> definição da issue-pai
PARENTS = {
    "setup": dict(title="Setup e base do notebook", label="setup", milestone="M1 Dados e modelo",
                  priority="P1", anchor=None),
    "US1": dict(title="Seção I – Introdução e Contextualização", label="secao:I",
                milestone="M2 Aula completa", priority="P2",
                anchor="user-story-1---seção-i-entender-o-que-é-k-means-antes-de-ver-código-priority-p2"),
    "US2": dict(title="Seção II – Ferramentas de Trabalho (Scikit-learn e Python)", label="secao:II",
                milestone="M2 Aula completa", priority="P3",
                anchor="user-story-2---seção-ii-conhecer-as-ferramentas-usadas-priority-p3"),
    "US3": dict(title="Seção III – Escolha do Tema e Preparação dos Dados", label="secao:III",
                milestone="M1 Dados e modelo", priority="P1",
                anchor="user-story-3---seção-iii-conhecer-o-tema-e-preparar-os-dados-priority-p1"),
    "US4": dict(title="Seção IV – Implementação e Aplicação Prática", label="secao:IV",
                milestone="M1 Dados e modelo", priority="P1",
                anchor="user-story-4---seção-iv-escolher-k-treinar-e-visualizar-os-clusters-priority-p1"),
    "US5": dict(title="Seção V – Análise e conclusão", label="secao:V",
                milestone="M2 Aula completa", priority="P2",
                anchor="user-story-5---seção-v-interpretar-os-grupos-e-concluir-priority-p2"),
    "polish": dict(title="Entrega e portfólio", label="entrega", milestone="M3 Entrega",
                   priority="P1", anchor=None),
}

LABELS = {
    "setup": ("c5def5", "Infraestrutura do repositório e base do notebook"),
    "secao:I": ("1d76db", "Seção I – Introdução e Contextualização"),
    "secao:II": ("0e8a16", "Seção II – Ferramentas de Trabalho"),
    "secao:III": ("fbca04", "Seção III – Tema e Preparação dos Dados"),
    "secao:IV": ("d93f0b", "Seção IV – Implementação e Aplicação Prática"),
    "secao:V": ("5319e7", "Seção V – Análise e conclusão"),
    "entrega": ("b60205", "Revisão final, portfólio e entrega"),
    "paralelizavel": ("bfdadc", "Marcada [P] no tasks.md: pode ser feita em paralelo"),
    "issue-pai": ("ededed", "Agrupa as sub-issues (tarefas) de uma seção"),
    "spec-kit": ("006b75", "Gerada a partir dos artefatos do spec-kit"),
    "backlog-pos-entrega": ("d4c5f9", "Ideia para depois da entrega de 24/11; precisa de spec própria"),
}

# Milestone 1 começa em Ready; o resto fica em Backlog.
STATUS_POR_MILESTONE = {"M1 Dados e modelo": "Ready"}

# Campos locais do Project (criados pelo script se faltarem)
CAMPO_PRIORIDADE = "Prioridade"
CAMPO_PRAZO = "Prazo"
PRIORITY_OPTIONS = [("P1", "Alta: rigor técnico ou prazo", "RED"),
                    ("P2", "Média: clareza e interpretação", "YELLOW"),
                    ("P3", "Baixa: peso pequeno na rubrica", "GRAY")]

TASK_RE = re.compile(r"^- \[( |x|X)\] (T\d{3,})\s+(\[P\]\s+)?(?:\[(US\d+)\]\s+)?(.+)$")
PHASE_RE = re.compile(r"^## Phase (\d+): (.+)$")
FIELD_RE = re.compile(r"^\*\*(Goal|Independent Test|Purpose)\*\*: (.+)$")
TASK_ID_IN_TITLE = re.compile(r"^(T\d{3,}):")


@dataclass
class Task:
    tid: str
    done: bool
    parallel: bool
    group: str
    text: str


@dataclass
class Group:
    key: str
    goal: str = ""
    test: str = ""
    tasks: list[Task] = field(default_factory=list)


# --------------------------------------------------------------------------- gh helpers

def gh(*args: str, input_text: str | None = None, check: bool = True) -> str:
    proc = subprocess.run(["gh", *args], input=input_text, capture_output=True,
                          text=True, encoding="utf-8")
    if check and proc.returncode != 0:
        raise SystemExit(f"Falha em `gh {' '.join(args[:3])} …`:\n{proc.stderr.strip()}")
    return proc.stdout


def gh_json(*args: str):
    out = gh(*args)
    return json.loads(out) if out.strip() else None


# --------------------------------------------------------------------------- parsing

def group_for_phase(title: str) -> str | None:
    t = title.lower()
    if t.startswith("setup") or t.startswith("foundational"):
        return "setup"
    if t.startswith("polish"):
        return "polish"
    m = re.match(r"user story (\d+)", t)
    return f"US{m.group(1)}" if m else None


def parse_tasks(path: Path) -> dict[str, Group]:
    groups: dict[str, Group] = {}
    current: str | None = None
    for line in path.read_text(encoding="utf-8").splitlines():
        if m := PHASE_RE.match(line):
            current = group_for_phase(m.group(2))
            if current and current not in groups:
                groups[current] = Group(current)
            continue
        if current and (m := FIELD_RE.match(line)):
            g = groups[current]
            if m.group(1) in ("Goal", "Purpose") and not g.goal:
                g.goal = m.group(2)
            elif m.group(1) == "Independent Test":
                g.test = m.group(2)
            continue
        if m := TASK_RE.match(line):
            done, tid, par, story, text = m.groups()
            key = story or current
            if key not in PARENTS:
                raise SystemExit(f"{tid}: não sei a que issue-pai pertence (fase/story '{key}')")
            groups.setdefault(key, Group(key)).tasks.append(
                Task(tid, done.strip().lower() == "x", bool(par), key, text.strip()))
    return groups


def short_title(text: str) -> str:
    """Título da issue: o trecho antes de ' — ' (convenção do tasks.md) ou um corte razoável."""
    plain = text.replace("`", "")
    if " — " in plain:
        return plain.split(" — ", 1)[0].strip()
    for sep in (": ", " (", " → ", ", "):
        i = plain.find(sep)
        if 15 <= i <= 90:
            return plain[:i]
    if len(plain) <= 90:
        return plain
    return plain[:88].rsplit(" ", 1)[0] + "…"


# --------------------------------------------------------------------------- bodies

def links_block() -> str:
    return (f"- Spec: [{FEATURE_DIR}/spec.md]({BLOB}/{FEATURE_DIR}/spec.md)\n"
            f"- Tarefas: [tasks.md]({BLOB}/{FEATURE_DIR}/tasks.md)\n"
            f"- Contrato do notebook: [estrutura-notebook.md]({BLOB}/{FEATURE_DIR}/contracts/estrutura-notebook.md)\n"
            f"- Plano e pesquisa: [plan.md]({BLOB}/{FEATURE_DIR}/plan.md) · [research.md]({BLOB}/{FEATURE_DIR}/research.md)\n"
            f"- Como contribuir: [CONTRIBUTING.md]({BLOB}/CONTRIBUTING.md)")


def parent_body(g: Group) -> str:
    p = PARENTS[g.key]
    story = f" ({g.key}, prioridade {p['priority']})" if g.key.startswith("US") else ""
    spec_link = (f"\n📄 [User story na spec]({BLOB}/{FEATURE_DIR}/spec.md#{p['anchor']})"
                 if p["anchor"] else "")
    test = f"\n**Teste independente:** {g.test}\n" if g.test else ""
    return f"""Issue-pai de **{p['title']}**{story}. Feature `001-aula-kmeans-spotify`.

**Objetivo:** {g.goal}
{test}
As tarefas estão nas **sub-issues** abaixo, na ordem das células do notebook.

> **Uma pessoa por seção do notebook por vez** (constituição, princípio VII). Para trabalhar
> nesta seção, atribua esta issue-pai a você e depois a sub-issue que for fazer.
{spec_link}

### Referências
{links_block()}

<sub>Gerada por `scripts/sync_issues.py` a partir do `tasks.md` (spec-kit).</sub>
"""


def task_body(t: Task, parent_number: int | None) -> str:
    reqs = sorted(set(re.findall(r"\b(?:FR|SC)-\d{3}[ab]?\b", t.text)))
    req_line = f"\n**Requisitos:** {', '.join(reqs)}\n" if reqs else ""
    parent = f"Parte de #{parent_number} · " if parent_number else ""
    par = "Sim, marcada `[P]`." if t.parallel else "Não. Depende da ordem das tarefas da seção."
    return f"""{parent}Tarefa **`{t.tid}`** do [tasks.md]({BLOB}/{FEATURE_DIR}/tasks.md)

### O que fazer
{t.text.split(" — ", 1)[-1]}
{req_line}
**Pode ser feita em paralelo?** {par}

### Pronto quando
- [ ] O que está descrito acima foi feito. No notebook, isso inclui markdown explicando antes e comentário depois das saídas (princípio II)
- [ ] `python scripts/validar_notebook.py notebooks/aula_kmeans_spotify.ipynb` passa, quando o validador já existir
- [ ] O notebook executa do zero (CI verde no PR)
- [ ] `{t.tid}` marcada como `[X]` no `tasks.md` no mesmo PR
- [ ] PR aberto com `Closes #<número desta issue>` e o checklist da rubrica

### Referências
{links_block()}

<sub>Gerada por `scripts/sync_issues.py` a partir do `tasks.md` (spec-kit).</sub>
"""


# --------------------------------------------------------------------------- GitHub setup

def ensure_labels(dry: bool) -> None:
    existing = {l["name"] for l in gh_json("label", "list", "--repo", REPO, "--limit", "200",
                                           "--json", "name")}
    for name, (color, desc) in LABELS.items():
        if name in existing:
            continue
        print(f"  + label {name}")
        if not dry:
            gh("label", "create", name, "--repo", REPO, "--color", color, "--description", desc)


def ensure_milestones(dry: bool) -> None:
    existing = {m["title"] for m in gh_json("api", f"repos/{REPO}/milestones?state=all&per_page=100")}
    for title, (due, desc) in MILESTONES.items():
        if title in existing:
            continue
        print(f"  + milestone {title} (vence {due})")
        if not dry:
            gh("api", f"repos/{REPO}/milestones", "-f", f"title={title}",
               "-f", f"due_on={due}T12:00:00Z", "-f", f"description={desc}")


class Project:
    def __init__(self) -> None:
        view = gh_json("project", "view", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                       "--format", "json")
        self.id = view["id"]
        self.title = view["title"]
        self.reload_fields()

    def reload_fields(self) -> None:
        fields = gh_json("project", "field-list", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                         "--format", "json", "--limit", "50")["fields"]
        self.fields = {f["name"]: f for f in fields}

    def option_id(self, field_name: str, option: str) -> str | None:
        for o in self.fields[field_name].get("options", []):
            if o["name"] == option:
                return o["id"]
        return None

    def ensure_local_fields(self, dry: bool) -> None:
        """Cria os campos Prazo (data) e Prioridade (P1/P2/P3) do Project, se faltarem."""
        wanted = [p for p, _, _ in PRIORITY_OPTIONS]
        created = False
        if CAMPO_PRAZO not in self.fields:
            print(f"  + campo {CAMPO_PRAZO} (data) no Project")
            if not dry:
                gh("project", "field-create", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                   "--name", CAMPO_PRAZO, "--data-type", "DATE")
                created = True
        if CAMPO_PRIORIDADE not in self.fields:
            print(f"  + campo {CAMPO_PRIORIDADE} ({'/'.join(wanted)}) no Project")
            if not dry:
                gh("project", "field-create", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                   "--name", CAMPO_PRIORIDADE, "--data-type", "SINGLE_SELECT",
                   "--single-select-options", ",".join(wanted))
                created = True
        if created:
            self.reload_fields()
        if CAMPO_PRIORIDADE in self.fields:
            # Logo depois de criar o campo, aplica descrição e cor às opções. Depois disso só
            # mexe se os nomes mudarem: regravar as opções troca os IDs e apagaria os valores
            # já atribuídos às issues.
            self.ensure_priority_options(dry, force=created)

    def ensure_priority_options(self, dry: bool, force: bool = False) -> None:
        """Garante as opções P1/P2/P3 (com descrição e cor)."""
        current = [o["name"] for o in self.fields[CAMPO_PRIORIDADE].get("options", [])]
        wanted = [p for p, _, _ in PRIORITY_OPTIONS]
        if current == wanted and not force:
            return
        print(f"  ~ opções de {CAMPO_PRIORIDADE}: {current or 'sem opções'} -> {wanted}")
        if dry:
            return
        opts = ", ".join(
            f'{{name: "{n}", description: "{d}", color: {c}}}' for n, d, c in PRIORITY_OPTIONS)
        query = ("mutation { updateProjectV2Field(input: {fieldId: \"%s\", singleSelectOptions: [%s]})"
                 " { projectV2Field { ... on ProjectV2SingleSelectField { id } } } }"
                 % (self.fields[CAMPO_PRIORIDADE]["id"], opts))
        gh("api", "graphql", "-f", f"query={query}")
        self.reload_fields()

    def item_id_for(self, issue_url: str) -> str:
        """ID do item da issue no Project, adicionando se preciso. O workflow nativo
        "Auto-add sub-issues to project" às vezes adiciona a sub-issue antes do script; nesse
        caso o item-add falha com "already exists" e o item é buscado pela issue."""
        try:
            return gh_json("project", "item-add", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                           "--url", issue_url, "--format", "json")["id"]
        except SystemExit as exc:
            if "already exists" not in str(exc):
                raise
        owner, name = REPO.split("/")
        number = int(issue_url.rstrip("/").rsplit("/", 1)[-1])
        query = ("query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){issue(number:$n)"
                 "{projectItems(first:20){nodes{id project{id}}}}}}")
        data = gh_json("api", "graphql", "-f", f"query={query}", "-f", f"o={owner}",
                       "-f", f"r={name}", "-F", f"n={number}")
        for node in data["data"]["repository"]["issue"]["projectItems"]["nodes"]:
            if node["project"]["id"] == self.id:
                return node["id"]
        raise SystemExit(f"item da issue #{number} não encontrado no Project")

    def add_and_set(self, issue_url: str, status: str, priority: str, target: str) -> bool:
        """Adiciona a issue ao Project e preenche os campos. Uma falha aqui não interrompe o
        sync: a issue já existe, e o aviso permite corrigir o board à mão."""
        try:
            item_id = self.item_id_for(issue_url)
            base = ["project", "item-edit", "--id", item_id, "--project-id", self.id]
            for fname, value in (("Status", status), (CAMPO_PRIORIDADE, priority)):
                oid = self.option_id(fname, value)
                if oid:
                    gh(*base, "--field-id", self.fields[fname]["id"], "--single-select-option-id", oid)
            gh(*base, "--field-id", self.fields[CAMPO_PRAZO]["id"], "--date", target)
            return True
        except SystemExit as exc:
            print(f"      ⚠ board não atualizado para {issue_url}: {exc}")
            return False


# --------------------------------------------------------------------------- main

def existing_issues() -> tuple[dict[str, dict], dict[str, dict]]:
    issues = gh_json("issue", "list", "--repo", REPO, "--state", "all", "--limit", "1000",
                     "--json", "number,title,url,state")
    by_title = {i["title"]: i for i in issues}
    by_task = {}
    for i in issues:
        if m := TASK_ID_IN_TITLE.match(i["title"]):
            by_task[m.group(1)] = i
    return by_title, by_task


def create_issue(title: str, body: str, labels: list[str], milestone: str,
                 parent: int | None) -> dict:
    args = ["issue", "create", "--repo", REPO, "--title", title, "--body-file", "-",
            "--milestone", milestone]
    for lab in labels:
        args += ["--label", lab]
    if parent:
        args += ["--parent", str(parent)]
    url = gh(*args, input_text=body).strip().splitlines()[-1]
    number = int(url.rstrip("/").rsplit("/", 1)[-1])
    print(f"        -> #{number}")
    return {"number": number, "url": url, "title": title}


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--tasks", default=f"{FEATURE_DIR}/tasks.md", help="caminho do tasks.md")
    ap.add_argument("--dry-run", action="store_true", help="só mostra o que seria feito")
    ap.add_argument("--reparar-board", action="store_true",
                    help="preenche Status/Prioridade/Prazo de issues existentes que estão sem "
                         "Prioridade no Project (itens que o script nunca configurou)")
    args = ap.parse_args()

    groups = parse_tasks(Path(args.tasks))
    order = ["setup", "US1", "US2", "US3", "US4", "US5", "polish"]
    total = sum(len(g.tasks) for g in groups.values())
    print(f"{args.tasks}: {total} tarefas em {len(groups)} grupos"
          + (" (dry-run, nada será alterado)" if args.dry_run else ""))

    print("\n[1/3] Labels, milestones e campos do Project")
    ensure_labels(args.dry_run)
    ensure_milestones(args.dry_run)
    project = Project()
    project.ensure_local_fields(args.dry_run)

    print(f"\n[2/3] Issues-pai e sub-issues -> Project “{project.title}”")
    by_title, by_task = existing_issues()
    sem_prioridade: set[str] = set()
    if args.reparar_board:
        itens = gh_json("project", "item-list", str(PROJECT_NUMBER), "--owner", PROJECT_OWNER,
                        "--format", "json", "--limit", "1000")["items"]
        no_board = {i["content"].get("url") for i in itens}
        sem_prioridade = {i["content"].get("url") for i in itens
                          if not i.get(CAMPO_PRIORIDADE.lower())}
        sem_prioridade |= {i["url"] for i in by_title.values()} - no_board

    def reparar(issue: dict, status: str, priority: str, due: str) -> None:
        if issue["url"] in sem_prioridade:
            print(f"      ~ board: #{issue['number']} -> {status}, {priority}, {due}")
            if not args.dry_run:
                project.add_and_set(issue["url"], status, priority, due)

    created = 0
    for key in order:
        g = groups.get(key)
        if not g:
            continue
        p = PARENTS[key]
        status = STATUS_POR_MILESTONE.get(p["milestone"], "Backlog")
        due = MILESTONES[p["milestone"]][0]
        parent = by_title.get(p["title"])
        if parent:
            print(f"  = #{parent['number']} {p['title']}")
            reparar(parent, status, p["priority"], due)
        else:
            print(f"  + [pai] {p['title']}  ({p['milestone']}, {status}, {p['priority']})")
            if not args.dry_run:
                parent = create_issue(p["title"], parent_body(g), [p["label"], "issue-pai", "spec-kit"],
                                      p["milestone"], None)
                project.add_and_set(parent["url"], status, p["priority"], due)
                created += 1
        for t in g.tasks:
            title = f"{t.tid}: {short_title(t.text)}"
            if t.tid in by_task:
                existente = by_task[t.tid]
                print(f"      = #{existente['number']} {existente['title']}")
                reparar(existente, "Done" if existente["state"] == "CLOSED" else status,
                        p["priority"], due)
                continue
            flag = " [P]" if t.parallel else ""
            done = " (já concluída no tasks.md: criada e fechada)" if t.done else ""
            print(f"      + {title}{flag}{done}")
            if args.dry_run:
                continue
            labels = [p["label"], "spec-kit"] + (["paralelizavel"] if t.parallel else [])
            issue = create_issue(title, task_body(t, parent["number"]), labels, p["milestone"],
                                 parent["number"])
            project.add_and_set(issue["url"], "Done" if t.done else status, p["priority"], due)
            if t.done:
                gh("issue", "close", issue["url"], "--reason", "completed")
            created += 1

    print(f"\n[3/3] {'Seriam criadas' if args.dry_run else 'Criadas'}: "
          f"{created if not args.dry_run else 'ver linhas com +'} issues.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
