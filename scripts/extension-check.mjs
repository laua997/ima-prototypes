import http from "http";
import fs from "fs";
import path from "path";
import { execFileSync } from "child_process";
import puppeteer from "puppeteer-core";

const ext = path.resolve("/workspace/extension");
const chrome = process.env.CHROME || "/tmp/chrome-for-testing/chrome-linux64/chrome";
const out = "/tmp/ext-shots";
fs.mkdirSync(out, { recursive: true });

const pages = {
  "/red": `<!doctype html><title>Red cloth study</title>
    <style>body{margin:0;background:#f3efe6;font-family:sans-serif}h1{margin:24px}#swatch{position:absolute;left:80px;top:160px;width:320px;height:220px;background:#8e2a1c}</style>
    <h1>Red cloth study</h1><div id="swatch"></div>`,
  "/blue": `<!doctype html><title>Blue ground</title>
    <style>body{margin:0;background:#f3efe6;font-family:sans-serif}h1{margin:24px}#swatch{position:absolute;left:80px;top:160px;width:320px;height:220px;background:#1d4e89}</style>
    <h1>Blue ground</h1><div id="swatch"></div>`,
};

const server = http.createServer((req, res) => {
  const body = pages[req.url] || pages["/red"];
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(body);
});
await new Promise((resolve) => server.listen(4391, "127.0.0.1", resolve));

const failures = [];
function check(name, ok, detail = "") {
  console.log(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);
  if (!ok) failures.push(name + (detail ? ": " + detail : ""));
}

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: false,
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--window-position=40,40",
    "--window-size=1280,860",
    `--disable-extensions-except=${ext}`,
    `--load-extension=${ext}`,
  ],
});

