# PC-status

En enkel GitHub Pages-side som viser:

- batteriprosent, hvis nettleseren stotter Battery Status API
- om PC-en lader eller gaar paa batteri
- om PC-en bor lades
- by og land, hvis brukeren gir nettleseren lokasjonstilgang

## Publiser paa GitHub Pages

Last opp disse filene til repoet ditt:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`

Gaa deretter til `Settings` -> `Pages` i GitHub-repoet, velg `Deploy from a branch`, branch `main`, og mappe `/root`.

Merk: Lokasjon krever at brukeren godkjenner tilgang. Batteridata fungerer ikke i alle nettlesere. Chrome og Edge har best sjanse til aa vise batteriprosent.
