# Tangents

Tangents is a prototype for people who research with pictures. It keeps a session while you browse, then lays out the main trail, the detours, and the moments the idea shifted.

Open `index.html` to switch between the two views.

- **Tangents Companion** (`browser.html`) is a small box that floats over a sample browser.
- **Tangents Desktop** (`app.html`) is the map of a finished session. The three demos are `?s=kintsugi`, `?s=light`, and `?s=onboard`.

There is no build step. The pages, the pictures in `images/`, and `sessions.json` are plain files. Paths are relative, so the same folder works locally and at [https://laua997.github.io/ima-prototypes/](https://laua997.github.io/ima-prototypes/).

`instagram.html` is a separate sample for a usability test. A browser frame switches between a desktop Instagram feed and a desktop Pinterest grid without reloading, so the Tangents box keeps the same session. You can save one detail of a picture on either site, tag it, write why you saved it, and open a map. Each save keeps the site and the account or board. Reset sample clears only what you saved in that browser. Both feeds use the pictures already in `images/`.
