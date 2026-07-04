import { LOGO_DATA_URI } from "@/lib/logo-data";

// Embedded as a base64 data URI rather than served from /public — serving
// /logo.png as a static file was failing in the Railway deploy (root cause
// unconfirmed), so this ships the image inside the JS bundle instead,
// which has no dependency on static-file serving at all.
export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={LOGO_DATA_URI} alt="Sound Works Car Audio" className={className} />;
}
