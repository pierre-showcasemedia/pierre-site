"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { BOOKING } from "@/config/booking";
import { CLIENT_TYPES, CLIENT_TYPE_LABELS } from "@/lib/pricing";
import { readVisit } from "./VisitSource";

// The pricing page's short form (Pierre, Nov 23 2026: prices behind a name
// and email). Once sent, this browser keeps the prices open on later visits.
// A soft gate: it collects the lead, it doesn't hide prices from someone
// determined (the booking form shows every price as it is filled in).
const KEY = "scm-pricing-open";

function remembered(): boolean {
  try {
    return window.localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}
const noop = () => () => {};
function remember() {
  try {
    window.localStorage.setItem(KEY, "1");
  } catch {
    // private window: the form shows again next visit
  }
}

export function PricingGate({ children }: { children: React.ReactNode }) {
  const stored = useSyncExternalStore(noop, remembered, () => false);
  const [justOpened, setOpen] = useState(false);
  const open = stored || justOpened;
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const [clientType, setClientType] = useState("");
  const submissionId = useRef(""); // one id per form session: a retry is the same lead

  useEffect(() => {
    if (!open || !window.location.hash) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView();
  }, [open]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (!submissionId.current && typeof crypto !== "undefined" && "randomUUID" in crypto) submissionId.current = crypto.randomUUID();
    const body = {
      submission_id: submissionId.current,
      _gotcha: String(f.get("_gotcha") ?? ""),
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      client_type: clientType,
      brokerage: String(f.get("brokerage") ?? ""),
      visit: readVisit(),
    };
    if (body._gotcha) return;
    if (BOOKING.testMode) {
      // Test mode (NEXT_PUBLIC_BOOKING_TEST_MODE not "false"): open without sending.
      setOpen(true);
      return;
    }
    setState("sending");
    setError("");
    try {
      const r = await fetch("/api/pricing-lead", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!r.ok || !j.ok) throw new Error(j.error || "We couldn't send that just now. Please try again, or call us.");
      remember();
      setOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
      setState("error");
    }
  }

  if (open) return <>{children}</>;

  return (
    <section className="mx-auto max-w-[1600px] px-5 pb-28 md:px-10 md:pb-40">
      <div className="grid gap-12 border-t border-line pt-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <p className="label text-mute">Our price list</p>
          <h2 className="display mt-4 text-4xl md:text-5xl">See every price</h2>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-ink-soft">
            Tell us who you are and the full price list opens right here: every package by home size, the add-ons and business portraits.
          </p>
          <p className="mt-4 max-w-sm text-[13px] leading-relaxed text-mute">Your details go to Showcase Media only.</p>
        </div>
        <form onSubmit={onSubmit} className="md:col-span-7 md:col-start-6" noValidate={false}>
          <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <div className="grid gap-x-8 sm:grid-cols-2">
            <div>
              <label htmlFor="p-name" className="label mt-6 block text-mute">Name</label>
              <input id="p-name" name="name" required minLength={2} className="field" autoComplete="name" />
            </div>
            <div>
              <label htmlFor="p-email" className="label mt-6 block text-mute">Email</label>
              <input id="p-email" name="email" type="email" required className="field" autoComplete="email" />
            </div>
            <div>
              <label htmlFor="p-phone" className="label mt-6 block text-mute">Phone (optional)</label>
              <input id="p-phone" name="phone" type="tel" className="field" autoComplete="tel" placeholder="(608)" />
            </div>
            <div>
              <label htmlFor="p-type" className="label mt-6 block text-mute">I am (optional)</label>
              <select id="p-type" name="client_type" value={clientType} onChange={(e) => setClientType(e.target.value)} className="field">
                <option value="">Choose one</option>
                {CLIENT_TYPES.map((t) => (
                  <option key={t} value={t}>{CLIENT_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            {clientType === "agent" ? (
              <div className="sm:col-span-2">
                <label htmlFor="p-brokerage" className="label mt-6 block text-mute">Brokerage (optional)</label>
                <input id="p-brokerage" name="brokerage" className="field" autoComplete="organization" />
              </div>
            ) : null}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button type="submit" className="btn" disabled={state === "sending"}>
              {state === "sending" ? "Opening" : "Show the prices"}
            </button>
            {BOOKING.testMode ? <p className="text-[13px] text-mute">Test mode: nothing is sent.</p> : null}
          </div>
          {state === "error" ? <p role="alert" className="mt-5 text-[15px] text-accent">{error}</p> : null}
        </form>
      </div>
    </section>
  );
}
