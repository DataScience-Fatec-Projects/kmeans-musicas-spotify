// Textos da página. O português dos textos fixos está no próprio HTML (é o que aparece sem
// JavaScript); aqui ficam a tradução para o inglês desses textos e, nos dois idiomas, os
// textos que o JavaScript escreve (gráficos, simuladores, avisos).

/** Marca um número que vem do aula.json; o main.js preenche o valor no formato do idioma. */
const d = (caminho, casas = 0) => `<span data-dado="${caminho}" data-casas="${casas}"></span>`;

const GRUPOS_PT = ["Dançante e alegre", "Acústico e calmo", "Instrumental enérgico", "Fala e comédia", "Intenso e pesado", "Ambiente e clássico", "Ao vivo"];
const GRUPOS_EN = ["Danceable & upbeat", "Acoustic & calm", "Energetic instrumental", "Speech & comedy", "Intense & heavy", "Ambient & classical", "Live"];
const FEATURES_PT = { danceability: "dançabilidade", energy: "energia", loudness: "volume", speechiness: "presença de fala", acousticness: "acústica", instrumentalness: "instrumental", liveness: "ao vivo", valence: "positividade", tempo: "andamento" };
const FEATURES_EN = { danceability: "danceability", energy: "energy", loudness: "loudness", speechiness: "speechiness", acousticness: "acousticness", instrumentalness: "instrumentalness", liveness: "liveness", valence: "valence", tempo: "tempo" };

const comPrefixo = (prefixo, valores) =>
  Object.fromEntries(Object.entries(valores).map(([k, v]) => [prefixo + k, v]));

