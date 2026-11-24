"use client";

import { useEffect, useId, useRef, useState } from "react";
import { site } from "@/config/site";
import { TEST_RUN } from "@/lib/test-run";

// The property address on the booking form, with Google address suggestions
// and the driving distance from the studio (Pierre, Nov 23 2026).
//
// Needs NEXT_PUBLIC_GOOGLE_MAPS_KEY: a browser key from Google Cloud in
// Pierre's own account, restricted to his website addresses and to the
// Maps JavaScript API, Places API (New), and Distance Matrix API or Routes
// API, whichever his Google project can turn on (HANDOFF.md,
// "Address suggestions and distance"). Without it, or if Google can't be
// reached, this is the plain address box it always was: typing still works,
// the area is still chosen by hand, and the booking is never blocked.
//
// The distance is an estimate shown to the client and passed to the studio
// in the notes. It never changes a price: travel is confirmed by Pierre.
const KEY = TEST_RUN ? "" : (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "").trim(); // never in a local test run
const ORIGIN = site.address; // the studio, public on the contact page

export type PickedAddress = { address: string; state: string | null; miles: number | null };

type Suggestion = { text: string; toPlace: () => Place };
type Place = {
  fetchFields: (o: { fields: string[] }) => Promise<unknown>;
  formattedAddress?: string | null;
  addressComponents?: { shortText?: string | null; types: string[] }[] | null;
};
type PlacesLib = {
  AutocompleteSessionToken: new () => unknown;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (r: Record<string, unknown>) => Promise<{ suggestions: { placePrediction: { text: { text: string }; toPlace: () => Place } | null }[] }>;
  };
};
type RoutesLib = {
  DistanceMatrixService: new () => {
    getDistanceMatrix: (r: Record<string, unknown>) => Promise<{ rows: { elements: { status: string; distance?: { value: number } }[] }[] }>;
  };
  TravelMode: { DRIVING: unknown };
  UnitSystem?: { IMPERIAL: unknown };
};
type Maps = { importLibrary: (name: string) => Promise<unknown> };

