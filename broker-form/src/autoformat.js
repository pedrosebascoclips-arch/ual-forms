export function autoCapName(raw) {
  if (!raw) return raw;
  if (!raw.replace(/\s/g, "")) return raw;
  let result = raw;
  const letters = raw.replace(/[^a-zA-Z]/g, "");
  if (letters.length > 1 && letters === letters.toUpperCase()) {
    result = raw.toLowerCase();
  }
  let capitalize = true;
  let out = "";
  for (let i = 0; i < result.length; i++) {
    const ch = result[i];
    if (ch === " ") {
      out += ch;
      capitalize = true;
    } else if (capitalize) {
      out += ch.toUpperCase();
      capitalize = false;
    } else {
      out += ch;
    }
  }
  return out;
}

export function autoFmtPhone(raw) {
  if (!raw) return raw;
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.length === 11 && digits[0] === "1") {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}