try {
  const workerTarget = await browser.waitForTarget(
    (target) => target.type() === "service_worker" && target.url().startsWith("chrome-extension://"),
    { timeout: 15000 },
  );
  const id = new URL(workerTarget.url()).host;
  const worker = await workerTarget.worker();
  const commands = await worker.evaluate(() => chrome.commands.getAll());
  console.log("commands", JSON.stringify(commands));

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto("http://127.0.0.1:4391/red", { waitUntil: "networkidle0" });

  const popup = await browser.newPage();
  await popup.setViewport({ width: 1280, height: 800 });
  await popup.goto(`chrome-extension://${id}/popup.html`, { waitUntil: "networkidle0" });
  check("popup title", (await popup.title()) === "prototype", await popup.title());
  await popup.click("#start-stop");
  await popup.waitForFunction(() => document.querySelector("#status")?.textContent === "On");
  await popup.waitForFunction(() => document.body.innerText.includes("Red cloth study"));

  await page.goto("http://127.0.0.1:4391/blue", { waitUntil: "networkidle0" });
  await popup.waitForFunction(async () => {
    const data = await chrome.storage.local.get("state");
    const titles = (data.state?.pages || []).map((item) => item.title);
    return titles.includes("Red cloth study") && titles.includes("Blue ground");
  });
  const recorded = await popup.evaluate(async () => {
    const data = await chrome.storage.local.get("state");
    return data.state.pages.map((item) => item.title);
  });
  check("recorded both pages", recorded.includes("Red cloth study") && recorded.includes("Blue ground"), recorded.join(", "));

  await popup.click("#save-page");
  await popup.waitForFunction(() => document.querySelector("#save-page")?.textContent === "Saved");
  const saved = await popup.evaluate(async () => {
    const data = await chrome.storage.local.get("state");
    return data.state.pages.filter((item) => item.saved).map((item) => item.title);
  });
  check("saved the open page", saved.includes("Blue ground"), saved.join(", "));
  await (await popup.$("#panel")).screenshot({ path: `${out}/popup.png` });

  await page.bringToFront();
  await new Promise((resolve) => setTimeout(resolve, 300));
  const seen = new Set(browser.targets());
  const windowId = execFileSync("xdotool", ["search", "--name", "Blue ground"], { encoding: "utf8" }).trim().split("\n").pop();
  execFileSync("xdotool", ["windowactivate", "--sync", windowId]);
  execFileSync("xdotool", ["key", "--window", windowId, "alt+shift+y"]);
  const actionPopup = await browser.waitForTarget(
    (target) => target.url().includes("popup.html") && !seen.has(target),
    { timeout: 8000 },
  );
  const session = await actionPopup.createCDPSession();
  let ready = "missing";
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const probe = await session.send("Runtime.evaluate", {
      expression: `(() => {
        const button = document.querySelector("#take-screenshot");
        const status = document.querySelector("#status")?.textContent || "";
        return JSON.stringify({ button: !!button, status, hidden: document.querySelector("#tools")?.hidden ?? null });
      })()`,
      returnByValue: true,
    });
    ready = probe.result?.value || "missing";
    if (ready.includes('"button":true') && ready.includes('"status":"On"')) break;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  console.log("popup ready", ready);
  const clicked = await session.send("Runtime.evaluate", {
    expression: `(() => { const button = document.querySelector("#take-screenshot"); if (!button) return "missing"; button.click(); return "clicked"; })()`,
    returnByValue: true,
  });
  console.log("popup click", clicked.result?.value);
  const tabs = await worker.evaluate(async () => {
    const all = await chrome.tabs.query({});
    return all.map((tab) => ({ id: tab.id, active: tab.active, url: tab.url, windowId: tab.windowId }));
  });
  console.log("tabs", JSON.stringify(tabs));
  const pages = await browser.pages();
  for (const item of pages) {
    const has = await item.$("#prototype-shot-host");
    console.log("page", item.url(), "overlay", !!has);
  }
  await page.bringToFront();
  await page.waitForSelector("#prototype-shot-host", { timeout: 5000 });
  check("screenshot box injected", true);
  await page.mouse.move(100, 190);
  await page.mouse.down();
  await page.mouse.move(360, 340, { steps: 8 });
  await page.screenshot({ path: `${out}/drag.png` });
  await page.mouse.up();

  const captionTarget = await browser.waitForTarget((target) => target.url().includes("caption.html"), { timeout: 10000 });
  const caption = await captionTarget.page();
  await caption.waitForFunction(() => {
    const clip = document.querySelector("#clip");
    return clip && clip.width > 20 && clip.height > 20;
  });
  const color = await caption.evaluate(() => {
    const clip = document.querySelector("#clip");
    const pixel = clip.getContext("2d").getImageData(Math.floor(clip.width / 2), Math.floor(clip.height / 2), 1, 1).data;
    return Array.from(pixel);
  });
  check("cropped clip is the blue square", color[2] > color[0] + 20 && color[2] > 40, color.join(","));
  check("caption window asks what you liked", (await caption.evaluate(() => document.body.innerText)).includes("What did you like about this?"));
  caption.on("console", (msg) => console.log("CAP", msg.text()));
  caption.on("pageerror", (err) => console.log("CAPERR", err.message));
  await caption.click("#caption");
  await caption.type("#caption", "The blue square is the part I wanted.");
  await caption.screenshot({ path: `${out}/caption.png` });
  await caption.click("#save-caption");
  await new Promise((resolve) => setTimeout(resolve, 1000));
  try {
    console.log("caption after save", await caption.evaluate(() => ({
      notice: document.querySelector("#notice")?.textContent || "",
      value: document.querySelector("#caption")?.value || "",
    })));
  } catch (error) {
    console.log("caption closed", error.message);
  }
  const storedNotes = await popup.evaluate(async () => (await chrome.storage.local.get("state")).state?.notes || []);
  console.log("notes", JSON.stringify(storedNotes));
  check("caption saved", storedNotes.some((note) => note.caption.includes("blue square")), JSON.stringify(storedNotes));

  const map = await browser.newPage();
  await map.setViewport({ width: 1440, height: 960 });
  await map.goto(`chrome-extension://${id}/map.html`, { waitUntil: "networkidle0" });
  await map.waitForFunction(() => document.body.innerText.includes("Blue ground") && document.body.innerText.includes("The blue square"));
  await map.click("#hand-tool");
  const pressed = await map.$eval("#hand-tool", (el) => el.getAttribute("aria-pressed"));
  const cursor = await map.$eval("#map-canvas", (el) => getComputedStyle(el).cursor);
  check("hand tool on", pressed === "true" && cursor === "grab", `${pressed} ${cursor}`);
  const box = await map.$eval("#map-canvas", (el) => {
    const rect = el.getBoundingClientRect();
    return { x: rect.x, y: rect.y, left: el.scrollLeft, top: el.scrollTop };
  });
  await map.mouse.move(box.x + 40, box.y + 220);
  await map.mouse.down();
  await map.mouse.move(box.x + 180, box.y + 80, { steps: 10 });
  await map.waitForFunction(() => getComputedStyle(document.querySelector("#map-canvas")).cursor === "grabbing");
  await map.mouse.up();
  const after = await map.$eval("#map-canvas", (el) => ({ left: el.scrollLeft, top: el.scrollTop }));
  check("map dragged", after.left !== box.left || after.top !== box.top, JSON.stringify(after));
  await map.click("#back-to-center");
  await map.waitForSelector(".card img");
  await map.screenshot({ path: `${out}/map.png` });
  check("map title", (await map.title()) === "prototype", await map.title());
} catch (error) {
  console.error("SCRIPT ERROR", error);
  failures.push(String(error));
  try {
    const pages = await browser.pages();
    if (pages[0]) await pages[0].screenshot({ path: `${out}/error.png` });
  } catch {}
} finally {
  console.log("FAILURES", failures.length);
  await browser.close();
  server.close();
  if (failures.length) process.exit(1);
}
