"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { SITE_CONFIG } from "@/lib/siteConfig";

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[#DDD9CE] bg-[#F6F5F1]/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link
          href="/"
          className="flex items-baseline gap-2 text-zinc-900 transition-opacity hover:opacity-80"
        >
          <span className="font-serif text-xl font-bold tracking-tight text-[#0B4F3F]">
            {SITE_CONFIG.name}
          </span>
          <span className="font-mono-num border border-[#DDD9CE] bg-white px-1.5 py-0.5 text-[11px] font-medium text-stone-600">
            {SITE_CONFIG.year}
          </span>
        </Link>

        <nav aria-label="Huvudmeny" className="hidden items-center gap-1 lg:flex">
          {SITE_CONFIG.tools.map((tool) => {
            const active = pathname === tool.href;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className={`rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors ${
                  active
                    ? "bg-[#0B4F3F] text-white"
                    : "text-stone-700 hover:bg-stone-200/70 hover:text-zinc-900"
                }`}
              >
                {tool.shortTitle}
              </Link>
            );
          })}
        </nav>

        <div className="hidden text-xs text-stone-500 xl:block">
          Lokal beräkning &middot; 0 cookies
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-[#DDD9CE] bg-white p-1.5 text-zinc-800 hover:bg-stone-100 lg:hidden"
          aria-label={mobileOpen ? "Stäng meny" : "Öppna meny"}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <nav
          aria-label="Mobilmeny"
          className="border-t border-[#DDD9CE] bg-white px-4 py-3 lg:hidden"
        >
          <div className="flex flex-col divide-y divide-stone-100">
            {SITE_CONFIG.tools.map((tool) => {
              const active = pathname === tool.href;
              return (
                <Link
                  key={tool.href}
                  href={tool.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center justify-between py-2.5 text-sm font-medium ${
                    active ? "font-semibold text-[#0B4F3F]" : "text-zinc-800"
                  }`}
                >
                  <span>{tool.title}</span>
                  <span className="font-mono-num text-xs text-stone-400">{tool.num}</span>
                </Link>
              );
            })}
            <Link
              href="/integritet"
              onClick={() => setMobileOpen(false)}
              className="py-2.5 text-sm text-stone-600"
            >
              Integritet &amp; villkor
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
