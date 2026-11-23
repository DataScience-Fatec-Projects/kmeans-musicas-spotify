// Formatação de números no idioma da página. Sem DOM: pode ser testado com node.

const LOCALES = { pt: "pt-BR", en: "en-US" };

/** Formata um número com um número fixo de casas, no idioma dado ("pt" ou "en"). */
export function formatar(valor, casas, idioma) {
  return valor
    .toLocaleString(LOCALES[idioma] ?? LOCALES.pt, { minimumFractionDigits: casas, maximumFractionDigits: casas, roundingMode: "halfEven" })
    .replace("-", "−");
}
