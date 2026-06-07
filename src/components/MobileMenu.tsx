'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Images, Key, TrendingUp, Handshake } from "lucide-react";

const LINKS = [
  { href: "/",                       label: "Accueil",      Icon: Home        },
  { href: "/realisations",           label: "Réalisations", Icon: Images      },
  { href: "/locations-saisonnieres", label: "Locations",    Icon: Key         },
  { href: "/investisseurs",          label: "Investisseurs",Icon: TrendingUp  },
  { href: "/agences-immobilieres",   label: "Agences",      Icon: Handshake   },
];

export function MobileMenu() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
      style={{
        background: "rgba(252,250,246,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        boxShadow: "0 -4px 24px rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div className="flex items-stretch">
        {LINKS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className="flex-1 flex flex-col items-center justify-center py-2 gap-1 transition-colors"
              style={{ color: active ? "hsl(85, 35%, 35%)" : "hsl(30, 8%, 55%)" }}
            >
              <Icon
                style={{
                  width: 22, height: 22,
                  strokeWidth: active ? 2.2 : 1.6,
                }}
              />
              <span style={{
                fontSize: 10,
                fontFamily: "DM Sans, sans-serif",
                fontWeight: active ? 600 : 400,
                letterSpacing: "0.01em",
                lineHeight: 1,
              }}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
