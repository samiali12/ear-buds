"use client";

import { useSyncExternalStore } from "react";

export interface ThemeTokens {
  ivory: string;
  gold: string;
  goldLight: string;
  background: string;
}

const TOKEN_NAMES = {
  ivory: "--ivory",
  gold: "--gold",
  goldLight: "--gold-light",
  background: "--bg",
} as const;

let cached: ThemeTokens | null = null;

function subscribe() {
  return () => {};
}

function readTokens(): ThemeTokens | null {
  if (cached) return cached;
  if (typeof window === "undefined") return null;

  const styles = getComputedStyle(document.documentElement);
  const read = (name: string) => styles.getPropertyValue(name).trim();

  const ivory = read(TOKEN_NAMES.ivory);
  const gold = read(TOKEN_NAMES.gold);

  if (!ivory || !gold) return null;

  cached = {
    ivory,
    gold,
    goldLight: read(TOKEN_NAMES.goldLight) || gold,
    background: read(TOKEN_NAMES.background),
  };

  return cached;
}

/**
 * Reads the design tokens off the document so anything rendered outside the
 * DOM — WebGL materials, lights — stays on the same palette as the page.
 */
export function useThemeTokens(): ThemeTokens | null {
  return useSyncExternalStore(subscribe, readTokens, () => null);
}
