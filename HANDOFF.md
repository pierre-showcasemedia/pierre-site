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

## Open items

- Past galleries: `site.pastGalleries.show` in `src/config/site.ts` adds a
  "Past galleries" link to his Pic-Time page next to Client Login (footer and
  mobile menu). Off until Pierre says yes (ask on Call 2).

- The Video collection (/work/video) has the five YouTube films from his
  current homepage. Swap or add films with `--video` on add-project, or
  edit `videos` in `src/data/projects.json`.
- Matterport tour links, if he wants them on the site (`tours` in
  `src/config/site.ts`).
