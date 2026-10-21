"use client";

import { LENIS_OFFSET } from "@/lib/config";
import { scrollToSection } from "@/lib/lenis";

/** Hash links are routed through the smooth-scroll engine. */
function useAnchorClick(
  href: string | undefined,
  onClick?: () => void
) {
  return (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (href?.startsWith("#")) {
      event.preventDefault();
      scrollToSection(href.slice(1), LENIS_OFFSET);
    }
    onClick?.();
  };
}

interface OutlineButtonProps {
  children: React.ReactNode;
  /** A hash link ("#specs") is smoothed by Lenis. */
  href?: string;
  onClick?: () => void;
  className?: string;
  size?: "md" | "sm";
}

/**
 * A hairline gold button: transparent until hovered, then it fills.
 */
export default function OutlineButton({
  children,
  href,
  onClick,
  className = "",
  size = "md",
}: OutlineButtonProps) {
  const handleClick = useAnchorClick(href, onClick);

  const classes = `btn-outline ${size === "sm" ? "btn-outline--sm" : ""} ${className}`;

  if (href) {
    return (
      <a href={href} className={classes} onClick={handleClick}>
        {children}
      </a>
    );
  }

  return (
    <button type="button" className={classes} onClick={handleClick}>
      {children}
    </button>
  );
}

interface TextLinkProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

/** A secondary link with an underline that draws in from the left. */
export function TextLink({
  children,
  href,
  onClick,
  className = "",
}: TextLinkProps) {
  const handleClick = useAnchorClick(href, onClick);

  if (href) {
    return (
      <a
        href={href}
        className={`link-underline ${className}`}
        onClick={handleClick}
      >
        {children}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={`link-underline ${className}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
}

interface AnchorProps {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/** A plain anchor that still respects the smooth-scroll engine. */
export function Anchor({
  href,
  children,
  onClick,
  className = "",
  style,
}: AnchorProps) {
  const handleClick = useAnchorClick(href, onClick);

  return (
    <a href={href} className={className} style={style} onClick={handleClick}>
      {children}
    </a>
  );
}
