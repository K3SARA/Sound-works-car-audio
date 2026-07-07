import { DesktopShell } from "@/components/layout/DesktopShell";

export default function DesktopLayout({ children }: { children: React.ReactNode }) {
  return <DesktopShell>{children}</DesktopShell>;
}
