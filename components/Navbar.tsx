"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, PRODUCT_NAME } from "@/lib/config";
import OutlineButton, { Anchor } from "./Button";

const navLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#technology", label: "Technology" },
  { href: "#specs", label: "Measurements" },
  { href: "#buy", label: "Buy" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock the page while the menu is open, and close on Escape
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMobileMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div
          className="flex h-[64px] items-center justify-between px-[max(20px,env(safe-area-inset-left))] pt-[env(safe-area-inset-top)] md:h-[76px] md:px-[8vw]"
          style={{
            background: isScrolled ? "var(--bg-veil)" : "transparent",
            borderBottom: `1px solid ${isScrolled ? "var(--line)" : "transparent"}`,
            transition:
              "background-color 500ms var(--ease), border-color 500ms var(--ease)",
          }}
        >
          {/* Wordmark */}
          <Anchor
            href="#overview"
            className="wordmark"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {PRODUCT_NAME}
          </Anchor>

          {/* Desktop links */}
          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map((link) => (
              <Anchor key={link.href} href={link.href} className="nav-link">
                {link.label}
              </Anchor>
            ))}
          </nav>

          {/* Thin outlined call to action */}
          <OutlineButton href="#buy" size="sm" className="hidden md:inline-flex">
            Pre-order
          </OutlineButton>

          {/* Menu toggle — hairline strokes only */}
          <button
            className="-mr-2 flex h-11 w-11 items-center justify-center md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-menu"
            style={{ color: "var(--ivory)" }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
            >
              {isMobileMenuOpen ? (
                <path d="M5 5l14 14M19 5L5 19" />
              ) : (
                <path d="M4 8h16M4 16h16" />
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-30 flex flex-col justify-between px-[max(20px,env(safe-area-inset-left))] pb-[max(28px,env(safe-area-inset-bottom))] pt-[calc(64px+env(safe-area-inset-top)+32px)] md:hidden"
            style={{ background: "var(--bg)" }}
          >
            <nav className="flex flex-col">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: EASE,
                    delay: 0.1 + index * 0.06,
                  }}
                >
                  <Anchor
                    href={link.href}
                    className="block border-b border-line py-5 font-serif text-[2rem] leading-tight"
                    style={{ color: "var(--ivory)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Anchor>
                </motion.div>
              ))}
            </nav>

            <div className="pt-10">
              <OutlineButton
                href="#buy"
                className="w-full"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pre-order {PRODUCT_NAME}
              </OutlineButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
