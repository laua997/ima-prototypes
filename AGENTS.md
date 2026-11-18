# Agent notes

This repository is the Tangents prototype: static HTML, CSS, and vanilla JavaScript. There is no build step and no Next.js app.

- `index.html` is the wrapper. It loads `browser.html` and `app.html` in iframes, and links to `instagram.html`.
- `instagram.html` is the usability-test feed. It is static, scripted, and stores the sample session in `localStorage`. Do not change its visible wording into metaphors.
- `app.html?s=kintsugi`, `?s=light`, and `?s=onboard` are the three desktop sessions.
- Pictures live in `images/`. `sessions.json` is the same session data in JSON. Paths are relative so they work under `https://laua997.github.io/ima-prototypes/`.
- GitHub Pages publishes these files as they are to the `gh-pages` branch. Keep `.nojekyll` so GitHub does not run Jekyll.

Do not change the prototype’s design or copy unless asked. `README_FOR_GROK.md` was notes for the handoff and is not part of the site.
