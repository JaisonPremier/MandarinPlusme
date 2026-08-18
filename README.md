# MandarinPlus

A polished, offline-friendly Mandarin vocabulary learning app with smart sessions, shared mastery, listening practice, custom decks, Excel import, Pandao mascot reactions, and persistent local progress.

## Run locally

```bash
npm install
npm run dev
```

## Verify

```bash
npm test
npm run build
```

## GitHub Pages

Push the `main` branch to GitHub, then open **Settings → Pages** and select **GitHub Actions** as the publishing source. The included workflow builds and deploys the site automatically. Its Vite base path adapts to the repository name.

Learning progress is stored in the visitor's browser using local storage.