// ───────── Textos dinâmicos, em português ─────────
const pt = {
  ...comPrefixo("grupo.", GRUPOS_PT),
  ...comPrefixo("feature.", FEATURES_PT),
  "meta.descricao": "Agrupei 89.583 músicas do Spotify só pelo som, sem informar nenhum gênero, e o K-Means encontrou 7 perfis. Veja as decisões, os gráficos e mexa nos simuladores.",
  "aviso.sem_dados": "Não foi possível carregar os dados. O texto continua valendo; os gráficos e os simuladores não.",

  "simp.k": "k (grupos)",
  "simp.sorteio": "sorteio",
  "simp.inicializar": "1. Inicializar",
  "simp.atribuir": "2. Atribuir",
  "simp.atualizar": "3. Atualizar",
  "simp.rodar": "▶ Rodar até convergir",
  "simp.pausar": "⏸ Pausar",
  "simp.novo": "Novo sorteio",
  "simp.restaurar": "Pontos originais",
  "simp.limpar": "Apagar pontos",
  "simp.iteracao": "iteração",
  "simp.inercia": "inércia",
  "simp.legenda": "○ centro antes da atualização · ✕ centro atual · a seta mostra o caminho do centro. Cinza: ponto ainda sem grupo. Clique no gráfico para acrescentar pontos. A inércia é a soma das distâncias² de cada ponto ao centro do seu grupo.",
  "simp.tela": "Gráfico de dispersão com {n} pontos e {k} grupos. Clique para acrescentar um ponto.",
  "simp.msg.inicio": "Clique em <b>1. Inicializar</b> para sortear os centros iniciais, ou em <b>▶ Rodar até convergir</b> para ver tudo de uma vez.",
  "simp.msg.faltam": "Faltam pontos: são necessários pelo menos <b>{k}</b> para {k} grupos.",
  "simp.msg.inicializado": "<b>Passo 1, inicialização:</b> {k} pontos sorteados viraram os centros iniciais (✕). Agora clique em <b>2. Atribuir</b>.",
  "simp.msg.atribuido": "<b>Passo 2, atribuição (iteração {iteracao}):</b> cada ponto foi para o grupo do centro mais próximo. Agora clique em <b>3. Atualizar</b>.",
  "simp.msg.atualizado": "<b>Passo 3, atualização:</b> cada centro foi para a média dos pontos do seu grupo (seta). O maior deslocamento foi {deslocamento}. Clique em <b>2. Atribuir</b> de novo.",
  "simp.msg.convergiu": "<b>Convergiu em {iteracao} iterações.</b> Os centros não se mexeram, então nenhum ponto vai trocar de grupo. Tente <b>Novo sorteio</b>: alguns sorteios param numa inércia maior, um mínimo local.",
  "simp.msg.ponto": "Ponto acrescentado ({n} pontos). Os grupos precisam ser refeitos: clique em <b>2. Atribuir</b>.",
  "simp.msg.ponto_sem": "Ponto acrescentado ({n} pontos). Clique em <b>1. Inicializar</b> para começar.",
  "simp.msg.restaurado": "Pontos originais de volta. Clique em <b>1. Inicializar</b>.",
  "simp.msg.limpo": "Sem pontos. Clique no gráfico para criar os seus e depois em <b>1. Inicializar</b>.",

  "simg.comecar": "Começar de",
  "simg.media": "Média de todas as faixas",
  "simg.mais_proximo": "grupo mais próximo",
  "simg.detalhe": "grupo {n} · distância {d}",
  "simg.distancias": "Distância até o centro de cada grupo (menor = mais parecido)",
  "simg.padronizada": "A sua música padronizada: quantos desvios-padrão cada valor está acima (+) ou abaixo (−) da média de todas as faixas",

  "aria.marca": "K-Means, início",
  "aria.nav": "Seções",
  "simp.acaso": "Ponto ao acaso",
  "graf.funil.titulo": "Limpeza dos dados em três etapas",
  "graf.contribuicao.titulo": "Parte de cada característica na distância, antes e depois de padronizar",
  "graf.k.titulo": "Inércia e silhueta por número de grupos",
  "graf.perfis.titulo": "Mapa de calor: perfil dos 7 grupos",
  "graf.generos.titulo": "Mapa de calor: gêneros por grupo",
  "graf.rolagem": "Gráfico largo: role para o lado para ver tudo",
  "graf.funil.linhas": "linhas no conjunto de dados",
  "graf.funil.pares": "pares de faixa e gênero, depois da limpeza",
  "graf.funil.faixas": "faixas únicas, usadas no treino",
  "graf.funil.desc": "Limpeza dos dados: {linhas} linhas no conjunto original, {pares} pares de faixa e gênero depois da limpeza e {faixas} faixas únicas usadas no treino.",

  "graf.contrib.sem": "sem padronizar",
  "graf.contrib.com": "padronizado",
  "graf.contrib.legenda": "Parte de cada característica na distância entre duas faixas da base, em %.",
  "graf.contrib.desc": "Sem padronizar, o volume responde por {volume}% da distância entre duas faixas e o andamento por {andamento}%. Padronizado, a distância se divide entre as características.",

  "graf.k.inercia": "Inércia: quanto menor, mais compactos os grupos",
  "graf.k.silhueta": "Silhueta: quanto maior, mais separados os grupos",
  "graf.k.eixo": "número de grupos (k)",
  "graf.k.desc": "Inércia para k de 1 a 10 e silhueta para k de 2 a 10. Com k = {k}, o valor escolhido, a silhueta é {silhueta}.",

  "graf.perfis.legenda": "Centro de cada grupo em desvios-padrão em relação à média de todas as faixas. Vermelho: acima da média. Azul: abaixo.",
  "graf.perfis.desc": "Mapa de calor dos 7 grupos pelas 9 características. O maior valor é o do grupo {grupo} em {feature}: {valor} desvios-padrão acima da média.",

  "graf.generos.legenda": "% das faixas de cada gênero em cada grupo. Acima da linha, os gêneros brasileiros; abaixo, gêneros internacionais de contraste.",
  "graf.generos.desc": "Mapa de calor de 13 gêneros pelos 7 grupos. No grupo {grupo}: pagode {pagode}%, sertanejo {sertanejo}% e samba {samba}%.",

  "esc.titulo": "Animação: dançabilidade × andamento com a mesma régua, sem e com padronização",
  "esc.desc": "Gráfico de dispersão de {n} faixas, dançabilidade × andamento, com a mesma escala nos dois eixos. Sem padronizar, a nuvem é uma linha vertical e o andamento responde por {sem}% da distância entre as faixas A e B. Padronizada, a nuvem se abre e a dançabilidade responde por {com}%.",
  "esc.sem": "Sem padronizar",
  "esc.meio": "Padronizando…",
  "esc.com": "Padronizado",
  "esc.eixo_x_sem": "dançabilidade (0 a 1)",
  "esc.eixo_x_com": "dançabilidade (desvios-padrão)",
  "esc.eixo_y_sem": "andamento (BPM)",
  "esc.eixo_y_com": "andamento (desvios-padrão)",
  "esc.nota": "← toda a dançabilidade,|de 0 a 1, cabe nesta linha",
  "esc.parte": "Parte de cada característica na distância entre A e B",
  "esc.faixas": "A: {a} · B: {b}",

};

