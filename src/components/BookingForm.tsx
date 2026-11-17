"use client";

import Link from "next/link";
import { useMemo, useRef, useState, useSyncExternalStore } from "react";
import { BOOKING } from "@/config/booking";
import { site } from "@/config/site";
import {
  AREAS,
  CLIENT_TYPE_LABELS,
  CUSTOM_TIER,
  INCLUDED,
  ITEMS,
  PACKAGES,
  PICK_ONE_IDS,
  QUOTED_CLIENT_TYPES,
  TIME_WINDOW_LABELS,
  inSentence,
  isOutsideArea,
  perUnit,
  priceBooking,
  priceHint,
  usd,
  type ClientType,
  type Item,
  type PackageId,
  type PricedLine,
  type TimeWindow,
} from "@/lib/pricing";

// Showcase Media's booking form (Pierre Stephenson, Nov 17 2026). Six calm steps
// and a live estimate priced by src/lib/pricing.ts. The client picks the size of
// the home, then one package (or a service or a portrait session on its own),
// then add-ons.
// It posts to /api/booking, which prices it again, hands it to the studio and
// keeps a Formspree copy. A date and a time of day only: Pierre confirms the
// exact time.

type Picked = { qty: number; option: string | null };
type Data = {
  clientType: ClientType | "";
  name: string;
  email: string;
  phone: string;
  company: string; // the brokerage, for an agent
  address: string;
  area: string;
  launchDate: string;
  pkg: PackageId | "";
  items: Record<string, Picked>;
  date: string;
  window: TimeWindow | "";
  access: string;
  notes: string;
  agree: boolean;
};

const EMPTY: Data = {
  clientType: "",
  name: "",
  email: "",
  phone: "",
  company: "",
  address: "",
  area: "",
  launchDate: "",
  pkg: "",
  items: {},
  date: "",
  window: "",
  access: "",
  notes: "",
  agree: false,
};

type Done = { test: boolean; payload: unknown; total: string; needsQuote: boolean; emailed: boolean };

const STEPS = BOOKING.steps;
const ITEM = new Map(ITEMS.map((i) => [i.id, i]));
const noopSubscribe = () => () => {};
const longDate = (ymd: string) => (ymd ? new Intl.DateTimeFormat("en-US", { timeZone: "UTC", weekday: "long", month: "long", day: "numeric" }).format(new Date(`${ymd}T12:00:00Z`)) : "");
const CALL_OR_TEXT = `call or text Pierre at ${BOOKING.contact.phoneDisplay}`;

