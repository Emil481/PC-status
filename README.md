# PC-status

En enkel GitHub Pages-side som fungerer paa PC og telefon, og viser:

- batteriprosent, hvis nettleseren stotter Battery Status API
- om enheten lader eller gaar paa batteri
- om enheten bor lades
- nettstatus, skjermstorrelse, retning og lokal tid
- om siden er klar for lokasjon paa telefon
- by og land, hvis brukeren gir nettleseren lokasjonstilgang
- kopiering av koordinater etter at lokasjon er hentet

## Publiser paa GitHub Pages

Last opp disse filene til repoet ditt:

- `index.html`
- `styles.css`
- `script.js`
- `manifest.webmanifest`
- `README.md`

Gaa deretter til `Settings` -> `Pages` i GitHub-repoet, velg `Deploy from a branch`, branch `main`, og mappe `/root`.

Merk: Lokasjon krever at brukeren godkjenner tilgang. Batteridata fungerer ikke i alle nettlesere, og telefoner skjuler ofte batteriprosenten for nettsider. Chrome og Edge har best sjanse til aa vise batteriprosent.
