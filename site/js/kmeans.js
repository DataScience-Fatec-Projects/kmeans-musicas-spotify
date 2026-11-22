// K-Means em 2 dimensões e previsão de grupo. Sem DOM: é a mesma lógica dos simuladores da
// aula (notebook, I.3 e V.2), separada para poder ser testada com node.

/** Gerador de números aleatórios com semente (mulberry32): o mesmo sorteio dá os mesmos números. */
export function criarSorteador(semente) {
  let a = semente >>> 0;
  return function () {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const dist2 = (p, c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2;

/** Passo 1: sorteia k pontos distintos dos dados como centroides iniciais. */
export function inicializar(pontos, k, semente) {
  const sorteio = criarSorteador(semente);
  const indices = [...pontos.keys()];
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(sorteio() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, k).map(i => pontos[i].slice());
}

/** Passo 2: cada ponto vai para o grupo do centroide mais próximo. */
export function atribuir(pontos, centroides) {
  return pontos.map(p => {
    let melhor = 0;
    for (let j = 1; j < centroides.length; j++) if (dist2(p, centroides[j]) < dist2(p, centroides[melhor])) melhor = j;
    return melhor;
  });
}

/** Passo 3: cada centroide vai para a média do seu grupo (grupo vazio fica onde está). */
export function atualizar(pontos, rotulos, centroides) {
  const novos = centroides.map((c, j) => {
    let sx = 0, sy = 0, n = 0;
    pontos.forEach((p, i) => { if (rotulos[i] === j) { sx += p[0]; sy += p[1]; n++; } });
    return n ? [sx / n, sy / n] : c.slice();
  });
  const deslocamento = Math.max(...novos.map((c, j) => Math.sqrt(dist2(c, centroides[j]))));
  return { centroides: novos, deslocamento };
}

/** Soma das distâncias² de cada ponto ao centroide do seu grupo. */
export function inercia(pontos, rotulos, centroides) {
  return pontos.reduce((s, p, i) => s + dist2(p, centroides[rotulos[i]]), 0);
}

/** Repete atribuição e atualização até os centroides pararem (passo 4). */
export function rodarAteConvergir(pontos, k, semente, tol = 1e-4) {
  let centroides = inicializar(pontos, k, semente), rotulos = [], iteracoes = 0;
  for (; iteracoes < 100;) {
    rotulos = atribuir(pontos, centroides);
    iteracoes++;
    const r = atualizar(pontos, rotulos, centroides);
    centroides = r.centroides;
    if (r.deslocamento < tol) break;
  }
  return { rotulos, centroides, iteracoes, inercia: inercia(pontos, rotulos, centroides) };
}

/** O predict do modelo: padroniza os valores e acha o centroide mais próximo. */
export function prever(valores, media, escala, centroides) {
  const z = valores.map((v, i) => (v - media[i]) / escala[i]);
  const distancias = centroides.map(c => Math.sqrt(c.reduce((s, cj, j) => s + (z[j] - cj) ** 2, 0)));
  let grupo = 0;
  distancias.forEach((d, j) => { if (d < distancias[grupo]) grupo = j; });
  return { grupo, distancias, z };
}
