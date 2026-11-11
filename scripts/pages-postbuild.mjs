import fs from "fs";
import path from "path";

const out = path.resolve("out");
fs.copyFileSync(path.join(out, "index.html"), path.join(out, "404.html"));
fs.writeFileSync(path.join(out, ".nojekyll"), "");
console.log("Wrote out/404.html and out/.nojekyll");
