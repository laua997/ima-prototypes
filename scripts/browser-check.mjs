import puppeteer from "puppeteer-core";
import fs from "fs";

const out = "/tmp/e2e-shots";
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: "/usr/local/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu", "--window-size=1440,960"],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 960 });
page.setDefaultTimeout(20000);

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures.push(name + (detail ? ": " + detail : ""));
}

async function shot(name) {
  await page.screenshot({ path: `${out}/${name}.png` });
}

async function clickText(text) {
  const handle = await page.evaluateHandle((label) => {
    const nodes = [...document.querySelectorAll("button, a, label")];
    const needle = label.toLowerCase();
    return (
      nodes.find((node) => (node.innerText || "").replace(/\s+/g, " ").toLowerCase().includes(needle)) || null
    );
  }, text);
  const element = handle.asElement();
  if (!element) throw new Error(`Could not click: ${text}`);
  await element.click();
}

async function waitText(text) {
  await page.waitForFunction(
    (label) => document.body.innerText.toLowerCase().includes(label.toLowerCase()),
    { timeout: 15000 },
    text,
  );
}

try {
  await page.goto("http://127.0.0.1:4317/", { waitUntil: "networkidle0" });
  await waitText("Three ways to keep a picture nearby");
  await shot("01-launcher");
  const launcherText = await page.evaluate(() => document.body.innerText.toLowerCase());
  check(
    "launcher uses prototype titles",
    (launcherText.match(/\bprototype\b/g) || []).length >= 3 &&
      !launcherText.includes("tangents") &&
      !launcherText.includes("reference notes") &&
      !launcherText.includes("physical reference"),
  );

  await page.evaluate(() => localStorage.removeItem("ima-tangents-v1"));
  await page.goto("http://127.0.0.1:4317/tangents", { waitUntil: "networkidle0" });
  check("document title", (await page.title()) === "prototype", await page.title());
  await page.waitForSelector("#search-box");
  await shot("02-search-home");
  const boxes = await page.$$('[role="checkbox"]');
  check("no consent checklist", boxes.length === 0, String(boxes.length));
  check("search has no google branding", !(await page.evaluate(() => document.body.innerText.toLowerCase().includes("google"))));
  await page.click("#start-session");
  await page.type("#search-box", "drapery folds");
  await page.click("#search-go");
  await page.waitForFunction(() => location.pathname.includes("/tangents/search"));
  await waitText("Kneeling drape");
  await shot("03-search-results");
  await page.click("#images-tab");
  await page.waitForSelector('a[href="/tangents/plate/kneeling-drape"] img');
  const imageGrid = await page.evaluate(() => document.querySelectorAll('a[href="/tangents/plate/kneeling-drape"] img').length);
  check("images tab", imageGrid > 0, String(imageGrid));
  await page.click('a[href="/tangents/plate/kneeling-drape"]');
  await page.waitForFunction(() => location.pathname.includes("kneeling-drape"));
  const opened = await page.evaluate(() => document.body.innerText.toLowerCase());
  check("quiet visit recorded", /1 opened/.test(opened), opened.slice(0, 280));
  await page.click("#keep-plate");
  await page.waitForFunction(() => document.querySelector("#keep-plate")?.textContent?.includes("Saved"));
  await shot("04-tangents-kept");
  check("kept without typing", !(await page.$("#note")));
  const hasNudge = await page.evaluate(() => document.body.innerText.includes("Not now"));
  if (hasNudge) await clickText("Not now");
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((node) => node.textContent?.trim() === "Collapse");
    button?.click();
  });
  await page.waitForSelector("#reopen-panel");
  check("panel collapsed", true);
  await page.click("#reopen-panel");
  await page.waitForSelector("#keep-plate");
  await shot("05-tangents-reopened");
  await page.click("#add-note");
  await page.waitForSelector("#note");
  await page.type("#note", "The hand disappears into the cloth.");
  await page.click("#save-note");
  await waitText("Note saved");
  await page.click('a[href="/tangents/map"]');
  await page.waitForFunction(() => location.pathname.includes("/tangents/map"));
  await waitText("Pages opened");
  await page.waitForSelector("#hand-tool");
  await page.keyboard.down("Space");
  const spaceCursor = await page.$eval("#map-canvas", (el) => getComputedStyle(el).cursor);
  await page.keyboard.up("Space");
  check("space grabs the map", spaceCursor === "grab", spaceCursor);
  await page.click("#hand-tool");
  const handCursor = await page.$eval("#map-canvas", (el) => getComputedStyle(el).cursor);
  const pressed = await page.$eval("#hand-tool", (el) => el.getAttribute("aria-pressed"));
  check("hand tool on", pressed === "true" && handCursor === "grab", `${pressed} ${handCursor}`);
  const canvasBox = await page.$eval("#map-canvas", (el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, left: el.scrollLeft, top: el.scrollTop };
  });
  await page.mouse.move(canvasBox.x + 40, canvasBox.y + 40);
  await page.mouse.down();
  await page.mouse.move(canvasBox.x + 180, canvasBox.y + 140, { steps: 10 });
  await page.waitForFunction(() => getComputedStyle(document.querySelector("#map-canvas")).cursor === "grabbing");
  const grabbing = await page.$eval("#map-canvas", (el) => getComputedStyle(el).cursor);
  await page.mouse.up();
  const afterPan = await page.$eval("#map-canvas", (el) => ({ left: el.scrollLeft, top: el.scrollTop }));
  check("map dragged", afterPan.left !== canvasBox.left || afterPan.top !== canvasBox.top, JSON.stringify(afterPan));
  check("grabbing cursor", grabbing === "grabbing", grabbing);
  await page.click("#back-to-center");
  await shot("06-tangents-map");
  const mapText = await page.evaluate(() => document.body.innerText);
  const mapLower = mapText.toLowerCase();
  check("map has the search and the page", mapLower.includes("drapery") && mapLower.includes("kneeling drape"), mapText.slice(0, 700));
  check("saved count", /saved\s+1/.test(mapLower), mapLower.match(/saved\s+\d+/)?.[0] || "none");
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href="/tangents/plate/kneeling-drape"]')].sort(
      (a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width,
    )[0];
    if (!link) throw new Error("map link missing");
    link.setAttribute("data-e2e-target", "reopen");
    link.click();
  });
  await page.waitForFunction(() => location.pathname.includes("kneeling-drape"));
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("#add-note")].find((node) => {
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.top >= 0 && rect.top < window.innerHeight;
    });
    if (!button) throw new Error("add note missing");
    button.click();
  });
  const noteValue = await page.evaluate(() => {
    const field = [...document.querySelectorAll("#note")].find((node) => node.getBoundingClientRect().height > 0);
    return field ? field.value : "";
  });
  check("reopened optional note", noteValue.includes("hand disappears"), noteValue);
  await shot("07-tangents-note");
  await page.evaluate(() => {
    const link = [...document.querySelectorAll('a[href="/tangents/before"]')].find((node) => node.getBoundingClientRect().width > 0);
    link?.click();
  });
  await page.waitForFunction(() => location.pathname.includes("/tangents/before"));
  await waitText("Before you finish");
  await shot("08-before-you-go");
  const beforeText = await page.evaluate(() => document.body.innerText);
  check("optional other picture and finish", beforeText.includes("Open this picture") && beforeText.includes("Finish browsing"));
  await clickText("Finish browsing");
  await page.waitForFunction(() => location.pathname.includes("/tangents/map"));

  await page.goto("http://127.0.0.1:4317/notes", { waitUntil: "networkidle0" });
  check("notes document title", (await page.title()) === "prototype", await page.title());
  await waitText("Sample pictures");
  await page.evaluate(() => {
    const card = [...document.querySelectorAll("article")].find((node) => node.innerText.includes("Kneeling drape"));
    const button = [...(card?.querySelectorAll("button") || [])].find((node) => node.innerText.includes("Take a screenshot"));
    button?.click();
  });
  await page.waitForSelector("#shot-stage");
  await shot("09-notes-shelf");
  const stage = await page.$("#shot-stage");
  const stageBox = await stage.boundingBox();
  if (!stageBox) throw new Error("screenshot stage missing");
  await page.mouse.move(stageBox.x + 40, stageBox.y + 50);
  await page.mouse.down();
  await page.mouse.move(stageBox.x + stageBox.width * 0.55, stageBox.y + stageBox.height * 0.45, { steps: 12 });
  await shot("09b-notes-drag");
  await page.mouse.up();
  await page.waitForSelector('[role="dialog"]');
  await waitText("What did you like about this?");
  await shot("10-notes-popup");
  await page.type("#caption", "The hand disappears into the fold.");
  await page.click("#save-caption");
  await waitText("The hand disappears into the fold.");
  const savedList = (await page.evaluate(() => document.body.innerText)).toLowerCase();
  const dialogOpen = await page.$('[role="dialog"]');
  check("screenshot saved in the list", !dialogOpen && savedList.includes("the hand disappears into the fold.") && savedList.includes("saved screenshots"));
  await page.evaluate(() => {
    const button = [...document.querySelectorAll("button")].find((node) => node.innerText.trim() === "Edit");
    button?.click();
  });
  await page.waitForSelector("#caption");
  const edited = await page.$eval("#caption", (el) => el.value);
  check("edit opens the caption", edited.includes("hand disappears"), edited);

  await page.goto("http://127.0.0.1:4317/deck", { waitUntil: "networkidle0" });
  check("deck document title", (await page.title()) === "prototype", await page.title());
  await waitText("Choose pictures to print");
  await shot("11-deck-choose");
  await clickText("Broken hem");
  await clickText("Where the line slows");
  await clickText("Make the cards");
  await waitText("Card 1 of 2");
  await page.type("#card-note", "The torn edge where plaster pretends to be cloth.");
  await shot("12-deck-card");
  await clickText("Save and put in order");
  await waitText("Change the order");
  await clickText("Move down");
  const orderText = await page.evaluate(() => document.body.innerText);
  check("reordered", orderText.indexOf("Where the line slows") < orderText.indexOf("Broken hem"), orderText.slice(0, 500));
  await clickText("See the print page");
  await waitText("Print this page");
  await shot("13-deck-print");
  await page.emulateMediaType("print");
  await shot("14-deck-print-media");
  const printChromeHidden = await page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return false;
    return getComputedStyle(header).display === "none";
  });
  check("print css hides chrome", printChromeHidden);
  check("print sheet numbered", (await page.evaluate(() => document.body.innerText)).includes("01"));
  const printText = await page.evaluate(() => document.body.innerText.toLowerCase());
  check("print card says prototype", printText.includes("prototype") && !printText.includes("at the table"));
} catch (error) {
  console.error("SCRIPT ERROR", error);
  failures.push(String(error));
  try {
    await shot("error");
  } catch {}
} finally {
  console.log("FAILURES", failures.length);
  await browser.close();
  if (failures.length) process.exit(1);
}
