"use client";

import { useState } from "react";
import Image from "next/image";

type CompanyLogoProps = {
  logo?: string;
  name: string;
  href?: string;
  size?: number;
};

export function CompanyLogo({ logo, name, href, size = 36 }: CompanyLogoProps) {
  const [failed, setFailed] = useState(false);

  const inner =
    !logo || failed ? (
      <div
        className="rounded-xl bg-white/[0.05] border border-[var(--color-border)] flex items-center justify-center text-sm font-bold text-zinc-300 shrink-0"
        style={{ width: size, height: size }}
      >
        {name[0]}
      </div>
    ) : (
      <div
        className="rounded-xl overflow-hidden border border-white/10 bg-white shrink-0"
        style={{ width: size, height: size }}
      >
        <Image
          src={logo}
          alt={`${name} logo`}
          width={size}
          height={size}
          className="object-contain w-full h-full p-1"
          onError={() => setFailed(true)}
        />
      </div>
    );

  if (href && href !== "#") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 hover:opacity-80 transition-opacity"
        aria-label={name}
      >
        {inner}
      </a>
    );
  }

  return inner;
}
