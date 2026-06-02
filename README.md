# PC-status

En enkel GitHub Pages-side som fungerer paa PC og telefon, og viser:

- batteriprosent, hvis nettleseren stotter Battery Status API
- om enheten lader eller gaar paa batteri
- om enheten bor lades
- by og land, hvis brukeren gir nettleseren lokasjonstilgang

## Publiser paa GitHub Pages

Last opp disse filene til repoet ditt:

- `index.html`
- `styles.css`
- `script.js`
- `README.md`

Gaa deretter til `Settings` -> `Pages` i GitHub-repoet, velg `Deploy from a branch`, branch `main`, og mappe `/root`.

Merk: Lokasjon krever at brukeren godkjenner tilgang. Batteridata fungerer ikke i alle nettlesere, og telefoner skjuler ofte batteriprosenten for nettsider. Chrome og Edge har best sjanse til aa vise batteriprosent.
