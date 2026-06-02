# PC-status

En enkel statisk nettside som viser:

- batteriprosent
- om PC-en lader
- om PC-en bor lades
- lokasjon, hvis brukeren gir nettleseren tilgang

## Bruk med GitHub Pages

1. Last opp `index.html`, `styles.css` og `script.js` til GitHub-repoet ditt.
2. Gaa til `Settings` -> `Pages`.
3. Velg `Deploy from a branch`.
4. Velg branch `main` og mappe `/root`.
5. Trykk `Save`.

GitHub gir deg en lenke etter litt tid, vanligvis:

```text
https://brukernavn.github.io/repo-navn/
```

Merk: Batteridata fungerer bare i nettlesere som stotter Battery Status API. Lokasjon krever at brukeren godkjenner tilgang.
