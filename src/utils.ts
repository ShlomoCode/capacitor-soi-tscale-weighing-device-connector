import type { WeightReading, WeightUnit } from "./types";

const WEIGHT_DATA_REGEX = /^(ST|US),(GS|NT),\s*([+-]?)\s*(\d+\.?\d*)(KG|LB)$/;

export function parseWeightReading(rawData: string): WeightReading | null {
  if (!rawData || typeof rawData !== "string") return null;

  const lines = rawData.trim().split("\n");
  const lastLine = lines[lines.length - 1];

  const match = lastLine.match(WEIGHT_DATA_REGEX);
  if (!match) return null;

  const [, stability, type, sign, valueString, unit] = match;

  return {
    value: parseFloat(sign + valueString),
    unit: unit as WeightUnit,
    type: type === "GS" ? "gross" : "net",
    isStable: stability === "ST",
    timestamp: new Date(),
  };
}
