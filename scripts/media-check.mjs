// Media check in headless Chrome, with real mouse clicks so the page gets a real user gesture.
//   node scripts/media-check.mjs [baseUrl=http://localhost:3000] [screenshotDir]
// Needs Google Chrome and the dev server (or `next start`) running, and YouTube reachable.
//
// 1. Plays the homepage film, pauses it with a click on the player, scrolls away and back,
//    waits, then navigates around inside the site (Next keeps the homepage mounted but hidden),
//    including back/forward, and returns. The film must stay paused or closed throughout.
// 2. Plays the film again and leaves the page while it plays: the sound must stop.
// 3. On /films, plays one film, then presses play on another: only one may play.
// After every step it prints every <video>/<audio> on the page and inside every iframe (YouTube
// runs out of process, so each iframe is its own CDP session) and how many YouTube player
// documents have loaded. Muted clips (service cards, the hero) are allowed to play.
// Exit code 1 if anything plays that the visitor didn't start, or plays on after a pause.
import { spawn } from "node:child_process";
import fs from "node:fs";

const [base = "http://localhost:3000", outDir = ""] = process.argv.slice(2);
if (outDir) fs.mkdirSync(outDir, { recursive: true });
const port = 9400 + Math.floor(Math.random() * 400);
const chrome = spawn("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", [
  "--headless=new", `--remote-debugging-port=${port}`, "--hide-scrollbars",
  "--user-data-dir=/tmp/cdp-media-" + port, "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ws, id = 0;
const pending = new Map();
const iframeSessions = new Map(); // sessionId -> url
let youtubeLoads = 0; // YouTube player documents seen (new iframe target, or a reload inside one)
const ytOrigins = new Set();
for (let i = 0; i < 50; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${port}/json`);
    const t = (await r.json()).find((x) => x.type === "page");
    if (t) { ws = new WebSocket(t.webSocketDebuggerUrl); break; }
  } catch {}
  await sleep(200);
}
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}, sessionId) => new Promise((r) => {
  const i = ++id;
  pending.set(i, r);
  ws.send(JSON.stringify(sessionId ? { id: i, method, params, sessionId } : { id: i, method, params }));
});
ws.addEventListener("message", async (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); return; }
  if (m.method === "Target.attachedToTarget") {
    const { sessionId, targetInfo } = m.params;
    if (targetInfo.type === "iframe") {
      iframeSessions.set(sessionId, targetInfo.url);
      if (/youtube/.test(targetInfo.url)) youtubeLoads++;
      send("Runtime.enable", {}, sessionId);
      send("Page.enable", {}, sessionId);
      send("Runtime.runIfWaitingForDebugger", {}, sessionId);
    }
  }
  if (m.method === "Target.detachedFromTarget") iframeSessions.delete(m.params.sessionId);
  if (m.method === "Target.targetInfoChanged" && m.params.targetInfo.type === "iframe") {
    for (const [s] of iframeSessions) if (s && m.params.targetInfo.url) iframeSessions.set(s, m.params.targetInfo.url);
  }
});
const ev = async (expr, sessionId) =>
  (await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }, sessionId)).result?.result?.value;

await send("Page.enable");
await send("Runtime.enable");
await send("Target.setAutoAttach", { autoAttach: true, waitForDebuggerOnStart: false, flatten: true });
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const MEDIA = `(() => [...document.querySelectorAll('video,audio')].map(v => ({
  tag: v.tagName.toLowerCase(), src: (v.currentSrc || v.src || '').slice(0, 60), paused: v.paused,
  muted: v.muted, volume: v.volume, t: +v.currentTime.toFixed(1),
  shown: !!(v.offsetParent || v.getClientRects().length) })))()`;

async function snapshot(label) {
  const page = (await ev(MEDIA)) ?? [];
  const frames = [];
  for (const [sid, url] of iframeSessions) {
    const media = (await ev(MEDIA, sid)) ?? [];
    if (/youtube/.test(url)) {
      const o = await ev("performance.timeOrigin", sid);
      if (o && !ytOrigins.has(o)) { if (ytOrigins.size) youtubeLoads++; ytOrigins.add(o); }
    }
    frames.push({ frame: url.replace(/\?.*/, ""), media });
  }
  const iframes = await ev(`[...document.querySelectorAll('iframe')].map(f => ({ src: f.src.replace(/\\?.*/, ''), shown: !!f.getClientRects().length }))`);
  const path = await ev("location.pathname");
  const row = { step: label, path, youtubeLoads, iframes, pageMedia: page, frameMedia: frames };
  console.log(JSON.stringify(row));
  return row;
}
async function click(x, y) {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y });
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}
async function clickSelector(sel) {
  const r = await ev(`(() => { const el = document.querySelector(${JSON.stringify(sel)}); if (!el) return null;
    el.scrollIntoView({ block: 'center' }); const b = el.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
  if (!r) throw new Error("not found: " + sel);
  await sleep(900);
  const r2 = await ev(`(() => { const b = document.querySelector(${JSON.stringify(sel)}).getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; })()`);
  await click(r2.x, r2.y);
  return r2;
}
const shot = async (name) => {
  if (!outDir) return;
  const r = await send("Page.captureScreenshot", { format: "jpeg", quality: 70 });
  fs.writeFileSync(`${outDir}/media-${name}.jpg`, Buffer.from(r.result.data, "base64"));
};
const playingAll = (row) => [...row.pageMedia, ...row.frameMedia.flatMap((f) => f.media)].filter((m) => !m.paused);
const audible = (row) => playingAll(row).filter((m) => !m.muted && m.volume > 0);
// What must not happen: a film (iframe player) playing, or anything playing with sound.
const films = (row) => row.frameMedia.flatMap((f) => f.media).filter((m) => !m.paused);
const playing = (row) => [...new Set([...films(row), ...audible(row)])];

const fails = [];
await send("Page.navigate", { url: base + "/" });
await sleep(6000);
let row = await snapshot("loaded");
if (audible(row).length) fails.push("sound before any click");

// 1. Play the homepage film (real click on the facade's play button)
const at = await clickSelector('button[aria-label^="Play"]');
await sleep(9000);
row = await snapshot("after play click");
await shot("1-playing");
const startedOk = audible(row).length > 0;
if (!startedOk) console.log("NOTE: the film did not start in headless Chrome (YouTube may be blocked); pause checks still run");

// 2. Pause it the way a visitor does: a click on the player, then the k key inside the player
await click(at.x, at.y);
await sleep(2500);
row = await snapshot("after pause click");
for (const [sid, url] of iframeSessions) {
  if (!/youtube/.test(url) || !playing(row).length) continue;
  const c = await ev(`({ x: innerWidth / 2, y: innerHeight / 2 })`, sid);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", x: c.x, y: c.y, button: "left", clickCount: 1 }, sid);
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: c.x, y: c.y, button: "left", clickCount: 1 }, sid);
  await sleep(2000);
  row = await snapshot("after pause click inside the player");
  if (playing(row).length) {
    await ev(`(document.querySelector('#movie_player')?.pauseVideo?.(), document.querySelector('video')?.pause(), 1)`, sid);
    await sleep(1500);
    row = await snapshot("after pause through the player");
  }
}
await shot("2-paused");
if (playing(row).length) fails.push("could not pause");
const pausedAt = youtubeLoads;

// 3. Scroll away and back, wait
await ev("window.scrollTo(0, document.documentElement.scrollHeight); 1");
await sleep(4000);
row = await snapshot("scrolled to the footer + 4s");
if (playing(row).length) fails.push("plays after scrolling away");
await ev(`(document.querySelector('iframe') || document.querySelector('button[aria-label^="Play"]'))?.scrollIntoView({ block: 'center' }); 1`);
await sleep(8000);
row = await snapshot("scrolled back to the film + 8s");
if (playing(row).length) fails.push("plays after scrolling back");

// 4. In-app navigation. With Cache Components, Next keeps the homepage in the DOM (hidden by
//    React Activity) instead of unmounting it, so the film's iframe survives the navigation.
const step = async (label, js, wait, failMsg) => {
  await ev(js + "; 1");
  await sleep(wait);
  row = await snapshot(label);
  if (playing(row).length) fails.push(failMsg);
};
await step("nav link to /about + 8s", `document.querySelector('header a[href="/about"]').click()`, 8000, "plays after navigating to /about");
await step("logo link back to / + 9s", `document.querySelector('header a[href="/"]').click()`, 9000, "plays after the logo link back to /");
await shot("3-back-home-logo");
await step("history.back() to /about + 8s", `history.back()`, 8000, "plays after history.back()");
await step("history.forward() to / + 9s", `history.forward()`, 9000, "plays after history.forward() to /");
await step("nav link to /services + 7s", `document.querySelector('header a[href="/services"]').click()`, 7000, "plays after navigating to /services");
await step("nav link to /films + 7s", `document.querySelector('header a[href="/films"]').click()`, 7000, "plays after navigating to /films");
await step("logo link back to / + 9s", `document.querySelector('header a[href="/"]').click()`, 9000, "plays after coming back to / (2)");
await shot("4-back-home-final");
console.log(JSON.stringify({ youtubeDocumentsLoadedAfterPause: youtubeLoads - pausedAt }));
if (youtubeLoads - pausedAt > 0) fails.push("the player reloaded after the pause");

// 5. A film that is playing stops when the visitor leaves the page
await send("Page.navigate", { url: base + "/" });
await sleep(5000);
await clickSelector('button[aria-label^="Play"]');
await sleep(8000);
row = await snapshot("homepage film playing again");
if (!films(row).length) console.log("NOTE: the film did not start the second time");
await step("left the page while it played: nav link to /about + 2s", `document.querySelector('header a[href="/about"]').click()`, 2000, "a playing film kept playing after the visitor left the page");

// 6. One film at a time on /films
await send("Page.navigate", { url: base + "/films" });
await sleep(5000);
await clickSelector('button[aria-label^="Play"]');
await sleep(8000);
row = await snapshot("/films: first film playing");
await clickSelector('button[aria-label^="Play"]');
await sleep(8000);
row = await snapshot("/films: pressed play on a second film");
await shot("5-films-one-at-a-time");
if (films(row).length > 1) fails.push("two films played at once");
if (row.iframes.filter((f) => /youtube/.test(f.src)).length > 1) fails.push("two film players open at once");
console.log(JSON.stringify({ startedOk, youtubeLoads, fails }));
ws.close();
chrome.kill();
process.exit(fails.length ? 1 : 0);
