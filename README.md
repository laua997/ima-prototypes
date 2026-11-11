# IMA research prototypes

Three working usability prototypes for Angela Lau’s NYU IMA design-research session. They live in one app, with a short launcher and a separate task in each.

The pictures are public-domain or Creative Commons files stored in this repo. What you save stays in the browser. Nothing is uploaded.

## Run

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:4317](http://127.0.0.1:4317).

```bash
npm test
npm run build
```

`scripts/browser-check.mjs` walks all three tasks in headless Chrome. It expects Chrome at `/usr/local/bin/google-chrome` and the dev server on port 4317.

## GitHub Pages

Live site: [https://laua997.github.io/ima-prototypes/](https://laua997.github.io/ima-prototypes/)

`npm run build:pages` writes a static site in `out/` for that URL. Paths, images, and scripts use the `/ima-prototypes` prefix. `out/404.html` is a copy of `out/index.html`, and `out/.nojekyll` is included. The site root is the `gh-pages` branch. `.github/workflows/pages.yml` rebuilds `out/` and publishes it there on each push to `main`.

## The three tasks

**01 · prototype** (`/tangents`). A sample search box, not a live search engine. Start, search, open a sample page, and save it with one click. You can screenshot a part of the page and write what you liked. The side panel only tracks these sample searches and pages. The map can be dragged with the hand tool.

**02 · prototype** (`/notes`). Take a screenshot of part of a sample picture. A window opens with that clip and a box for what you liked. Saved screenshots stay in a list you can edit. Nothing is uploaded.

**03 · prototype** (`/deck`). Choose a few pictures, draw a box, add a note and a source, put the cards in order, and print. Print CSS hides the app buttons. If the pictures do not print, turn on background graphics and use letter-size paper.

Each prototype has **Reset sample**, which clears only that prototype’s browser storage.

## Browser add-on

The `extension` folder is a Chrome add-on you load yourself. It keeps pages you open, saves a page in one click, screenshots a part of a page, and shows them on a map. Install steps are in `extension/README.md`. The three web prototypes stay as they are.

## Sample images

Credits sit on each picture. Sources include Wikimedia Commons files from Emőke Dénes, Philippe Alès, Leonardo da Vinci (British Museum), Mark Landon, Edwin Howland Blashfield, the Cooper Hewitt, and the Museo Egizio. They are sample pictures, not live research data.
