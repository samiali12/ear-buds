"use client";

import { useEffect, useState } from "react";
import { PRODUCT_NAME } from "@/lib/config";
import { Anchor } from "./Button";

const footerLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#technology", label: "Technology" },
  { href: "#specs", label: "Specs" },
  { href: "#buy", label: "Buy" },
];

const legalLinks = [
  { href: "#overview", label: "Privacy" },
  { href: "#overview", label: "Terms" },
  { href: "#overview", label: "Cookies" },
];

export default function Footer() {
  const [year, setYear] = useState<number>(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      className="px-[8vw] pb-14 pt-16"
      style={{ background: "var(--bg-2)", borderTop: "1px solid var(--line)" }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <span className="wordmark">{PRODUCT_NAME}</span>

          <nav className="flex flex-wrap items-center gap-7 md:gap-9">
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
          <div className="flex gap-7 md:gap-9">
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
