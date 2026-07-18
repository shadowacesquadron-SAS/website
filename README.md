# Shadow Ace Squadron — Website

Cinematic single-page site for **Shadow Ace Squadron (SAS)**, a DCS World virtual squadron.
Live 3D hero (Three.js): stylized jet + wingman flythrough with afterburners, countermeasure
flares, moonlit cloud deck, and lens flare. Zero build step — pure static files, deploys
directly to GitHub Pages.

## Editing content (no code required)

| What | File |
|---|---|
| Discord invite link | `data/site.json` → `discordInvite` |
| Squadron stats (About) | `data/site.json` → `stats` |
| Pilot roster | `data/roster.json` |
| Operations & events | `data/ops.json` |
| Gallery images | drop files in `assets/gallery/`, list them in `data/site.json` → `gallery` |
| Logo / favicon | `assets/logo.svg`, `assets/favicon.svg` |

## Local preview

Any static server works:

```bash
python -m http.server 8000
# open http://localhost:8000
```

(Direct file:// opening won't work — the site fetches JSON data files.)

## Deploy

Hosted on GitHub Pages from the `main` branch, root folder. `.nojekyll` included.
