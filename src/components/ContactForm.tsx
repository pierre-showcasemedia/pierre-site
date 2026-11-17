"use client";

import { useState } from "react";
import { BOOKING } from "@/config/booking";
import { site } from "@/config/site";

// Short enquiry form. Sends to the same Formspree form as bookings, with its own subject line.
export function ContactForm() {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [test, setTest] = useState<Record<string, string> | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = {
      _subject: `New enquiry from ${f.get("name")}`,
      _replyto: String(f.get("email") ?? ""),
      _gotcha: String(f.get("_gotcha") ?? ""),
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      phone: String(f.get("phone") ?? ""),
      message: String(f.get("message") ?? ""),
    };
    if (body._gotcha) { setState("sent"); return; }
    if (BOOKING.testMode) { setTest(body); setState("sent"); return; }
    setState("sending");
    try {
      const r = await fetch(`https://formspree.io/f/${BOOKING.formspreeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error(String(r.status));
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div>
        <h2 className="display text-5xl">Thank you.</h2>
        <p className="mt-5 text-[17px] text-ink-soft">Pierre will reply {site.confirmWithin}.</p>
        {test ? (
          <pre className="mt-8 whitespace-pre-wrap border border-accent/40 p-5 text-xs text-ink-soft">
            Test mode is on. Nothing was sent. Formspree would receive:{"\n\n"}{JSON.stringify(test, null, 2)}
          </pre>
        ) : null}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="grid gap-x-8 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="label mt-6 block text-mute">Name</label>
          <input id="c-name" name="name" required className="field" autoComplete="name" />
        </div>
        <div>
          <label htmlFor="c-phone" className="label mt-6 block text-mute">Phone <span className="normal-case tracking-normal">(optional)</span></label>
          <input id="c-phone" name="phone" type="tel" className="field" autoComplete="tel" />
        </div>
      </div>
      <label htmlFor="c-email" className="label mt-6 block text-mute">Email</label>
      <input id="c-email" name="email" type="email" required className="field" autoComplete="email" />
      <label htmlFor="c-msg" className="label mt-6 block text-mute">Message</label>
      <textarea id="c-msg" name="message" rows={4} required className="field resize-none" placeholder="Tell us about the property or the project" />
      {state === "error" ? <p className="pt-3 text-sm text-[#b4441b]">That didn&apos;t send. Please try again, or email {site.email}.</p> : null}
      <div className="pt-8">
        <button type="submit" disabled={state === "sending"} className="btn btn-solid disabled:opacity-60">
          {state === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
