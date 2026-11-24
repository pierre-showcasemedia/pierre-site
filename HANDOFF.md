# Handoff: putting Showcase Media's website and booking form live

The website's part of going live. Every account is **Pierre's own**; the
build email is invited where help is needed. The full order for the site and
the studio together is in the studio repo's `HANDOFF.md`
(`pierre-showcasemedia/pierre-studio`); follow that one.

**The rules**

- Secrets are pasted by Pierre straight into Vercel. Never in the code, the
  docs, a commit, chat or email. `.env.example` lists the names.
- showcasemedia.pro is registered at **Porkbun**, and its DNS and email
  (pierre@ and mediahero@) are there too. Today the domain forwards to
  pierrestephenson.com, his Framer site. Pierre wants the forwarding left on
  until the new site is ready, to avoid downtime. Export the zone before any
  change, change only the website records, and never touch an email record
  (MX, SPF, autodiscover). The nameservers stay at Porkbun.

## 1. GitHub

The code goes in `pierre-showcasemedia/pierre-site`. Push to `main` = live
once the Vercel project exists. The Claude GitHub App is installed on the
pierre-showcasemedia account (Nov 18), so the build pushes here directly.

## 2. Vercel

Pierre's team "Showcase Media LLC": Add New Project, import
`pierre-showcasemedia/pierre-site`. Framework preset **Next.js**. Deploy. It
runs in test mode until the settings below are in.

## 3. Settings (Vercel, Environment Variables)

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | `https://www.showcasemedia.pro` |
| `STUDIO_URL` | `https://portal.showcasemedia.pro` (server only) |
| `STUDIO_INTAKE_SECRET` | the same value as the studio's `BOOKING_INTAKE_SECRET`; Pierre pastes it |
| `NEXT_PUBLIC_PORTAL_URL` | `https://portal.showcasemedia.pro` (the default already) |
| `NEXT_PUBLIC_FORMSPREE_ID` | `mjywydge` (his "Booking requests" form; not a secret) |
| `NEXT_PUBLIC_BOOKING_TEST_MODE` | `false` once a test booking reaches both the studio and Formspree |

## 4. Test booking

Pierre books from his phone with a second email: a size, a bundle and an
add-on. The booking shows in the studio under Bookings with the same total as
the website, and a copy lands in Formspree.

## 5. The domain (last, on the call, with Pierre watching)

1. Export the Porkbun DNS zone for showcasemedia.pro (or screenshot every record).
2. Vercel, Settings, Domains: add `showcasemedia.pro` and `www.showcasemedia.pro`.
3. Porkbun: turn off the URL forwarding for showcasemedia.pro, then add the
   records for the root and `www` exactly as Vercel shows them. Records only:
   the nameservers stay at Porkbun, and every email record stays as it is.
4. Send Pierre a test email from another account and check it arrives; book
   once more from the live address. Keep the Framer site and
   pierrestephenson.com for a week.

## What's on the site, and where it came from

- **Prices:** his Nov 2026 price sheet PDF (PriceSheet-Nov2026.pdf), plus
  Showcase Photography ($175) and the drone and 3D tour prices on their own
  from his current site (the PDF doesn't list them). Only large group
  portraits (10+) and timelapse are quoted, as on his sheet. Tours and tour
  bundles over 7,500 sq ft are quoted, and properties over 10,000 sq ft are
  quoted. The free floor plan covers up to 3,000 sq ft of total scanned
  space; the larger floor plan ($30, $50, $75 by scanned size) is an optional
  add-on (Nov 23), never charged from the finished size.
- **Travel:** free within 25 miles of his location on the east side of
  Madison, near Sun Prairie, then $0.50 a
  mile round trip. The form can't measure miles, so Pierre confirms the fee.
- **Cancellation:** under 24 hours notice, 50% plus any travel fees if he is
  already on the way (in the booking terms).
- **Agent rates** (Stark Preferred, Preferred Agent, HomeTeam4U) are private
  and are NOT in this repo: anything in `src/lib/pricing.ts` ships in the
  website's code. They live in the studio (`src/lib/agent-rates.ts` and its
  `HANDOFF.md`).
- **Copy:** About is about the business, with Pierre as founder (Nov 23: other
  photographers shoot for him too); his Testimonials (quotes, word for word);
  his contact details. "Work" is "Portfolio" (one mixed gallery, `/work` links
  redirect).
- **Photos and logo:** from his current site (his own work), resized for the web.

## The homepage hero video

Pierre chose the Dark30 version (Nov 20 files). On Nov 23 he found the first
encode too soft, the logo in the middle most of all: it had been squeezed to
1280 wide at about 1 Mbps to stay under 10 MB. It is now three files in
`public/clips/`, made from his Dark30-V2 file:

