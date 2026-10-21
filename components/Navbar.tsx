"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EASE, PRODUCT_NAME } from "@/lib/config";
import OutlineButton, { Anchor } from "./Button";

const navLinks = [
  { href: "#overview", label: "Overview" },
  { href: "#technology", label: "Technology" },
  { href: "#specs", label: "Specs" },
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

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40">
        <div
          className="flex h-[72px] items-center justify-between px-[8vw] transition-colors duration-500"
          style={{
            background: isScrolled ? "var(--bg-veil)" : "transparent",
            backdropFilter: isScrolled ? "blur(14px)" : "none",
            WebkitBackdropFilter: isScrolled ? "blur(14px)" : "none",
            borderBottom: `1px solid ${isScrolled ? "var(--line)" : "transparent"}`,
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
            className="flex h-10 w-10 items-center justify-center md:hidden"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="fixed inset-0 z-30 flex flex-col justify-between px-[8vw] pb-14 pt-28 md:hidden"
            style={{ background: "var(--bg)" }}
          >
            <nav className="flex flex-col gap-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.9,
                    ease: EASE,
                    delay: 0.12 + index * 0.07,
                  }}
                >
                  <Anchor
                    href={link.href}
                    className="font-serif text-4xl"
                    style={{ color: "var(--ivory)" }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {link.label}
                  </Anchor>
                </motion.div>
              ))}
            </nav>

            <div>
              <OutlineButton
                href="#buy"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pre-order
              </OutlineButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
