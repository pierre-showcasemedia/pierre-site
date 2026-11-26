// Everything about the business that shows up on the site lives here.
// Change a phone number, a service description or a quote once, every page updates.
// Source: Pierre's current site (pierrestephenson.com, which showcasemedia.pro
// forwards to), read Nov 17 2026: copy, services, testimonials and contact details.
import heroTimeMap from "@/data/hero-timemap.json";

export const site = {
  name: "Showcase Media",
  legalName: "Showcase Media LLC",
  shortName: "Showcase Media",
  owner: "Pierre Stephenson",
  tagline: "Make your property stand out.",
  positioning:
    "Award-winning real estate and commercial photography, drone aerials, 3D virtual tours and video across Greater Madison, Dane County and Northern Illinois.",
  description:
    "Showcase Media is a Madison, Wisconsin real estate and commercial media company: Showcase Photography with a free floor plan (up to 3,000 scanned sq ft), drone aerials, Matterport and Zillow 3D tours, walkthrough video, twilight, virtual staging and business portraits.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.showcasemedia.pro",
  // Client galleries live in the studio app, not on this site.
  portalUrl: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal.showcasemedia.pro",
  // Galleries from before the new studio stay on Pic-Time (Pierre, Nov 17 2026).
  // show: true adds a "Past galleries" link next to Client Login in the footer
  // and the mobile menu. Off until Pierre says yes.
  pastGalleries: { show: false, label: "Past galleries", url: "https://showcasemediallc.pic-time.com/client" },
  market: "Greater Madison, Dane County and Northern Illinois",
  country: "Wisconsin",
  city: "Madison",
  serviceArea: "Greater Madison, Dane County, Wisconsin and Northern Illinois",
  address: "3315 Ambassador Dr, Madison, WI 53718",
  travel: "No travel fee within 25 miles of our location on the east side of Madison, near Sun Prairie. Farther, travel is $0.50 a mile round trip.",
  email: "mediahero@showcasemedia.pro",
  phoneDisplay: "(608) 345-2123",
  phoneE164: "+16083452123",
  call: "tel:+16083452123",
  text: "sms:+16083452123",
  // Older name kept so shared components still compile: it's his call and text line, not WhatsApp.
  whatsapp: "sms:+16083452123",
  // From Pierre (Nov 17 2026). An empty url hides that link everywhere.
  instagram: { handle: "@showcasemedia.pro", url: "https://www.instagram.com/showcasemedia.pro/" },
  facebook: { handle: "Showcase Media", url: "https://www.facebook.com/profile.php?id=61575736711486" },
  youtube: { handle: "@showcasemediapro", url: "https://www.youtube.com/@showcasemediapro" },
  turnaround: "within 24 hours",
  confirmWithin: "the same day",
  hours: "Shoots Monday to Friday, starting from 9:30 AM to 4 PM. We confirm every time; weekends and earlier or later times by request",
  bookingLead: "We respond extremely quickly.",
  // How clients pay. Pierre invoices; the gallery unlocks once the invoice is paid.
  payment: {
    agents: "Your gallery lands in your client portal, usually within 24 hours.",
    direct: "Your downloads open as soon as your invoice is paid.",
  },
  // The share image (Open Graph and schema.org): a home at twilight. 1200 x 630.
  shareImage: { src: "/images/site/share.jpg", width: 1200, height: 630 },
  // Pixel sizes of the logo files in public/brand (his high-res transparent PNGs, black and white, Nov 17 2026)
  logo: { width: 2400, height: 801 },
  logoStacked: { width: 2400, height: 801 },
  mark: { width: 880, height: 762 },
};

// The homepage hero: Pierre's video, with a home at twilight as the still that
// shows while it loads and for visitors who ask for reduced motion. Three
// files, made by scripts/add-hero-video.mjs (Nov 23 2026, sharper encode so
// the logo in the middle stays crisp): AV1 for browsers that play it, H.264
// for every other computer, and a lighter 1280-wide file for phones. It plays
// muted and looped behind the buttons, never with sound. Empty = the still only.
export const hero = {
  src: "/images/site/hero.jpg",
  width: 2400,
  height: 1600,
  alt: "A home at twilight with every light on, photographed by Showcase Media",
  video: { av1: "/clips/hero-1920-av1.mp4", mp4: "/clips/hero-1920.mp4", mobile: "/clips/hero-1280.mp4" },
};

