"use client";

import { useRef } from "react";
import type { MouseEvent, ReactNode } from "react";

/**
 * A table row that navigates to the in-page anchor of the link in its first
 * cell when you click anywhere in the row. Rows with no link (e.g. the header)
 * do nothing, and clicking the link itself still works natively. Styling is
 * untouched — only the cursor changes (see `.prose tbody tr:has(a)` in CSS).
 */
export function ClickableTableRow({ children }: { children?: ReactNode }) {
  const ref = useRef<HTMLTableRowElement>(null);

  function handleClick(e: MouseEvent<HTMLTableRowElement>) {
    // If they clicked the actual link, let the browser handle it.
    if ((e.target as HTMLElement).closest("a")) return;
    const link = ref.current?.querySelector("a");
    if (link) link.click();
  }

  return (
    <tr ref={ref} onClick={handleClick}>
      {children}
    </tr>
  );
}
