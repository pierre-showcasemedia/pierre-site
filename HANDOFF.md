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
once the Vercel project exists. Pushes from the build need the Claude GitHub
App installed on the pierre-showcasemedia account.

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

- **Prices:** his published price sheet (his current site, read Nov 17 2026).
  Every service, bundle and add-on has his price; only large group portraits
  (10+) and timelapse are quoted, as on his sheet. Sizes follow his bands:
  tours and tour bundles over 7,500 sq ft are quoted, and properties over
  10,000 sq ft are quoted. The free floor plan's large-property fee ($30, $50,
  $75) is added for homes over 3,000 sq ft.
- **Copy:** his About page (bio in his own words), his Testimonials (six
  quotes, word for word), his contact details and travel rule (no travel fee
  within 30 miles of east Madison).
- **Photos and logo:** from his current site (his own work), resized for the web.

## Open items

- His agent rate sheets (Stark Company Realtors, Preferred Agent, HomeTeam4U):
  they are not on the public form. Those clients are invoiced at their rates
  from the studio. The Nov 2026 PDF price sheets he sent by Dropbox could not
  be opened from the build machine: compare them against the published prices
  in `src/lib/pricing.ts` and change anything that differs.
- Cancellation policy and any other booking terms (none are promised until he
  gives them).
- Instagram, Facebook or YouTube links (hidden until set in `src/config/site.ts`).
- His walkthrough films (YouTube) and Matterport tour links, if he wants them
  on the Work pages.
