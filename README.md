# Tangents

Tangents is a prototype for people who research with pictures. It keeps a session while you browse, then lays out the main trail, the detours, and the moments the idea shifted.

Open `index.html` to switch between the two views.

- **Tangents Companion** (`browser.html`) is a small box that floats over a sample browser.
- **Tangents Desktop** (`app.html`) is the map of a finished session. The three demos are `?s=kintsugi`, `?s=light`, and `?s=onboard`.

There is no build step. The pages, the pictures in `images/`, and `sessions.json` are plain files. Paths are relative, so the same folder works locally and at [https://laua997.github.io/ima-prototypes/](https://laua997.github.io/ima-prototypes/).

`instagram.html` is a separate sample for a usability test. It is a desktop Instagram feed with the Tangents box in the corner. You can save one detail of a picture, tag it, write why you saved it, and open a map of those saves. Reset sample clears only what you saved in that browser. The feed uses the pictures already in `images/`.
