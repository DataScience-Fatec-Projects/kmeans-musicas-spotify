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
  "graf.k.escolhido": "k escolhido",
  "graf.k.desc": "Inércia para k de 1 a 10 e silhueta para k de 2 a 10. Com k = {k}, o valor escolhido, a silhueta é {silhueta}.",

  "graf.perfis.legenda": "Centro de cada grupo em desvios-padrão em relação à média de todas as faixas. Vermelho: acima da média. Azul: abaixo.",
  "graf.perfis.desc": "Mapa de calor dos 7 grupos pelas 9 características. O maior valor é o do grupo {grupo} em {feature}: {valor} desvios-padrão acima da média.",

  "graf.generos.legenda": "% das faixas de cada gênero em cada grupo. Acima da linha, os gêneros brasileiros; abaixo, gêneros internacionais de contraste.",
  "graf.generos.desc": "Mapa de calor de 13 gêneros pelos 7 grupos. No grupo {grupo}: pagode {pagode}%, sertanejo {sertanejo}% e samba {samba}%.",

  "abertura.numero_final": "perfis de som",
};

// ───────── Inglês: textos dinâmicos e tradução dos textos do HTML ─────────
const en = {
  ...comPrefixo("grupo.", GRUPOS_EN),
  ...comPrefixo("feature.", FEATURES_EN),
  "meta.descricao": "I clustered 89,583 Spotify tracks by sound alone, with no genre labels, and K-Means found 7 profiles. See the decisions, the charts, and play with the simulators.",
  "aviso.sem_dados": "The data could not be loaded. The text still holds; the charts and simulators need the data.",

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
  "graf.k.escolhido": "chosen k",
  "graf.k.desc": "Inertia for k from 1 to 10 and silhouette for k from 2 to 10. With k = {k}, the chosen value, the silhouette is {silhueta}.",

  "graf.perfis.legenda": "Center of each cluster in standard deviations from the mean of all tracks. Red: above the mean. Blue: below.",
  "graf.perfis.desc": "Heatmap of the 7 clusters across the 9 features. The largest value is cluster {grupo} on {feature}: {valor} standard deviations above the mean.",

  "graf.generos.legenda": "% of each genre's tracks in each cluster. Above the line, Brazilian genres; below, international genres for contrast.",
  "graf.generos.desc": "Heatmap of 13 genres across the 7 clusters. In the {grupo} cluster: pagode {pagode}%, sertanejo {sertanejo}% and samba {samba}%.",

  "abertura.numero_final": "sound profiles",

  // ── Textos do HTML ──
  "meta.titulo": "K-Means: 89,583 tracks, 7 sound profiles · Wellington Melo",
  "nav.resultado": "Result",
  "nav.caminho": "Path",
  "nav.simuladores": "Simulators",
  "nav.limites": "Limits",
  "nav.contato": "Contact",

  "abertura.legenda": "tracks. No genre given.",
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
  "link.aula3": "See it in the lesson, in Portuguese (sections III.5 and IV.4) ↗",

  "quantos.titulo": "How many clusters",
  "quantos.frase": `The number of clusters isn't written in the data. I used three criteria, and all three pointed to ${d("meta.k")}.`,
  "quantos.p1": "<strong>Elbow.</strong> The inertia curve is smooth, with no sharp bend, which is common in real data. It shows that beyond 7 clusters each extra cluster buys little, and it leaves k = 5, 6 and 7 as candidates.",
  "quantos.p2": `<strong>Silhouette.</strong> Among the candidates, it rises from ${d("k.silhuetas.4", 3)} to ${d("k.silhuetas.5", 3)} and reaches ${d("k.silhuetas.6", 3)} at k = 7, the highest for three or more clusters.`,
  "quantos.p3": "<strong>Interpretability.</strong> With 7 clusters, each one has a profile I can describe and name. With fewer, different profiles get merged.",
  "link.aula4": "See it in the lesson, in Portuguese (section IV.1) ↗",

  "grupos.titulo": "The 7 clusters",
  "grupos.frase": "Each cluster got a name, and every name cites the values that justify it.",
  "grupos.p1": `The map below is each cluster's fingerprint: how many standard deviations the cluster center sits above (red) or below (blue) the mean of all tracks, for each feature. The <em>Speech &amp; comedy</em> cluster holds only ${d("grupos.3.pct", 1)}% of the tracks, yet it sits almost 7 standard deviations above the mean in speechiness: it is small because it is very different from everything else.`,
  "link.aula5": "See it in the lesson, in Portuguese (sections V.1 and V.2) ↗",

  "brasil.titulo": "Brazil",
  "brasil.frase": "Without seeing a single genre, the algorithm put pagode, sertanejo and samba in the same cluster. The reason isn't style.",
  "brasil.p1": `First, a sanity check: the clusters make musical sense. ${d("generos.12.pct.3")}% of the comedy genre landed in <em>Speech &amp; comedy</em>, ${d("generos.7.pct.5")}% of classical in <em>Ambient &amp; classical</em> and ${d("generos.8.pct.4")}% of metal in <em>Intense &amp; heavy</em>.`,
  "brasil.p2": `In Brazilian music, forró (${d("generos.5.pct.0")}%) and funk (${d("generos.6.pct.0")}%) are danceable. But pagode (${d("generos.3.pct.6")}%), sertanejo (${d("generos.2.pct.6")}%) and samba (${d("generos.4.pct.6")}%) have <em>Live</em> as their main cluster.`,
  "brasil.p3": `I tested the hypothesis with the data itself. In pagode, ${d("ao_vivo.3.no_grupo")}% of the tracks in that cluster have "ao vivo" (live) in the track or album name, against ${d("ao_vivo.3.fora")}% in the other clusters. The algorithm found <strong>how the music was recorded</strong>, not its style.`,
  "link.aula6": "See it in the lesson, in Portuguese (section V.3) ↗",

  "sim.titulo": "Try it yourself",
  "sim.frase": "Two simulators run right here in the browser, on the data and the model from the analysis.",
  "sim.passo.titulo": "K-Means, step by step",
  "sim.passo.p": "Pick the number of clusters, draw the starting centers and advance one step at a time. With 3 clusters, try draw number 3: the algorithm converges, but stops at a solution worse than the best one. That is why, in practice, several initializations are run.",
  "sim.grupo.titulo": "Which cluster would your song fall into?",
  "sim.grupo.p": `Describe a song with the 9 controls. The simulator does the same math as the model: it standardizes the values and looks for the nearest center. That math gives the same cluster as the model for 100% of the ${d("limpeza.faixas")} tracks.`,
  "aviso.sem_js": "This simulator needs JavaScript.",

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
  "limites.proximo": "<strong>What I would do next:</strong> try models that allow overlap and don't require choosing k (GMM and DBSCAN), and retrain without the liveness feature, to see where pagode, samba and sertanejo end up when only style counts.",
  "link.aula7": "See it in the lesson, in Portuguese (section V.4) ↗",

  "rodape.contexto": "Data Science · Final project for Algorithm Analysis, Fatec Jundiaí (Brazil), 2026",
  "rodape.colab": "Open the full lesson on Colab (in Portuguese) ↗",
  "rodape.repo": "Project repository ↗",
  "rodape.email": "Email ↗",
  "rodape.credito": "Data: Spotify Tracks Dataset by Maharshi Pandya (Hugging Face, BSD license). Page built with plain HTML, CSS and JavaScript; every number comes from the analysis notebook.",
};

export const TEXTOS = { pt, en };

/** Texto dinâmico no idioma dado, com as {variáveis} trocadas. Chave inexistente é erro. */
export function t(chave, idioma, variaveis = {}) {
  const texto = (TEXTOS[idioma] ?? TEXTOS.pt)[chave];
  if (typeof texto !== "string" || !texto) throw new Error("Texto sem tradução: " + chave + " (" + idioma + ")");
  return texto.replace(/\{(\w+)\}/g, (_, nome) => (nome in variaveis ? variaveis[nome] : "{" + nome + "}"));
}
