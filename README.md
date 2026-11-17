# Showcase Media: website and booking form

One Next.js project for **showcasemedia.pro** (Pierre Stephenson, Showcase
Media LLC, Madison, Wisconsin).

| Part | Where | What it does |
|---|---|---|
| Website | `/`, `/work`, `/services`, `/about`, `/contact` | The portfolio. One file (`src/data/projects.json`) drives every project page. |
| Booking form | `/book` | Picks the size, a package and the add-ons, shows the estimate (the only place prices appear) and sends the booking to the studio, with a Formspree copy. |
| Client galleries | not here | Galleries live in Pierre's studio at **portal.showcasemedia.pro** (`pierre-showcasemedia/pierre-studio`). Every "Client Login" link goes there (`NEXT_PUBLIC_PORTAL_URL`). |

**Start here:** [HANDOFF.md](HANDOFF.md) has the go-live steps for the site;
the studio's `HANDOFF.md` has the whole order for both.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:3000. Without a `.env.local` the booking form runs in **test mode** (shows what it would send, sends nothing).

## The everyday commands (or just ask Claude in plain English)

| You say to Claude | It runs |
|---|---|
| "Add a new project, photos in Desktop/Lakeview, it's 1234 Example Lane in Middleton, shot for Jane Agent" | `node scripts/add-project.mjs "Desktop/Lakeview" --name "1234 Example Lane" --location "Middleton, Wisconsin" --credit "Listed by Jane Agent"` |
| "Make a collection from these single photos, captioned by property" | name the files `01 Lakeview.jpg`, `02 Kitchen.jpg` ... then add `--captions` to the command above |
| "Take the Twilight collection off the site" | `node scripts/remove-project.mjs twilight` |
| "Put this clip on the Film card" | puts the MP4 (and WebM) in `public/clips/` and sets `clip` on that service in `src/config/site.ts` |
| "Change the twilight photography price" | edits `src/lib/pricing.ts` here and the studio's copy, then bumps `PRICING_VERSION` |
| "Change my phone number on the site" | edits `src/config/site.ts` |

Then `git add -A && git commit -m "..." && git push`. Vercel puts it live in about a minute.

## Where things live

```
src/config/site.ts        business details, services (and their clips), testimonials, trusted-by names, credentials
src/lib/pricing.ts        the price table (the studio has an exact copy), areas, time windows
src/config/booking.ts     booking form wording and terms
src/app/globals.css       design tokens (near black, white, slate; Instrument Sans and Manrope). A brand change is a token change.
src/data/projects.json    the portfolio, in display order
public/images/projects/   web-size portfolio photos (1600px). Originals never go in here.
public/images/site/       service posters, the share image, the CTA photo, film covers, the portrait
public/brand/             logo files (PNG: the lockup and the S mark, ink and white)
scripts/                  add-project, remove-project
```

## Media rules (don't break these)

- **Nothing plays with sound unless the visitor pressed play.** Films load only on a press (`VideoFacade`), close when the visitor leaves the page, never restart by themselves, and only one plays at a time.
- **Service card clips are always muted**, start only when the card is on screen, pause when it leaves, and never play for visitors who ask for reduced motion (`ServiceMedia`). Use Pierre's real footage only.
- To check both in headless Chrome after any change to them, run the media check described in HANDOFF.md.

## Booking form

`/book` is a step-by-step form with a live estimate (no tax line). Prices live only in `src/lib/pricing.ts`, the same table the studio prices with; nothing else on the site shows a price. The form posts to `/api/booking`, which prices the request again, sends it to the studio and keeps a Formspree copy as the archive. Success when either accepts.

| Env var | Where | What |
|---|---|---|
| `STUDIO_URL` | Vercel (server) | The studio's address, `https://portal.showcasemedia.pro`. Bookings go to `STUDIO_URL/api/studio/bookings`. |
| `STUDIO_INTAKE_SECRET` | Vercel (server) | The shared secret; the same value as the studio's `BOOKING_INTAKE_SECRET`. Never in code or chat. |
| `NEXT_PUBLIC_FORMSPREE_ID` | Vercel | The Formspree form ID (not a secret). `FORMSPREE_ID` works too. |

With none of them set (your laptop, a preview with no keys) the form runs in **test mode**: it shows the confirmation and the exact payload the studio would get, and sends nothing.

Changing a price: edit the table in **both** `src/lib/pricing.ts` here and `src/lib/booking-pricing.ts` in the studio, bump `PRICING_VERSION`, then run `npx tsx scripts/check-pricing.ts` (with the studio repo next to this one as `../pierre-studio`, or `STUDIO_DIR=...`). It proves the two files are identical.

Where the prices came from: Pierre's Nov 2026 price sheet PDF, plus Showcase
Photography and the drone and 3D tour prices on their own from his current
site. His agent rate sheets are private and live only in the studio
(`src/lib/agent-rates.ts`): never put them in `src/lib/pricing.ts`, which
ships in the website's code.
