export interface SlideTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
  };
  typography: {
    fontHeading: string;
    fontBody: string;
    scaleHeading: number;
    scaleBody: number;
  };
  spacing: {
    slidePaddingX: number;
    slidePaddingY: number;
    gap: number;
  };
  borderRadius: number;
}

export const DEFAULT_THEME: SlideTheme = {
  colors: {
    primary: "#2563EB",
    secondary: "#7C3AED",
    background: "#FFFFFF",
    surface: "#F8FAFC",
    text: "#0F172A",
    textMuted: "#64748B",
    accent: "#F59E0B",
  },
  typography: {
    fontHeading: "Inter",
    fontBody: "Inter",
    scaleHeading: 1,
    scaleBody: 1,
  },
  spacing: {
    slidePaddingX: 64,
    slidePaddingY: 48,
    gap: 24,
  },
  borderRadius: 8,
};