function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  const h = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-${((parseInt(h[16], 16) & 3) | 8).toString(16)}${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

// Why an add-on can't be picked right now, or null when it can.
function blockedBy(item: Item, d: Data): string | null {
  if (item.needs && !item.needs.some((id) => d.items[id])) {
    const names = item.needs.map((id) => inSentence(ITEM.get(id)?.name ?? id));
    return `Add the ${names.join(" or the ")} first`;
  }
  return null;
}

// Drop add-ons whose requirement went away.
function prune(d: Data): Data {
  let items = { ...d.items };
  for (let pass = 0; pass < 3; pass++) {
    const next: Record<string, Picked> = {};
    for (const [id, p] of Object.entries(items)) {
      const it = ITEM.get(id);
      if (it && !blockedBy(it, { ...d, items })) next[id] = p;
    }
    if (Object.keys(next).length === Object.keys(items).length) break;
    items = next;
  }
  return { ...d, items };
}

function lineDetail(l: PricedLine): string | null {
  if (!l.qty || l.unit === "item" || l.unit === "package") return null;
  return l.priced && l.unitCents ? `${l.qty} ${l.unit} at ${usd(l.unitCents)}` : `${l.qty} ${l.unit}`;
}

const linePrice = (l: PricedLine) => (!l.priced ? "Quoted" : l.from ? `From ${usd(l.cents)}` : usd(l.cents));

function Label({ htmlFor, children, optional }: { htmlFor: string; children: React.ReactNode; optional?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="label mt-8 block text-mute">
      {children} {optional ? <span className="normal-case tracking-normal text-mute/70">(optional)</span> : null}
    </label>
  );
}

const CARD = "relative flex cursor-pointer flex-col border p-5 transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent";
const cardTone = (on: boolean) => (on ? "border-ink bg-white/75" : "border-line bg-white/30 hover:border-ink/40");
const Dot = ({ on }: { on: boolean }) => (on ? <span aria-hidden className="absolute right-4 top-4 h-2 w-2 rounded-full bg-accent" /> : null);

export function BookingForm() {
  const [step, setStep] = useState(0);
  const [d, setD] = useState<Data>(EMPTY);
  const [err, setErr] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState<Done | null>(null);
  const gotcha = useRef<HTMLInputElement>(null);
  const top = useRef<HTMLDivElement>(null);
  const submissionId = useRef("");

  const set = <K extends keyof Data>(k: K, v: Data[K]) => setD((prev) => prune({ ...prev, [k]: v }));

  const isAgent = d.clientType === "agent";
  const quotedClient = Boolean(d.clientType && QUOTED_CLIENT_TYPES.includes(d.clientType));
  const outside = isOutsideArea(d.area);
  const brokerage = isAgent ? d.company.trim() : "";

  const priced = useMemo(
    () =>
      priceBooking({
        package: d.pkg || null,
        items: Object.entries(d.items).map(([id, p]) => ({ id, qty: p.qty, option: p.option })),
        clientType: d.clientType || "agent",
        area: d.area || null,
      }),
    [d.pkg, d.items, d.clientType, d.area]
  );
  const lines = priced.lines;
  const hasLines = lines.length > 0;
  const quoted = hasLines && priced.needsQuote;
  const tier = priced.tier;
  const service = ITEMS.find((i) => i.pickOne && d.items[i.id]) ?? null;
  const hasOrder = Boolean(service) || ITEMS.some((i) => i.standalone && d.items[i.id]);

  function validate(): string {
    if (step === 0) {
      if (!d.clientType) return "Please tell us who's booking.";
      if (d.name.trim().length < 2) return "Please add your name.";
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) return "Please add a valid email address.";
      if (d.phone.replace(/\D/g, "").length < 7) return "Please add a mobile number so Pierre can reach you on the day.";
    }
    if (step === 1) {
      if (d.address.trim().length < 5) return "Please add the property address.";
      if (!d.area) return "Please choose the area.";
    }
    if (step === 2 && !d.pkg) return "Please pick the size of the home.";
    if (step === 3 && !hasOrder) return "Please pick a package in the last step, or a service booked on its own here.";
    if (step === 4) {
      if (!d.date) return "Please pick a date.";
      if (!d.window) return "Please pick a time of day.";
    }
    if (step === 5 && !d.agree) return "Please tick the box to agree to the terms.";
    return "";
  }

  function body() {
    return {
      submission_id: submissionId.current,
      _gotcha: gotcha.current?.value ?? "",
      client: { name: d.name.trim(), email: d.email.trim(), phone: d.phone.trim(), company: d.company.trim() || null },
      client_type: d.clientType,
      brokerage: brokerage || null,
      property: { address: d.address.trim(), access: d.access.trim() || null },
      area: d.area,
      time_window: d.window,
      desired_date: d.date,
      launch_date: d.launchDate || null,
      package: d.pkg || null,
      items: priced.items.map((i) => ({ id: i.id, qty: i.qty, option: i.option })),
      notes: d.notes.trim() || null,
      agreed_to_terms: true,
      total_cents: priced.totalCents,
      pricing_hash: priced.hash,
      pricing_version: priced.version,
    };
  }

  async function submit() {
    if (!submissionId.current) submissionId.current = newId();
    setSending(true);
    try {
      const r = await fetch("/api/booking", { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(body()) });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean; test?: boolean; payload?: unknown; error?: string; via?: string[] };
      if (!r.ok || !j.ok) throw new Error(j.error || `status ${r.status}`);
      setDone({ test: Boolean(j.test), payload: j.payload ?? null, total: usd(priced.totalCents), needsQuote: quoted, emailed: Boolean(j.via?.includes("studio")) });
      top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch {
      setErr(`Something went wrong sending your request. Please try again, or ${CALL_OR_TEXT}.`);
    } finally {
      setSending(false);
    }
  }

  function next() {
    const e = validate();
    if (e) {
      setErr(e);
      return;
    }
    setErr("");
    if (step === STEPS.length - 1) {
      void submit();
      return;
    }
    setStep((s) => s + 1);
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function back() {
    setErr("");
    setStep((s) => Math.max(0, s - 1));
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function toggleItem(id: string) {
    setD((prev) => {
      const items = { ...prev.items };
      if (items[id]) delete items[id];
      else items[id] = { qty: 1, option: ITEM.get(id)?.options?.[0].id ?? null };
      return prune({ ...prev, items });
    });
  }
  function setQty(id: string, qty: number) {
    const it = ITEM.get(id);
    const max = (it && perUnit(it)?.max) ?? 99;
    setD((prev) => (prev.items[id] ? { ...prev, items: { ...prev.items, [id]: { ...prev.items[id], qty: Math.max(1, Math.min(max, Math.floor(qty) || 1)) } } } : prev));
  }
  function setOption(id: string, option: string) {
    setD((prev) => (prev.items[id] ? { ...prev, items: { ...prev.items, [id]: { ...prev.items[id], option } } } : prev));
  }
  function pickPackage(id: PackageId) {
    setD((prev) => prune({ ...prev, pkg: id }));
  }
  // A package or a solo service: one per booking, so picking one replaces the other.
  function pickService(id: string) {
    setD((prev) => {
      const items: Record<string, Picked> = {};
      for (const [k, v] of Object.entries(prev.items)) if (!PICK_ONE_IDS.has(k)) items[k] = v;
      items[id] = { qty: 1, option: null };
      return prune({ ...prev, items });
    });
  }

  // The earliest date, read in the browser (the page itself is prerendered).
  const today = useSyncExternalStore(noopSubscribe, () => new Date().toISOString().slice(0, 10), () => "");

  const where = [d.address.trim(), d.area && d.area !== "Somewhere else" ? d.area : ""].filter(Boolean).join(", ");
  const windowLabel = d.window ? TIME_WINDOW_LABELS[d.window].toLowerCase() : "";

  if (done) {
    const steps = [
      `Pierre confirms your date and time by text or email within ${BOOKING.confirmWithin}.`,
      "On the day, he shoots in the time you agree.",
      `Your photos arrive ${BOOKING.turnaround}, in your own online gallery.`,
      BOOKING.payment,
    ];
    return (
      <div ref={top} className="mx-auto max-w-3xl scroll-mt-28 py-6 md:py-10">
        <p className="label text-accent">Request received</p>
        <h2 className="display mt-5 text-5xl md:text-7xl">Request received. Pierre will confirm within {BOOKING.confirmWithin}.</h2>
        <p className="mt-8 text-[17px] leading-relaxed text-ink-soft">
          Thanks, {d.name.trim().split(" ")[0]}. We have your request for {where || "your property"} on {longDate(d.date)}, {windowLabel || "time to be set"}.{done.emailed ? ` A copy is on its way to ${d.email.trim()}.` : ""}
        </p>
        <div className="mt-10 border-y border-line py-8">
          <p className="label text-mute">What happens next</p>
          <ol className="mt-6 space-y-5">
            {steps.map((s, i) => (
              <li key={s} className="flex gap-5 text-[16px] leading-relaxed">
                <span className="figures w-8 shrink-0 text-2xl text-accent">{i + 1}</span>
                <span className="pt-0.5">{s}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-sm text-mute">
            Your estimate: {done.total}
            {done.needsQuote ? " so far. Pierre will confirm the rest with you." : "."} Nothing is charged today.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          <a href={BOOKING.contact.smsHref} className="btn btn-solid">Text Pierre</a>
          <Link href="/work" className="btn btn-ghost">Browse the work</Link>
        </div>
        {done.test ? (
          <div className="mt-14 border border-accent/50 bg-white/60 p-6">
            <p className="text-sm"><b>Test mode.</b> The studio and Formspree aren&apos;t connected here, so nothing was sent. This is what the studio would receive:</p>
            <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap break-words text-xs leading-relaxed text-ink-soft">{JSON.stringify(done.payload, null, 2)}</pre>
          </div>
        ) : null}
      </div>
    );
  }

  const groups = BOOKING.groups.map((g) => ({ ...g, items: ITEMS.filter((i) => i.group === g.id && !i.adminOnly) })).filter((g) => g.items.length);

  return (
    <div ref={top} className="scroll-mt-28 pb-24 lg:pb-0">
      <div className="grid gap-14 lg:grid-cols-12">
        <div className="min-w-0 lg:col-span-7">
          <div className="flex gap-1.5" aria-hidden>
            {STEPS.map((s, i) => (
              <span key={s} className={`h-px flex-1 transition-colors duration-500 ${i <= step ? "bg-ink" : "bg-line"}`} />
            ))}
          </div>
          <p className="label mt-5 text-mute">Step {step + 1} of {STEPS.length} · {STEPS[step]}</p>

          <input ref={gotcha} type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

          <div className="mt-8 min-h-[420px]">
            {step === 0 && (
              <>
                <h2 className="display text-4xl md:text-6xl">Who&apos;s booking?</h2>
                <p className="mt-5 text-[17px] text-ink-soft">This takes about two minutes. Pierre confirms within {BOOKING.confirmWithin}.</p>
                <fieldset className="mt-8">
                  <legend className="sr-only">You are</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {BOOKING.clientTypes.map((c) => {
                      const on = d.clientType === c.id;
                      return (
                        <label key={c.id} className={`${CARD} ${cardTone(on)}`}>
                          <input type="radio" name="clientType" value={c.id} checked={on} onChange={() => set("clientType", c.id)} className="sr-only" />
                          <span className="pr-6 text-[16px] leading-snug">{CLIENT_TYPE_LABELS[c.id]}</span>
                          <span className="mt-1 text-sm text-mute">{c.hint}</span>
                          <Dot on={on} />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                <Label htmlFor="name">Your name</Label>
                <input id="name" className="field" autoComplete="name" value={d.name} onChange={(e) => set("name", e.target.value)} />
                <div className="grid gap-x-8 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <input id="email" type="email" className="field" autoComplete="email" value={d.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="phone">Mobile number</Label>
                    <input id="phone" type="tel" className="field" autoComplete="tel" placeholder="(208) 555 0123" value={d.phone} onChange={(e) => set("phone", e.target.value)} />
                  </div>
                </div>
                {d.clientType && d.clientType !== "homeowner" ? (
                  <>
                    <Label htmlFor="company" optional>{isAgent ? "Brokerage" : "Company"}</Label>
                    <input id="company" className="field" autoComplete="organization" value={d.company} onChange={(e) => set("company", e.target.value)} />
                  </>
                ) : null}
              </>
            )}

            {step === 1 && (
              <>
                <h2 className="display text-4xl md:text-6xl">Where&apos;s the shoot?</h2>
                <p className="mt-5 text-[17px] text-ink-soft">{BOOKING.areaLine}</p>
                <Label htmlFor="address">Property address</Label>
                <input id="address" className="field" autoComplete="street-address" placeholder="Street address and city" value={d.address} onChange={(e) => set("address", e.target.value)} />
                <Label htmlFor="area">Area</Label>
                <select id="area" className="field" value={d.area} onChange={(e) => set("area", e.target.value)}>
                  <option value="">Choose the area</option>
                  {AREAS.map((x) => <option key={x}>{x}</option>)}
                </select>
                {d.area === "Somewhere else" ? <p className="mt-2 text-sm text-mute">Add the city to the address above.</p> : null}
                {outside ? <p className="mt-5 border-l border-accent pl-4 text-sm leading-relaxed text-ink-soft">{BOOKING.outsideAreaNote}</p> : null}
                {isAgent || d.clientType === "homeowner" ? (
                  <>
                    <Label htmlFor="launchDate" optional>Listing goes live</Label>
                    <input id="launchDate" type="date" min={today} className="field" value={d.launchDate} onChange={(e) => set("launchDate", e.target.value)} />
                  </>
                ) : null}
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="display text-4xl md:text-6xl">How big is the home?</h2>
                <p className="mt-5 text-[17px] text-ink-soft">
                  {BOOKING.includedNote} Not sure of the square footage? Pick your best guess and Pierre will check it.
                </p>
                {quotedClient ? <p className="mt-5 border-l border-accent pl-4 text-sm leading-relaxed text-ink-soft">{BOOKING.quotedClientNote}</p> : null}
                <fieldset className="mt-8">
                  <legend className="sr-only">Size of the home</legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {PACKAGES.map((p) => {
                      const on = d.pkg === p.id;
                      const price = quotedClient || p.quoted ? "Quoted" : `From ${usd(p.cents)}`;
                      return (
                        <label key={p.id} className={`${CARD} ${cardTone(on)}`}>
                          <input type="radio" name="package" value={p.id} checked={on} onChange={() => pickPackage(p.id)} className="sr-only" />
                          <span className="flex items-baseline justify-between gap-4 pr-6">
                            <span className="display text-2xl md:text-3xl">{p.name}</span>
                            <span className="figures shrink-0 text-2xl">{price}</span>
                          </span>
                          <span className="mt-2 text-sm text-mute">{p.hint}.</span>
                          <Dot on={on} />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {INCLUDED.length ? (
                  <div className="mt-8 border border-line bg-white/50 p-5">
                    <p className="label text-mute">Included with every shoot</p>
                    <ul className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-[15px]">
                      {INCLUDED.map((x) => (
                        <li key={x} className="flex items-center gap-2">
                          <span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {d.pkg ? (
                  <>
                    <h3 className="display mt-14 text-3xl md:text-4xl">Pick a package</h3>
                    <p className="mt-3 text-[15px] text-mute">{BOOKING.packageNote}</p>
                    {BOOKING.packageGroups.map((g) => (
                      <fieldset key={g.id} className="mt-8">
                        <legend className="label text-mute">{g.title}</legend>
                        <div className="mt-3 border-b border-line">
                          {ITEMS.filter((i) => i.group === g.id && !i.adminOnly).map((it) => {
                            const on = Boolean(d.items[it.id]);
                            const id = `svc-${it.id}`;
                            return (
                              <label key={it.id} htmlFor={id} className="flex cursor-pointer items-start gap-4 border-t border-line py-5">
                                <input id={id} type="radio" name="service" checked={on} onChange={() => pickService(it.id)} className="mt-1.5 h-4 w-4 shrink-0 accent-ink" />
                                <span className="min-w-0 flex-1">
                                  <span className="block text-[16px] leading-snug">{it.name}</span>
                                  <span className="mt-1 block text-sm leading-relaxed text-mute">{it.desc}</span>
                                </span>
                                <span className={`figures shrink-0 pt-0.5 text-right text-lg md:text-xl ${quotedClient || tier === CUSTOM_TIER ? "text-mute" : ""}`}>{quotedClient ? "Quoted" : priceHint(it, tier)}</span>
                              </label>
                            );
                          })}
                        </div>
                      </fieldset>
                    ))}
                  </>
                ) : null}
              </>
            )}

            {step === 3 && (
              <>
                <h2 className="display text-4xl md:text-6xl">Anything else?</h2>
                <p className="mt-5 text-[17px] text-ink-soft">{service ? "Optional. " : ""}Aerials, dusk shots, floor plans and finishing touches. {BOOKING.quotedAddOnsNote}</p>
                {groups.map((g) => (
                  <section key={g.id} className="mt-10">
                    <p className="label text-mute">{g.title}</p>
                    <div className="mt-3 border-b border-line">
                      {g.items.map((it) => {
                        const picked = d.items[it.id];
                        const blocked = picked ? null : blockedBy(it, d);
                        const id = `item-${it.id}`;
                        const unit = perUnit(it);
                        return (
                          <div key={it.id} className={`border-t border-line py-5 ${blocked ? "opacity-50" : ""}`}>
                            <div className="flex items-start gap-4">
                              <input id={id} type="checkbox" checked={Boolean(picked)} disabled={Boolean(blocked)} onChange={() => toggleItem(it.id)} className="mt-1.5 h-4 w-4 shrink-0 accent-ink" />
                              <label htmlFor={id} className={`min-w-0 flex-1 ${blocked ? "" : "cursor-pointer"}`}>
                                <span className="block text-[16px] leading-snug">{it.name}</span>
                                <span className="mt-1 block text-sm leading-relaxed text-mute">{blocked ?? it.desc}</span>
                              </label>
                              <span className={`figures shrink-0 pt-0.5 text-right text-lg md:text-xl ${it.price.kind === "quote" ? "text-mute" : ""}`}>{priceHint(it, tier)}</span>
                            </div>
                            {picked && unit ? (
                              <div className="mt-4 flex items-center gap-3 pl-8">
                                <span className="text-sm text-mute">How many {unit.units}?</span>
                                <div className="flex items-center border border-line">
                                  <button type="button" aria-label={`Fewer ${unit.units}`} onClick={() => setQty(it.id, picked.qty - 1)} className="h-9 w-9 text-lg leading-none hover:bg-white/60">−</button>
                                  <input
                                    type="number"
                                    inputMode="numeric"
                                    min={1}
                                    max={unit.max}
                                    aria-label={`${it.name}, number of ${unit.units}`}
                                    value={picked.qty}
                                    onChange={(e) => setQty(it.id, Number(e.target.value))}
                                    className="h-9 w-12 border-x border-line bg-transparent text-center text-[15px] [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                  />
                                  <button type="button" aria-label={`More ${unit.units}`} onClick={() => setQty(it.id, picked.qty + 1)} className="h-9 w-9 text-lg leading-none hover:bg-white/60">+</button>
                                </div>
                              </div>
                            ) : null}
                            {picked && it.options ? (
                              <fieldset className="mt-4 pl-8">
                                <legend className="sr-only">{it.name} style</legend>
                                <div className="flex flex-wrap gap-2">
                                  {it.options.map((o) => {
                                    const on = picked.option === o.id;
                                    return (
                                      <label key={o.id} className={`cursor-pointer border px-4 py-2 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-accent ${on ? "border-ink bg-white/75" : "border-line hover:border-ink/40"}`}>
                                        <input type="radio" name={`opt-${it.id}`} value={o.id} checked={on} onChange={() => setOption(it.id, o.id)} className="sr-only" />
                                        {o.name}
                                      </label>
                                    );
                                  })}
                                </div>
                              </fieldset>
                            ) : null}
                            {picked && it.id === "dusk" ? <p className="mt-3 pl-8 text-sm text-mute">{BOOKING.twilightNote}</p> : null}
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </>
            )}

            {step === 4 && (
              <>
                <h2 className="display text-4xl md:text-6xl">When works for you?</h2>
                <p className="mt-5 text-[17px] text-ink-soft">Pick a date and a time of day. {BOOKING.hours}</p>
                <Label htmlFor="date">Date</Label>
                <input id="date" type="date" min={today} className="field" value={d.date} onChange={(e) => set("date", e.target.value)} />
                <fieldset className="mt-8">
                  <legend className="label text-mute">Time of day</legend>
                  <div className="mt-4 grid grid-cols-3 gap-3">
                    {BOOKING.windows.map((w) => {
                      const on = d.window === w.id;
                      return (
                        <label key={w.id} className={`${CARD} ${cardTone(on)}`}>
                          <input type="radio" name="window" value={w.id} checked={on} onChange={() => set("window", w.id)} className="sr-only" />
                          <span className="text-[16px]">{w.label}</span>
                          <Dot on={on} />
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
                {d.items.dusk ? <p className="mt-4 text-sm text-mute">{BOOKING.twilightNote}</p> : null}
                <Label htmlFor="access">Access notes</Label>
                <textarea id="access" rows={3} className="field resize-none" placeholder="Lockbox code, who will be there, pets, parking" value={d.access} onChange={(e) => set("access", e.target.value)} />
                <Label htmlFor="notes" optional>Anything else?</Label>
                <textarea id="notes" rows={3} className="field resize-none" placeholder="Rooms or views to feature, things to avoid" value={d.notes} onChange={(e) => set("notes", e.target.value)} />
              </>
            )}

            {step === 5 && (
              <>
                <h2 className="display text-4xl md:text-6xl">Check and send.</h2>
                <p className="mt-5 text-[17px] text-ink-soft">Nothing is charged today. Pierre confirms within {BOOKING.confirmWithin}.</p>
                <dl className="mt-8 divide-y divide-line border-y border-line text-[15px]">
                  {(
                    [
                      ["Name", d.name.trim()],
                      ["Email", d.email.trim()],
                      ["Mobile", d.phone.trim()],
                      ["You are", d.clientType ? CLIENT_TYPE_LABELS[d.clientType] : ""],
                      [isAgent ? "Brokerage" : "Company", d.company.trim()],
                      ["Property", where],
                      ["Area", d.area],
                      ["Home size", PACKAGES.find((p) => p.id === d.pkg)?.name ?? ""],
                      ["Package", service?.name ?? ""],
                      ["When", d.date ? `${longDate(d.date)}, ${windowLabel}` : ""],
                      ["Listing goes live", longDate(d.launchDate)],
                      ["Access", d.access.trim()],
                      ["Notes", d.notes.trim()],
                    ] as [string, string][]
                  )
                    .filter((r) => r[1])
                    .map(([k, v]) => (
                      <div key={k} className="grid grid-cols-3 gap-4 py-3">
                        <dt className="text-mute">{k}</dt>
                        <dd className="col-span-2 break-words">{v}</dd>
                      </div>
                    ))}
                </dl>
                <div className="mt-8 border border-line bg-white/50 p-6">
                  <p className="label">How payment works</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">{BOOKING.payment}</p>
                </div>
                <div className="mt-4 bg-sand p-6">
                  <p className="label">Good to know</p>
                  <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink-soft">
                    {BOOKING.terms.map((t) => <li key={t}>{t}</li>)}
                    {outside ? <li>{BOOKING.outsideAreaNote}</li> : null}
                  </ul>
                </div>
                <label className="mt-6 flex cursor-pointer items-start gap-3 text-[15px]">
                  <input type="checkbox" className="mt-1 accent-ink" checked={d.agree} onChange={(e) => set("agree", e.target.checked)} />
                  I&apos;ve read the terms above and I&apos;m happy to go ahead.
                </label>
              </>
            )}
          </div>

          <p role="alert" className="mt-6 min-h-6 text-sm text-[#a2401a]">{err}</p>
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-8">
            <button type="button" onClick={back} className={`label link-underline pb-1 ${step === 0 ? "invisible" : ""}`}>Back</button>
            <button type="button" onClick={next} disabled={sending} className="btn btn-solid min-w-[180px] disabled:opacity-60 sm:min-w-[220px]">
              {sending ? "Sending" : step === STEPS.length - 1 ? "Send request" : "Next"}
            </button>
          </div>
        </div>

        {/* The live estimate */}
        <aside id="estimate" className="scroll-mt-28 lg:col-span-4 lg:col-start-9">
          <div className="border border-line bg-white/50 p-6 md:p-7 lg:sticky lg:top-28">
            <p className="label text-mute">Your estimate</p>
            <p className={`mt-4 text-[15px] ${where ? "" : "text-mute"}`}>{where || "Your property"}</p>
            {outside ? <p className="mt-1 text-sm text-mute">More than 25 miles from Madison or Sun Prairie: travel $0.50 a mile round trip, to be confirmed.</p> : null}
            <ul className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
              {!hasLines ? <li className="text-mute">Pick the size of the home and a package to see the price.</li> : null}
              {lines.map((l) => {
                const detail = lineDetail(l);
                return (
                  <li key={l.id} className="flex justify-between gap-4">
                    <span className="min-w-0">
                      {l.name}
                      {detail ? <span className="block text-xs text-mute">{detail}</span> : null}
                    </span>
                    <span className={`shrink-0 ${l.priced ? "" : "text-mute"}`}>{linePrice(l)}</span>
                  </li>
                );
              })}
              {d.pkg && INCLUDED.length ? (
                <li className="flex justify-between gap-4 text-mute">
                  <span className="min-w-0">{INCLUDED.join(" and ")}</span>
                  <span className="shrink-0">Included</span>
                </li>
              ) : null}
            </ul>
            {hasLines ? (
              <>
                <div className="mt-5 flex items-baseline justify-between gap-4 border-t border-ink pt-5">
                  <span className="label">{quoted ? "Estimate so far" : "Total, USD"}</span>
                  <span className="figures text-4xl">{usd(priced.totalCents)}</span>
                </div>
                {quoted ? (
                  <div className="mt-5 border-l border-accent pl-4 text-sm leading-relaxed text-ink-soft">
                    <p className="label text-accent">To confirm</p>
                    <ul className="mt-2 space-y-1">{priced.quoteReasons.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                ) : null}
              </>
            ) : null}
            <p className="mt-6 text-xs leading-relaxed text-mute">
              Prices in USD. Delivered {BOOKING.turnaround}. Prefer to talk it through?{" "}
              <a href={BOOKING.contact.phoneHref} className="underline underline-offset-2">Call or text {BOOKING.contact.phoneDisplay}</a>
              {" "}or email{" "}
              <a href={`mailto:${site.email}`} className="underline underline-offset-2">{site.email}</a>.
            </p>
          </div>
        </aside>
      </div>

      {/* Phones: the total stays in view; the full estimate sits below the form. */}
      {hasLines ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur lg:hidden">
          <a href="#estimate" className="mx-auto flex max-w-xl items-center justify-between gap-4">
            <span className="label text-mute">{quoted ? "Estimate so far" : "Estimate"}</span>
            <span className="flex items-baseline gap-3">
              <span className="figures text-2xl">{usd(priced.totalCents)}</span>
              <span className="label link-underline">Details</span>
            </span>
          </a>
        </div>
      ) : null}
    </div>
  );
}
