function parseFiniteNumber(raw: string, fieldLabel: string) {
  const normalized = raw.trim().replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`${fieldLabel} inválida.`);
  }

  return parsed;
}

export function parseOptionalLatitude(raw: string) {
  if (!raw.trim()) return null;
  const value = parseFiniteNumber(raw, "Latitude");
  if (value < -90 || value > 90) {
    throw new Error("Latitude deve estar entre -90 e 90.");
  }
  return Number(value.toFixed(7));
}

export function parseOptionalLongitude(raw: string) {
  if (!raw.trim()) return null;
  const value = parseFiniteNumber(raw, "Longitude");
  if (value < -180 || value > 180) {
    throw new Error("Longitude deve estar entre -180 e 180.");
  }
  return Number(value.toFixed(7));
}

export function parsePositiveDecimal(raw: string, fieldLabel: string) {
  const value = parseFiniteNumber(raw, fieldLabel);
  if (value <= 0) {
    throw new Error(`${fieldLabel} deve ser maior que zero.`);
  }
  return value;
}
