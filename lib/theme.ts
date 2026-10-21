"use client";

import { useEffect, useState } from "react";

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

/**
 * Reads the design tokens off the document so anything rendered outside the
 * DOM — WebGL materials, lights — stays on the same palette as the page.
 */
export function useThemeTokens(): ThemeTokens | null {
  const [tokens, setTokens] = useState<ThemeTokens | null>(null);

  useEffect(() => {
    const styles = getComputedStyle(document.documentElement);

    const read = (name: string) => styles.getPropertyValue(name).trim();

    const ivory = read(TOKEN_NAMES.ivory);
    const gold = read(TOKEN_NAMES.gold);

    if (!ivory || !gold) return;

    setTokens({
      ivory,
      gold,
      goldLight: read(TOKEN_NAMES.goldLight) || gold,
      background: read(TOKEN_NAMES.background),
    });
  }, []);

  return tokens;
}