// Kept from the shared template (components/ScrollHero.tsx). Pierre's homepage uses the still hero above.
export type HeroFilm = {
  mp4: string;
  webm: string;
  mobileMp4: string;
  mobileWebm: string;
  poster: string;
  cover: string;
  alt: string;
  stages: string[];
  timeMap: number[];
};

export const heroFilm: HeroFilm = {
  mp4: "",
  webm: "",
  mobileMp4: "",
  mobileWebm: "",
  poster: hero.src,
  cover: hero.src,
  alt: hero.alt,
  stages: [],
  timeMap: heroTimeMap,
};

export const nav = [
  { href: "/portfolio", label: "Portfolio" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

// Brokerages named in his testimonials (his current site).
export const trustedBy: string[] = ["Stark Company Realtors", "Accord Realty", "eXp Realty", "Lauer Realty Group"];

// Brokerage logos for "Trusted by" (Pierre's Dropbox folder, Nov 22 2026).
// Empty until the files arrive: then the home page shows these logos in
// place of the names above. Files go in public/images/brokerages/, one per
// brokerage, transparent PNG or SVG; w and h are the file's pixel size.
export const brokerageLogos: { name: string; src: string; w: number; h: number }[] = [];

// Business portraits (Pierre's Dropbox folder, Nov 22 2026), shown on the
// Business Portraits page. Empty until the files arrive. Files go in
// public/images/portraits/; w and h are the file's pixel size.
export const portraitGallery: { src: string; w: number; h: number; caption?: string }[] = [];

// Word for word from the Testimonials section of his current site.
export const testimonials: { quote: string; name: string; brokerage: string; photo?: string }[] = [
  {
    quote:
      "I've been working with Pierre for several years as my favorite photographer for all of my listings. He has a very professional, warm and relaxed demeanor while maintaining a very high level of work and attention to detail. His photos are beautiful and represent my listings in their best possible light.",
    name: "Wendy Jones Hill, Realtor, Broker",
    brokerage: "Stark Company Realtors",
  },
  {
    quote:
      "Pierre is one of the best photographers I have worked with in my real estate business. His attention to detail is outstanding. What I love most is that he doesn't just come to shoot the photos, he offers suggestions to ensure the end product will be the best.",
    name: "Tiffany Tobias, Realtor, Broker",
    brokerage: "Stark Company Realtors",
  },
  {
    quote:
      "I've had the pleasure of working with Pierre for our real estate photography and couldn't be more impressed. He captured the essence of our properties with stunning clarity and attention to detail.",
    name: "Brandon Grosse, Broker",
    brokerage: "Accord Realty",
  },
  {
    quote:
      "Pierre is the best photographer I have used in the 10 years I have been a Realtor. His photos always present my listings in the best possible way. Photos are ready within 24 hrs. He is professional and a great guy.",
    name: "Rich Wirth, Realtor",
    brokerage: "Stark Company Realtors",
  },
  {
    quote:
      "Pierre was an absolute pleasure to work with. His professionalism and punctuality made the entire process smooth and stress-free. Pierre has an exceptional eye for angles and composition, which truly brings out the best in every space he photographs.",
    name: "Anna Ysquierdo, Realtor",
    brokerage: "eXp Realty",
  },
  {
    quote:
      "His keen eye for detail and expertise in showcasing the best features of the property truly make a difference. The images are not only stunning but also effectively convey the essence of the space.",
    name: "Alejandra Torres, Realtor",
    brokerage: "Lauer Realty Group",
  },
];

// A short muted loop for a service card: plays while the card is on screen, never with sound.
export type ServiceClip = { mp4: string; webm?: string };

export type Service = {
  slug: string;
  name: string;
  short: string;
  body: string;
  image: string; // the poster: shown first, and the still when motion is off
  clip: ServiceClip | null;
  href?: string; // where the home page card goes: the service's own page, /services/[slug]
  examples?: string; // where "See examples" goes on /services; no link when there are no examples yet
  included?: boolean; // comes with every shoot
};

export const services: Service[] = [
  {
    slug: "photography",
    name: "Showcase Photography",
    short: "Photography",
    body: "Up to 40 images with Showcase editing: HDR detail, blue sky replacement as needed, window views, fire in the fireplaces and green grass. A free floor plan* comes with every shoot, up to 3,000 sq ft of total scanned space.",
    image: "/images/site/service-photography.jpg",
    clip: null,
    href: "/services/photography", examples: "/portfolio",
  },
  {
    slug: "aerial",
    name: "Drone Aerials",
    short: "Drone",
    body: "Drone photos and cinematic aerial video that show the property and the area around it. FAA certified drone pilot.",
    image: "/images/site/service-aerial.jpg",
    clip: null,
    href: "/services/aerial", examples: "/portfolio",
  },
  {
    slug: "tours",
    name: "3D Virtual Tours & Floor Plans",
    short: "3D & Floor Plans",
    body: "Matterport and Zillow 3D virtual tours, hosted for up to a year, with a free basic floor plan* up to 3,000 sq ft scanned. Larger, schematic, 3D and CAD floor plans on request.",
    image: "/images/site/service-tours.jpg",
    clip: null,
    href: "/services/tours",
  },
  {
    slug: "video",
    name: "Video Walkthroughs",
    short: "Video",
    body: "Walkthrough videos edited to music with aerial intro and closing clips, an agent guided tour option, and advanced imaging effects.",
    image: "/images/site/service-video.jpg",
    clip: null,
    href: "/services/video", examples: "/portfolio/video",
  },
  {
    slug: "twilight",
    name: "Twilight & Virtual Twilight",
    short: "Twilight",
    body: "Real twilight photography near dusk, or virtual twilight from your daytime exteriors.",
    image: "/images/site/service-twilight.jpg",
    clip: null,
    href: "/services/twilight", examples: "/portfolio",
  },
  {
    slug: "staging",
    name: "Virtual Staging",
    short: "Staging",
    body: "Empty rooms furnished in the photo, with many decor styles to choose from.",
    image: "/images/site/service-staging.jpg",
    clip: null,
    href: "/services/staging",
  },
  {
    slug: "portraits",
    name: "Business Portraits",
    short: "Portraits",
    body: "Environmental business portraits and group portraits, photographed at your business.",
    image: "/images/site/service-portraits.jpg",
    clip: null,
    href: "/services/portraits",
  },
];

// The quiet line under the services list.
export const serviceExtras = {
  editing: "Every image gets Showcase editing. Photos are ready within 24 hours, 48 hours guaranteed; videos in 48 to 72 hours.",
  video: "*A free basic floor plan comes with every Showcase Photography shoot and every 3D tour, up to 3,000 sq ft of total scanned space (garages, basements and unfinished areas count). Larger floor plans are $30 to $75.",
};

export const howItWorks = [
  {
    step: "01",
    title: "Book",
    body: "Book online in about two minutes, or call or text us.",
  },
  {
    step: "02",
    title: "Confirm",
    body: "No waiting days. We confirm your date and time quickly.",
  },
  {
    step: "03",
    title: "Shoot",
    body: "Photos, drone, a 3D tour and a floor plan in one visit, anywhere in Greater Madison.",
  },
  {
    step: "04",
    title: "Gallery",
    body: "Your gallery is in your client portal within 24 hours, 48 hours guaranteed.",
  },
];

// Films on YouTube (or Vimeo: "vimeo:<id>").
export const films: { title: string; video: string; cover: string; location: string }[] = [];

// 3D tours from Pierre's embed codes (Nov 25 2026). Paste only the address
// inside src="..." of the embed code: Matterport (my.matterport.com/show/?m=)
// or Zillow (www.zillow.com/view-imx/). Shown on Portfolio and /services/tours.
export type Tour = { title: string; kind: "matterport" | "zillow"; src: string };
export const tours: Tour[] = [
  { title: "Matterport 3D tour", kind: "matterport", src: "https://my.matterport.com/show/?m=jGmuVQBTaaB" },
  { title: "Zillow 3D tour", kind: "zillow", src: "https://www.zillow.com/view-imx/8ba0b55a-275a-4188-b1b8-05836bf048da?setAttribution=mls&wl=true&initialViewType=pano&utm_source=dashboard" },
];

// The credentials list on the About page (from his About page).
export const gear = [
  { label: "Credentials", value: "PPA Master Photographer (M.Photog.) and Craftsman (Cr.)" },
  { label: "Drone", value: "FAA certified drone pilot" },
  { label: "Experience", value: "30 years in commercial, real estate and portrait photography" },
  { label: "Teaching", value: "Madison College, and seminars and workshops across North America" },
  { label: "3D tours", value: "Matterport and Zillow" },
];
