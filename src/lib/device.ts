import { UAParser } from "ua-parser-js";

export type DeviceType = "mobile" | "desktop";

/** Tablets are treated as desktop — managers reviewing reports on an iPad still need the full dashboard. */
export function detectDevice(userAgent: string | null): DeviceType {
  if (!userAgent) return "desktop";
  const { device } = UAParser(userAgent);
  return device.type === "mobile" ? "mobile" : "desktop";
}