// ───────── Inglês: textos dinâmicos e tradução dos textos do HTML ─────────
const en = {
  ...comPrefixo("grupo.", GRUPOS_EN),
  ...comPrefixo("feature.", FEATURES_EN),
  "meta.descricao": "I clustered 89,583 Spotify tracks by sound alone, with no genre labels, and K-Means found 7 profiles. See the decisions, the charts, and play with the simulators.",
  "aviso.sem_dados": "The data could not be loaded. The text still holds; the charts and simulators need the data.",

  "simp.k": "k (clusters)",
  "simp.sorteio": "draw",
  "simp.inicializar": "1. Initialize",
  "simp.atribuir": "2. Assign",
  "simp.atualizar": "3. Update",
  "simp.rodar": "▶ Run until it converges",
  "simp.pausar": "⏸ Pause",
  "simp.novo": "New draw",
  "simp.restaurar": "Original points",
  "simp.limpar": "Clear points",
  "simp.iteracao": "iteration",
  "simp.inercia": "inertia",
  "simp.legenda": "○ center before the update · ✕ current center · the arrow shows the path of the center. Gray: point with no cluster yet. Click the chart to add points. Inertia is the sum of squared distances from each point to its cluster center.",
  "simp.tela": "Scatter plot with {n} points and {k} clusters. Click to add a point.",
  "simp.msg.inicio": "Click <b>1. Initialize</b> to draw the starting centers, or <b>▶ Run until it converges</b> to watch it all at once.",
  "simp.msg.faltam": "Not enough points: at least <b>{k}</b> are needed for {k} clusters.",
  "simp.msg.inicializado": "<b>Step 1, initialization:</b> {k} randomly drawn points became the starting centers (✕). Now click <b>2. Assign</b>.",
  "simp.msg.atribuido": "<b>Step 2, assignment (iteration {iteracao}):</b> each point went to the cluster of its nearest center. Now click <b>3. Update</b>.",
  "simp.msg.atualizado": "<b>Step 3, update:</b> each center moved to the mean of the points in its cluster (arrow). The largest move was {deslocamento}. Click <b>2. Assign</b> again.",
  "simp.msg.convergiu": "<b>Converged in {iteracao} iterations.</b> The centers did not move, so no point will change cluster. Try <b>New draw</b>: some draws stop at a higher inertia, a local minimum.",
  "simp.msg.ponto": "Point added ({n} points). The clusters need to be redone: click <b>2. Assign</b>.",
  "simp.msg.ponto_sem": "Point added ({n} points). Click <b>1. Initialize</b> to start.",
  "simp.msg.restaurado": "Original points restored. Click <b>1. Initialize</b>.",
  "simp.msg.limpo": "No points. Click the chart to create your own, then click <b>1. Initialize</b>.",

  "simg.comecar": "Start from",
  "simg.media": "Average of all tracks",
  "simg.mais_proximo": "nearest cluster",
  "simg.detalhe": "cluster {n} · distance {d}",
  "simg.distancias": "Distance to each cluster center (smaller = more alike)",
  "simg.padronizada": "Your song, standardized: how many standard deviations each value sits above (+) or below (−) the mean of all tracks",

  "aria.marca": "K-Means, home",
  "aria.nav": "Sections",
  "simp.acaso": "Random point",
  "graf.funil.titulo": "Data cleaning in three steps",
  "graf.contribuicao.titulo": "Share of each feature in the distance, before and after standardization",
  "graf.k.titulo": "Inertia and silhouette by number of clusters",
  "graf.perfis.titulo": "Heatmap: profile of the 7 clusters",
  "graf.generos.titulo": "Heatmap: genres by cluster",
  "graf.rolagem": "Wide chart: scroll sideways to see it all",
  "graf.funil.linhas": "rows in the dataset",
  "graf.funil.pares": "track–genre pairs, after cleaning",
  "graf.funil.faixas": "unique tracks, used for training",
  "graf.funil.desc": "Data cleaning: {linhas} rows in the original dataset, {pares} track–genre pairs after cleaning and {faixas} unique tracks used for training.",

  "graf.contrib.sem": "raw",
  "graf.contrib.com": "standardized",
  "graf.contrib.legenda": "Share of each feature in the distance between two tracks from the dataset, in %.",
  "graf.contrib.desc": "Without standardization, loudness accounts for {volume}% of the distance between two tracks and tempo for {andamento}%. Standardized, the distance is spread across the features.",

  "graf.k.inercia": "Inertia: lower means tighter clusters",
  "graf.k.silhueta": "Silhouette: higher means better separated clusters",
  "graf.k.eixo": "number of clusters (k)",
  "graf.k.desc": "Inertia for k from 1 to 10 and silhouette for k from 2 to 10. With k = {k}, the chosen value, the silhouette is {silhueta}.",

  "graf.perfis.legenda": "Center of each cluster in standard deviations from the mean of all tracks. Red: above the mean. Blue: below.",
  "graf.perfis.desc": "Heatmap of the 7 clusters across the 9 features. The largest value is cluster {grupo} on {feature}: {valor} standard deviations above the mean.",

  "graf.generos.legenda": "% of each genre's tracks in each cluster. Above the line, Brazilian genres; below, international genres for contrast.",
  "graf.generos.desc": "Heatmap of 13 genres across the 7 clusters. In the {grupo} cluster: pagode {pagode}%, sertanejo {sertanejo}% and samba {samba}%.",

  "esc.titulo": "Animation: danceability × tempo on the same ruler, raw and standardized",
  "esc.desc": "Scatter plot of {n} tracks, danceability × tempo, with the same scale on both axes. Raw, the cloud is a vertical line and tempo accounts for {sem}% of the distance between tracks A and B. Standardized, the cloud opens up and danceability accounts for {com}%.",
  "esc.sem": "Raw values",
  "esc.meio": "Standardizing…",
  "esc.com": "Standardized",
  "esc.eixo_x_sem": "danceability (0 to 1)",
  "esc.eixo_x_com": "danceability (standard deviations)",
  "esc.eixo_y_sem": "tempo (BPM)",
  "esc.eixo_y_com": "tempo (standard deviations)",
  "esc.nota": "← all of danceability,|from 0 to 1, fits in this line",
  "esc.parte": "Share of each feature in the distance between A and B",
  "esc.faixas": "A: {a} · B: {b}",


  // ── Textos do HTML ──
  "meta.titulo": "K-Means: 89,583 tracks, 7 sound profiles · Wellington Melo",
  "nav.resultado": "Result",
  "nav.caminho": "Path",
  "nav.simuladores": "Simulators",
  "nav.limites": "Limits",
  "nav.contato": "Contact",

  "abertura.legenda": "tracks. No genre given.",
  "abertura.fim": "sound profiles, found from audio alone.",
  "abertura.resultado": `An algorithm found <strong>${d("meta.k")} sound profiles</strong>.`,
  "abertura.autor": "A data science project by Wellington Junior Torres de Melo",
  "abertura.rolar": "Scroll to watch the points sort themselves ↓",

  "dados.titulo": "Data",
  "dados.frase": "One track per row. And genre stays out of training, so the algorithm isn't handed the answer.",
  "dados.p1": `The dataset has ${d("limpeza.linhas")} rows, but the same track shows up under more than one genre. After dropping rows with missing values, exact duplicates or zero tempo, ${d("limpeza.pares")} track–genre pairs remain, which correspond to ${d("limpeza.faixas")} unique tracks.`,
  "dados.p2": `The model trains on the unique tracks and on ${d("limpeza.features")} audio features: danceability, energy, loudness, speechiness, acousticness, instrumentalness, liveness, valence and tempo. The ${d("limpeza.generos")} genres only come back at the end, to check whether the clusters make sense.`,
  "link.aula": "See it in the lesson, in Portuguese (section III) ↗",

  "escala.titulo": "Scale",
  "escala.frase": "K-Means measures distance. Without standardization, only loudness and tempo would be heard.",
  "escala.p1": `Tempo ranges from 30 to 243 BPM, while most other features range from 0 to 1. In the distance between two tracks from the dataset, without standardization, loudness accounts for ${d("escala.sem_padronizar.2", 1)}% and tempo for ${d("escala.sem_padronizar.8", 1)}%. The other seven features together add up to less than 1%.`,
  "escala.p2": `With standardization (mean 0 and standard deviation 1), every feature is weighed in the same currency. Trained without it, the 7 clusters turn into 7 tempo bands, and agreement with the standardized model drops to an ARI of ${d("escala.ari_sem_padronizar", 3)}, on a scale where 1 is identical and 0 is chance.`,
  "escala.anim": "<strong>Scroll and watch the ruler change.</strong> Below are 600 tracks from the dataset, drawn with the same ruler on both axes, which is how Euclidean distance sees the data. Raw, all of danceability fits in a single line, and the distance between tracks A and B is almost all tempo. As you scroll, both axes get standardized.",
  "link.aula3": "See it in the lesson, in Portuguese (sections III.5 and IV.4) ↗",

  "quantos.titulo": "How many clusters",
  "quantos.frase": `The number of clusters isn't written in the data. I used three criteria, and all three pointed to ${d("meta.k")}.`,
  "quantos.p1": "<strong>Elbow.</strong> The inertia curve is smooth, with no sharp bend, which is common in real data. It shows that beyond 7 clusters each extra cluster buys little, and it leaves k = 5, 6 and 7 as candidates.",
  "quantos.p2": `<strong>Silhouette.</strong> Among the candidates, it rises from ${d("k.silhuetas.4", 3)} to ${d("k.silhuetas.5", 3)} and reaches ${d("k.silhuetas.6", 3)} at k = 7, the highest for three or more clusters.`,
  "quantos.p3": "<strong>Interpretability.</strong> With 7 clusters, each one has a profile I can describe and name. With fewer, different profiles get merged.",
  "quantos.p4": `<strong>Stability.</strong> K-Means starts from randomly drawn centers, so I trained the same model with 5 other seeds. With 10 initializations per run, the clusters repeat: ARI from ${d("estabilidade.ari_n10_min", 3)} to ${d("estabilidade.ari_n10_max", 3)}, on a scale where 1 is identical. With a single initialization, one of the draws got stuck in a worse solution (ARI of ${d("estabilidade.ari_n1_min", 3)}). And ${d("estabilidade.audio_repetido")} tracks have the exact same audio as another one, almost always the same recording released twice: training without the repeats also gives nearly the same result (ARI of ${d("estabilidade.ari_sem_repetidas", 3)}).`,
  "link.aula4": "See it in the lesson, in Portuguese (section IV.1) ↗",

  "grupos.titulo": "The 7 clusters",
  "grupos.frase": "Each cluster got a name, and every name cites the values that justify it.",
  "grupos.p1": `The map below is each cluster's fingerprint: how many standard deviations the cluster center sits above (red) or below (blue) the mean of all tracks, for each feature. The <em>Speech &amp; comedy</em> cluster holds only ${d("grupos.3.pct", 1)}% of the tracks, yet it sits almost 7 standard deviations above the mean in speechiness: it is small because it is very different from everything else.`,
  "link.aula5": "See it in the lesson, in Portuguese (sections V.1 and V.2) ↗",

  "brasil.titulo": "Brazil",
  "brasil.frase": "Without seeing a single genre, the algorithm put pagode, sertanejo and samba in the same cluster. The reason isn't style.",
  "brasil.p1": `First, a sanity check: the clusters make musical sense. ${d("generos.12.pct_int.3")}% of the comedy genre landed in <em>Speech &amp; comedy</em>, ${d("generos.7.pct_int.5")}% of classical in <em>Ambient &amp; classical</em> and ${d("generos.8.pct_int.4")}% of metal in <em>Intense &amp; heavy</em>.`,
  "brasil.p2": `In Brazilian music, forró (${d("generos.5.pct_int.0")}%) and funk (${d("generos.6.pct_int.0")}%) are danceable. But pagode (${d("generos.3.pct_int.6")}%), sertanejo (${d("generos.2.pct_int.6")}%) and samba (${d("generos.4.pct_int.6")}%) have <em>Live</em> as their main cluster.`,
  "brasil.p3": `I tested the hypothesis with the data itself. In pagode, ${d("ao_vivo.3.no_grupo_int")}% of the tracks in that cluster have "ao vivo" (live) in the track or album name, against ${d("ao_vivo.3.fora_int")}% in the other clusters. The algorithm found <strong>how the music was recorded</strong>, not its style.`,
  "link.aula6": "See it in the lesson, in Portuguese (section V.3) ↗",

  "sim.titulo": "Try it yourself",
  "sim.frase": "Two simulators run right here in the browser, on the data and the model from the analysis.",
  "sim.passo.titulo": "K-Means, step by step",
  "sim.passo.p": "Pick the number of clusters, draw the starting centers and advance one step at a time. With 3 clusters, try draw number 3: the algorithm converges, but stops at a solution worse than the best one. That is why, in practice, several initializations are run.",
  "sim.grupo.titulo": "Which cluster would your song fall into?",
  "sim.grupo.p": `Describe a song with the 9 controls. The simulator does the same math as the model: it standardizes the values and looks for the nearest center. That math gives the same cluster as the model for 100% of the ${d("limpeza.faixas")} tracks.`,
  "aviso.sem_js": "This simulator needs JavaScript.",
  "aviso.grafico_sem_js": "This chart needs JavaScript.",
  "aviso.animacao_sem_js": "This animation needs JavaScript.",

  "limites.titulo": "Limits",
  "limites.frase": "The clusters make sense, but the method has limits, and all of them showed up here.",
  "limites.1t": "The choice of k was ambiguous.",
  "limites.1p": "The elbow had no sharp bend. Someone weighing the criteria differently could argue for 5 or 6 clusters.",
  "limites.2t": "The clusters overlap.",
  "limites.2p": `The silhouette is ${d("k.silhuetas.6", 3)}, on a scale that goes up to 1. A song can be both danceable and intense, but K-Means forces each one into a single cluster.`,
  "limites.3t": "The method assumes \"round\" clusters.",
  "limites.3p": "Elongated or widely spread clusters, like the speech one, end up cut artificially.",
  "limites.4t": "Not every feature describes style.",
  "limites.4p": "The liveness feature measures the recording. That is why a whole cluster reflects the stage, not the genre.",
  "limites.5t": "No track is left out.",
  "limites.5p": "K-Means has no \"no cluster\" option: every track lands in one, even the atypical ones. I did not run an outlier analysis before clustering, and the speech tracks, the most atypical, ended up forming a cluster of their own.",
  "limites.proximo": "<strong>What I would do next:</strong> try models that allow overlap and don't require choosing k (GMM and DBSCAN), analyze outliers before clustering, and retrain without the liveness feature, to see where pagode, samba and sertanejo end up when only style counts. Further ahead, with a dataset that includes the audio, I would cluster spectrogram embeddings produced by a convolutional neural network (CNN) instead of Spotify's 9 measurements.",
  "link.aula7": "See it in the lesson, in Portuguese (section V.4) ↗",
  "link.aula8": "See it in the lesson, in Portuguese (sections I.3 and V.2) ↗",

  "rodape.contexto": "Data Science · Final project for Algorithm Analysis, Fatec Jundiaí (Brazil), 2026",
  "rodape.colab": "Open the full lesson on Colab (in Portuguese) ↗",
  "rodape.repo": "Project repository ↗",
  "rodape.credito": "Data: Spotify Tracks Dataset by Maharshi Pandya (Hugging Face, BSD license). Page built with plain HTML, CSS and JavaScript; every number comes from the analysis notebook.",
};

export const TEXTOS = { pt, en };

/** Texto dinâmico no idioma dado, com as {variáveis} trocadas. Se faltar no idioma, usa o
 *  português; chave que não existe em nenhum dos dois é erro de programação. */
export function t(chave, idioma, variaveis = {}) {
  const texto = TEXTOS[idioma]?.[chave] || TEXTOS.pt[chave];
  if (typeof texto !== "string" || !texto) throw new Error("Texto sem tradução: " + chave + " (" + idioma + ")");
  return texto.replace(/\{(\w+)\}/g, (_, nome) => (nome in variaveis ? variaveis[nome] : "{" + nome + "}"));
}
