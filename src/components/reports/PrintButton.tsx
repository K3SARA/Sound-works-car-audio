"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white"
    >
      <Printer size={16} />
      Print invoice (A5)
    </button>
  );
}
