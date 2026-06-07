'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/",                       label: "Accueil" },
  { href: "/realisations",           label: "Réalisations" },
  { href: "/locations-saisonnieres", label: "Locations saisonnières" },
  { href: "/investisseurs",          label: "Investisseurs" },
  { href: "/agences-immobilieres",   label: "Agences immobilières" },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Bouton hamburger */}
      <button
        onClick={() => setOpen(v => !v)}
        className="lg:hidden flex items-center justify-center w-10 h-10 rounded-full bg-background/80 border border-border text-foreground hover:text-primary transition-colors"
        aria-label="Menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[73px] left-0 right-0 z-40 bg-background/97 backdrop-blur-md border-b border-border shadow-xl lg:hidden"
          >
            <nav className="max-w-6xl mx-auto px-6 py-6 flex flex-col gap-1">
              {LINKS.map(link => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={`font-display text-2xl font-bold py-3 border-b border-border/50 last:border-0 transition-colors duration-200 ${
                      active ? "text-primary" : "text-charcoal-soft hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="#contact"
                onClick={() => setOpen(false)}
                className="mt-4 w-full text-center py-3 rounded-full bg-primary text-primary-foreground font-display font-bold text-base hover:bg-primary/90 transition-colors"
              >
                Demander un devis gratuit
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
