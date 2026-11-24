"use client";

import { useEffect } from "react";

// Remembers where this visit started (Nov 24 2026, visit sources): the first
// page, the referring site and any UTM tags, for this browser tab only. The
// booking and pricing forms send it along so Pierre's studio can show where
// each lead and booking came from. No cookies, no ids, nothing sent until a
// form is submitted, and nothing at all if the browser blocks storage.
const KEY = "scm-visit";
const UTM = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Visit = Partial<Record<(typeof UTM)[number] | "referrer" | "landing", string>>;

export function readVisit(): Visit {
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Visit) : {};
  } catch {
    return {};
  }
}

export function VisitSource() {
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(KEY)) return;
      const url = new URL(window.location.href);
      const v: Visit = { landing: url.pathname };
      for (const k of UTM) {
        const s = url.searchParams.get(k);
        if (s) v[k] = s.slice(0, 200);
      }
      const ref = document.referrer;
      if (ref) {
        const r = new URL(ref);
        if (r.host !== url.host) v.referrer = r.host; // the site, never the full address
      }
      window.sessionStorage.setItem(KEY, JSON.stringify(v));
    } catch {
      // storage blocked: forms simply send no source
    }
  }, []);
  return null;
}
