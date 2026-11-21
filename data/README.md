# Cópia de reserva do dataset

`spotify_tracks.csv` é uma cópia **idêntica, byte a byte,** do *Spotify Tracks Dataset*. Ela existe
só por garantia: o notebook lê primeiro do Hugging Face (`URL_DATASET`) e só usa esta cópia
(`URL_DATASET_RESERVA`) se a fonte original não responder.

| | |
|---|---|
| Fonte original | <https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset> (`dataset.csv`) |
| Autor | Maharshi Pandya |
| Licença | BSD (a mesma da fonte; a redistribuição mantém esta atribuição) |
| Coleta | API Web do Spotify (*audio features*) |
| Copiado em | 21/11/2026 |
| Tamanho | 20.118.244 bytes · 114.000 linhas + cabeçalho · 20 colunas + índice |
| SHA-256 | `b202fa49909b2d5cef71a04b1d21243cfeb36414535f2ca9272aa646721177bd` |

Para conferir se a cópia continua igual à original:

```bash
sha256sum data/spotify_tracks.csv
curl -sL https://huggingface.co/datasets/maharshipandya/spotify-tracks-dataset/resolve/main/dataset.csv | sha256sum
```

Não edite este arquivo. Toda limpeza acontece no notebook (Seção III.3).
