import { useState, useEffect } from "react";

interface ChartColors {
  foreground: string;
  muted: string;
  surface: string;
  border: string;
  tooltipText: string;
}

const FALLBACK: ChartColors = {
  foreground: "#170245",
  muted: "#5A5670",
  surface: "#FFFFFF",
  border: "#E0E1E5",
  tooltipText: "#170245",
};

function readCssVar(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

export function useChartColors(): ChartColors {
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    function read() {
      setColors({
        foreground: readCssVar("--foreground") || FALLBACK.foreground,
        muted: readCssVar("--muted") || FALLBACK.muted,
        surface: readCssVar("--surface") || FALLBACK.surface,
        border: readCssVar("--border") || FALLBACK.border,
        tooltipText: readCssVar("--tooltip-text") || FALLBACK.tooltipText,
      });
    }
    read();

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", read);
    return () => mq.removeEventListener("change", read);
  }, []);

  return colors;
}

export function tooltipStyle(c: ChartColors): React.CSSProperties {
  return {
    backgroundColor: c.surface,
    color: c.tooltipText,
    border: `1px solid ${c.border}`,
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: 500,
  };
}

export function tooltipLabelStyle(c: ChartColors): React.CSSProperties {
  return {
    color: c.tooltipText,
    fontWeight: 600,
  };
}

export function tooltipItemStyle(c: ChartColors): React.CSSProperties {
  return {
    color: c.tooltipText,
  };
}