- `hero-1920-av1.mp4`: AV1, 1920 wide, for browsers that play AV1.
- `hero-1920.mp4`: H.264, 1920 wide, for every other computer.
- `hero-1280.mp4`: H.264, 1280 wide, for phones (up to 767 px wide).

Compared with his original on the logo area at 3, 20 and 45 seconds (SSIM,
1.0 = identical): H.264 0.92 to 0.97, AV1 0.82 to 0.93 (its logo is as sharp;
it smooths the background a little), phone 0.90 to 0.96. The first encode
scored 0.79 to 0.88. Sizes: AV1 33 MB, H.264 52 MB, phone 20 MB, for 67 s. To swap in a new clip:

```bash
node scripts/add-hero-video.mjs "WebsiteHeroVideo-Dark30-V2.mp4"
```

Check with `npm run dev`, then commit and push. `--remove` puts the still
photo back. Don't lower the quality to save size; a shorter clip from Pierre
is the way to make it lighter. If the logo ever needs to be sharper still, the
option is a video without the logo, with his logo laid over it as a sharp
image; that needs a no-logo version from him. He also has an animated logo
(ShowcaseMediaAnimate01.mp4) that isn't used yet.

## New pages and booking form additions (branch `new-scope`, Nov 24 2026)

Built at Hammad's go-ahead (Nov 24) on the `new-scope` branch, not on `main`,
from Pierre's review call list:

- **A page per service:** `/services/photography`, `/services/aerial`,
  `/services/tours`, `/services/video`, `/services/twilight`,
  `/services/staging`, `/services/portraits`. Words from `services` in
  `src/config/site.ts`, what can be booked from `src/lib/service-catalog.ts`.
  They show no prices and link to `/pricing`.
- **Pricing page** (`/pricing`, in the menu): every price from
  `src/lib/pricing.ts`, behind a short form (name and email, phone and "I am"
  optional). Each lead goes to the studio (Admin, Leads) and to Formspree;
  the browser then keeps the list open. A soft gate: the booking form still
  shows prices as it is filled in. Test mode opens it without sending.
- **Address suggestions and distance** on the booking form, once Pierre adds
  his own key (below). The driving distance from the studio picks the area
  and goes to the studio in the notes. It never changes a price.
- **Plat map upload** on the booking form (PDF or photo, up to 25 MB), next
  to the plat map link. Needs the studio's R2 CORS rule to list the
  website's addresses (studio HANDOFF, section 6).
- **Visit sources:** the first page, the referring site and any UTM tags,
  kept for the browser tab only (no cookies) and sent with a lead or booking.
- Checks: `scripts/check-service-pages.ts`.

### Testing on a laptop: `npm run test:server`

Every local test of the site uses `npm run test:server` (port 3124), never
`next start` with real settings. It sets `NEXT_PUBLIC_SITE_TEST_RUN=1`: no
Formspree id, no studio except a localhost one (`--studio
http://localhost:3171`), no Maps key, forms in test mode. It refuses to start
if an env file holds a real Formspree id, studio address, intake secret or
Maps key, and `next.config.ts` refuses the build too. So a test can never land
in Pierre's inbox, his studio or his email. Checked by
`scripts/check-test-run.ts`.

### Address suggestions: Pierre's Google key (about 10 minutes, optional)

In Pierre's own Google Cloud account (a billing account is required; Google's
monthly free usage covers a small business, and a budget alert is wise):

1. Create a project, for example "Showcase website".
2. APIs and Services, enable **Maps JavaScript API**, **Places API (New)**
   and **Routes API** (or **Distance Matrix API** if Google still offers it
   to the project; the form tries that first, then the Routes API).
3. Credentials, **Create credentials, API key**. Restrict it: Application
   restrictions **Websites**, add `https://www.showcasemedia.pro/*`,
   `https://showcasemedia.pro/*` and the preview `.vercel.app` address; API
   restrictions, the APIs above only.
4. Vercel, pierre-site, Environment Variables: `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
   = the key, Production and Preview. Redeploy.

This is a browser key: it is visible to visitors by design, which is why the
restrictions matter. Without it the address box is plain typing, as before.
Google's terms ask for the "Suggestions by Google" line under the list.

## Open items

- Past galleries: `site.pastGalleries.show` in `src/config/site.ts` adds a
  "Past galleries" link to his Pic-Time page next to Client Login (footer and
  mobile menu). Off until Pierre says yes (ask on Call 2).

- The Video collection (/work/video) has the five YouTube films from his
  current homepage. Swap or add films with `--video` on add-project, or
  edit `videos` in `src/data/projects.json`.
- Matterport tour links, if he wants them on the site (`tours` in
  `src/config/site.ts`).
