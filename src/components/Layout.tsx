'use client';

import { ReactNode } from "react";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { RulerNav } from "@/components/RulerNav";
import { ShinyButton } from "@/components/ui/shiny-button";
import { MobileMenu } from "@/components/MobileMenu";

export function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-body overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border overflow-visible">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between overflow-visible">
          <Link href="/"><AnimatedLogo /></Link>
          {/* Mobile / tablette : CTA seul — nav via bottom bar */}
          <div className="flex items-center gap-3 lg:hidden">
            <ShinyButton href="#contact" size="sm" variant="light" magnetic={false} lightBg>
              <span className="sm:hidden">Devis</span>
              <span className="hidden sm:inline">Devis gratuit</span>
            </ShinyButton>
          </div>
          {/* Desktop : RulerNav */}
          <div className="hidden lg:block">
            <RulerNav />
          </div>
        </div>
      </nav>

      {children}

      {/* Footer — fixe en desktop, normal en mobile/tablette */}
      <footer className="pt-6 pb-[calc(1.5rem+4rem+env(safe-area-inset-bottom,0px))] lg:py-6 bg-charcoal border-t border-primary-foreground/10 lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex flex-col">
            <span className="font-display text-xl font-bold text-primary-foreground/80">
              Val<span className="text-primary">M39</span>
            </span>
            <span className="text-[10px] text-primary-foreground/30 tracking-wide">Lot la Combale, 39200 Saint-Claude</span>
            <span className="text-[10px] text-primary-foreground/30 tracking-wide">SIRET 101 461 598 00019</span>
          </Link>
          <div className="hidden sm:flex items-center gap-6 text-sm text-primary-foreground/40">
            <Link href="/locations-saisonnieres" className="hover:text-primary transition-colors">
              Locations saisonnières
            </Link>
            <Link href="/investisseurs" className="hover:text-primary transition-colors">
              Investisseurs
            </Link>
            <Link href="/agences-immobilieres" className="hover:text-primary transition-colors">
              Agences
            </Link>
            <Link href="/realisations" className="hover:text-primary transition-colors">
              Réalisations
            </Link>
            <span>© 2026 ValM39</span>
          </div>
          {/* CTA — desktop uniquement */}
          <div className="hidden lg:block">
            <ShinyButton href="#contact" size="sm" variant="light" magnetic={false}>
              Demander un devis gratuit
            </ShinyButton>
          </div>
        </div>
      </footer>

      {/* Bottom nav bar — mobile/tablette uniquement */}
      <MobileMenu />
    </div>
  );
}
