// Plain <img>, not next/image — this is a small static asset and doesn't
// need the optimizer, which was failing to serve it in some environments.
export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo.png" alt="Sound Works Car Audio Solutions" className={className} />;
}
