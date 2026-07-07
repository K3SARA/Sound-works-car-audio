import { ImageResponse } from "next/og";
import { LOGO_DATA_URI } from "@/lib/logo-data";

// Generated on request rather than served as a /public file — see the note
// in components/layout/Logo.tsx about static assets not serving reliably
// on this deploy target. This route runs through the server, not the
// static-file pipeline, so it sidesteps that issue entirely.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={LOGO_DATA_URI} alt="" width={420} height={274} style={{ objectFit: "contain" }} />
      </div>
    ),
    size
  );
}
