# Self-hosted UI fonts (UI Phase 1)

Owner decision D-4 (2026-10-18): Chonburi for the game title, Mitr for labels/buttons, Bai Jamjuree for body text (with real italics). Files are served from this folder only; the game never calls a font CDN.

| Family       | Weights / styles                  | Source package (npm)            | Upstream                        | License                                    |
| ------------ | --------------------------------- | ------------------------------- | ------------------------------- | ------------------------------------------ |
| Chonburi     | 400                               | `@fontsource/chonburi@5.3.0`    | Google Fonts v14 (Cadson Demak) | SIL OFL 1.1 — `OFL-Chonburi.txt`           |
| Mitr         | 400, 600, 700                     | `@fontsource/mitr@5.3.0`        | Google Fonts v13 (Cadson Demak) | SIL OFL 1.1 — `OFL-Mitr.txt`               |
| Bai Jamjuree | 400, 500, 700 + italic 400, 500   | `@fontsource/bai-jamjuree@5.3.0`| Google Fonts v13 (Cadson Demak) | SIL OFL 1.1 — `OFL-BaiJamjuree.txt`        |

The packages were downloaded with `npm pack` into a temporary folder outside the repository; only the `thai` and `latin` `.woff2` subsets and each package `LICENSE` were copied here, byte-for-byte. Nothing was added to `package.json` or the lockfile. `@font-face` rules (`font-display: swap`, per-subset `unicode-range`) live in `src/ui/tokens.css`.

## SHA-256

```text
26298d7a2b42c730ffd51e72c13a90964550f7f97b0d8f866b2543b6943c85b3  bai-jamjuree-latin-400-italic.woff2
5200faf54f32adc1dc47b8522adbd1399e739f4ce5c9236866806c04d6397b19  bai-jamjuree-latin-400-normal.woff2
bb0566d4f77b123a3cedb4679275380dfbead7bec2a11d7e14ce5a177730c924  bai-jamjuree-latin-500-italic.woff2
28e190032b678cbd8a376278e80603f11db95a156475fa00e7bcf9401b2abbb1  bai-jamjuree-latin-500-normal.woff2
01f179f3f3b1ae29e89409cfdc4665af5c775995dfb2c13f6c8f5d1907028119  bai-jamjuree-latin-700-normal.woff2
9f65ef48b391dfada638d28f836f9a415ab154959a5ece0698db6367d9f7c6e1  bai-jamjuree-thai-400-italic.woff2
357f8fe9fd08973568a061a2fc266a07819cdc33e8c9bb2b39985cc4ec49bfa9  bai-jamjuree-thai-400-normal.woff2
0a43056fd10d9881943611c8eada2fc1bb6658d5bd126b35ecaa88820ba7b1d4  bai-jamjuree-thai-500-italic.woff2
b57547aa660596a2fecf04aa05bad428b73b2474eecd9abb96135cc833295cf1  bai-jamjuree-thai-500-normal.woff2
697c31a8fdd0232b2e88c6adfa9475af2522e1f2a5fdc391d8c314fb9f75ba75  bai-jamjuree-thai-700-normal.woff2
dd390718e8371d31b80141f12469ca8640c84933ea330bd3df8c0ffdb81e0421  chonburi-latin-400-normal.woff2
d184bf9acd0bd40bd994f69d34b2816407a0ef6baa2ba4de299a6ff5efcfe8af  chonburi-thai-400-normal.woff2
25987a2f8ae6e59729d9484419604e68da2890c9201a18d8357ee42a227c2b16  mitr-latin-400-normal.woff2
abbee5fd4170c31b19fb5d3810783ebd9d225cbfa7e43da7edc07ae78750d45b  mitr-latin-600-normal.woff2
2a8f76878355a4adbf3767e0efaefa8dc47d8e7d8563c2d8877586d04c6ca27a  mitr-latin-700-normal.woff2
c5dcf47f8b8fbd7766c7fb76d7f65e9aaa81ef8bc5f1c18268e190878f26cef4  mitr-thai-400-normal.woff2
91b3b89d3ab30bff5a05434bb968f0e01c51404add18327f327e5e5d1d290c4f  mitr-thai-600-normal.woff2
c6014f35636e06b32ac0b86e216a54bace6ec07885dcd715df7a31f807e9792b  mitr-thai-700-normal.woff2
```
