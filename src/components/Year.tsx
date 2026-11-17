"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// The current year, read in the browser so the footer never goes stale
// and the server-rendered page stays fully static.
export function Year() {
  const year = useSyncExternalStore(noop, () => String(new Date().getFullYear()), () => "");
  return <span>{year}</span>;
}
