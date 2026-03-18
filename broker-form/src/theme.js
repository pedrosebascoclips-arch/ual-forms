// ═══ UAL Shared Theme ═══
// Used by BrokerForm and CreditApp

export const C = {
  bg: "#070B14",
  surface: "rgba(255,255,255,0.03)",
  surfaceHover: "rgba(255,255,255,0.06)",
  glass: "rgba(255,255,255,0.04)",
  glassHeavy: "rgba(12,16,28,0.88)",
  input: "rgba(255,255,255,0.04)",
  borderSubtle: "rgba(255,255,255,0.06)",
  borderMedium: "rgba(255,255,255,0.10)",
  borderFocus: "rgba(59,130,246,0.40)",
  text1: "#FFFFFF",
  text2: "rgba(255,255,255,0.65)",
  text3: "rgba(255,255,255,0.30)",
  text4: "rgba(255,255,255,0.15)",
  blue: "#3B82F6",
  green: "#34D399",
  yellow: "#F59E0B",
  red: "#EF4444",
  purple: "#A78BFA",
  cyan: "#22D3EE",
};

export const inputStyle = {
  width: "100%",
  padding: "14px 16px",
  background: C.input,
  border: `1px solid ${C.borderSubtle}`,
  borderRadius: "12px",
  color: C.text1,
  fontSize: "15px",
  outline: "none",
  fontFamily: "inherit",
  boxSizing: "border-box",
  WebkitAppearance: "none",
  minHeight: "48px",
  transition: "all 0.2s cubic-bezier(0.25,0.46,0.45,0.94)",
};

export const focusStyle = (el) => {
  el.style.borderColor = C.borderFocus;
  el.style.boxShadow = "0 0 0 4px rgba(59,130,246,0.08)";
};

export const blurStyle = (el) => {
  el.style.borderColor = C.borderSubtle;
  el.style.boxShadow = "none";
};
