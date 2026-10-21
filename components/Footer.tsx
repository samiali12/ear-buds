"use client";

import { useSyncExternalStore } from "react";
import { PRODUCT_NAME } from "@/lib/config";
import { Anchor } from "./Button";

const footerLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#technology", label: "Technology" },
  { href: "#specs", label: "Measurements" },
  { href: "#buy", label: "Buy" },
];

const legalLinks = [
  { href: "#overview", label: "Privacy" },
  { href: "#overview", label: "Terms" },
  { href: "#overview", label: "Cookies" },
];

function subscribe() {
  return () => {};
}

/** Resolved once, in the browser, so the server render stays deterministic. */
let clientYear: string | null = null;

function getYear() {
  if (clientYear === null) {
    clientYear = String(new Date().getFullYear());
  }
  return clientYear;
}

function getServerYear() {
  return "";
}

export default function Footer() {
  // The server and the first client render agree; the real year follows.
  const year = useSyncExternalStore(subscribe, getYear, getServerYear);

  return (
    <footer
      className="px-[8vw] pb-[max(32px,env(safe-area-inset-bottom))] pt-16"
      style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <span className="wordmark">{PRODUCT_NAME}</span>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-2 md:gap-x-10">
            {footerLinks.map((link) => (
              <Anchor key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Anchor>
            ))}
          </nav>
        </div>

        <div
          className="mt-14 flex flex-col gap-4 text-[11px] uppercase tracking-[0.2em] md:flex-row md:items-center md:justify-between"
          style={{ color: "var(--text-muted)" }}
        >
          <p>
            © {year} {PRODUCT_NAME}
          </p>
          <div className="flex gap-x-8 md:gap-x-10">
            {legalLinks.map((link) => (
              <Anchor
                key={link.label}
                href={link.href}
                className="transition-colors duration-500 hover:text-ivory"
              >
                {link.label}
              </Anchor>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