let loading: Promise<Maps | null> | null = null;
function loadMaps(): Promise<Maps | null> {
  if (!KEY) return Promise.resolve(null);
  if (loading) return loading;
  loading = new Promise((resolve) => {
    const w = window as unknown as { google?: { maps?: Maps }; __scmMapsReady?: () => void };
    if (w.google?.maps?.importLibrary) return resolve(w.google.maps);
    w.__scmMapsReady = () => resolve(w.google?.maps ?? null);
    const s = document.createElement("script");
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(KEY)}&loading=async&v=weekly&callback=__scmMapsReady`;
    s.async = true;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
    setTimeout(() => resolve(w.google?.maps ?? null), 10_000);
  });
  return loading;
}

// Google's Routes API (route matrix), for Google projects that can't turn
// on the older Distance Matrix API. Same key, same restrictions.
async function routesMiles(destination: string): Promise<number | null> {
  try {
    const r = await fetch("https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": KEY, "X-Goog-FieldMask": "originIndex,destinationIndex,distanceMeters,condition" },
      body: JSON.stringify({ origins: [{ waypoint: { address: ORIGIN } }], destinations: [{ waypoint: { address: destination } }], travelMode: "DRIVE" }),
    });
    if (!r.ok) return null;
    const rows = (await r.json()) as { distanceMeters?: number; condition?: string }[];
    const el = Array.isArray(rows) ? rows[0] : null;
    if (!el || el.condition !== "ROUTE_EXISTS" || !el.distanceMeters) return null;
    return Math.round(el.distanceMeters / 1609.344);
  } catch {
    return null;
  }
}

async function drivingMiles(maps: Maps, destination: string): Promise<number | null> {
  return (await matrixMiles(maps, destination)) ?? (await routesMiles(destination));
}

async function matrixMiles(maps: Maps, destination: string): Promise<number | null> {
  try {
    const routes = (await maps.importLibrary("routes")) as RoutesLib;
    const svc = new routes.DistanceMatrixService();
    const r = await svc.getDistanceMatrix({
      origins: [ORIGIN],
      destinations: [destination],
      travelMode: routes.TravelMode.DRIVING,
      ...(routes.UnitSystem ? { unitSystem: routes.UnitSystem.IMPERIAL } : {}),
    });
    const el = r.rows?.[0]?.elements?.[0];
    if (!el || el.status !== "OK" || !el.distance) return null;
    return Math.round(el.distance.value / 1609.344);
  } catch {
    return null; // the Distance Matrix API isn't enabled, or Google said no
  }
}

export function AddressField({
  id,
  value,
  onType,
  onPick,
}: {
  id: string;
  value: string;
  onType: (v: string) => void;
  onPick: (p: PickedAddress) => void;
}) {
  const listId = useId();
  const [maps, setMaps] = useState<Maps | null>(null);
  const [places, setPlaces] = useState<PlacesLib | null>(null);
  const [items, setItems] = useState<Suggestion[]>([]);
  const [active, setActive] = useState(-1);
  const [open, setOpen] = useState(false);
  const token = useRef<unknown>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);

  // Google loads only when the visitor starts on the address box.
  async function ready(): Promise<PlacesLib | null> {
    if (places) return places;
    const m = await loadMaps();
    if (!m) return null;
    try {
      const lib = (await m.importLibrary("places")) as PlacesLib;
      if (!lib?.AutocompleteSuggestion) return null;
      setMaps(m);
      setPlaces(lib);
      return lib;
    } catch {
      return null;
    }
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  function type(v: string) {
    onType(v);
    if (!KEY) return;
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 4) {
      setItems([]);
      setOpen(false);
      return;
    }
    const mine = ++seq.current;
    timer.current = setTimeout(async () => {
      const lib = await ready();
      if (!lib || mine !== seq.current) return;
      try {
        if (!token.current) token.current = new lib.AutocompleteSessionToken();
        const r = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({ input: v, sessionToken: token.current, includedRegionCodes: ["us"] });
        if (mine !== seq.current) return;
        const list = r.suggestions.flatMap((s) => (s.placePrediction ? [{ text: s.placePrediction.text.text, toPlace: () => s.placePrediction!.toPlace() }] : [])).slice(0, 5);
        setItems(list);
        setActive(-1);
        setOpen(list.length > 0);
      } catch {
        setItems([]);
        setOpen(false);
      }
    }, 250);
  }

  async function pick(s: Suggestion) {
    setOpen(false);
    setItems([]);
    seq.current++;
    const short = s.text.replace(/, USA$/, "");
    onType(short);
    try {
      const place = s.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "addressComponents"] });
      token.current = null; // a session ends with the pick
      const address = (place.formattedAddress || short).replace(/, USA$/, "");
      const state = place.addressComponents?.find((c) => c.types.includes("administrative_area_level_1"))?.shortText ?? null;
      const miles = maps ? await drivingMiles(maps, address) : null;
      onPick({ address, state, miles });
    } catch {
      onPick({ address: short, state: null, miles: null });
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => (a + 1) % items.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => (a <= 0 ? items.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      void pick(items[active]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      <input
        id={id}
        className="field"
        autoComplete={KEY ? "off" : "street-address"}
        placeholder="Street address and city"
        value={value}
        onChange={(e) => type(e.target.value)}
        onKeyDown={onKeyDown}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        role={KEY ? "combobox" : undefined}
        aria-autocomplete={KEY ? "list" : undefined}
        aria-expanded={KEY ? open : undefined}
        aria-controls={KEY ? listId : undefined}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
      />
      {open ? (
        <ul id={listId} role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 border border-line bg-paper shadow-lg">
          {items.map((s, i) => (
            <li
              key={s.text}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              className={`cursor-pointer px-4 py-3 text-[15px] ${i === active ? "bg-sand" : "hover:bg-sand"}`}
              onMouseDown={(e) => {
                e.preventDefault();
                void pick(s);
              }}
            >
              {s.text.replace(/, USA$/, "")}
            </li>
          ))}
          <li aria-hidden className="px-4 py-2 text-right text-[11px] text-mute">Suggestions by Google</li>
        </ul>
      ) : null}
    </div>
  );
}
