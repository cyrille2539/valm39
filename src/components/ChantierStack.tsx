'use client';

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { Category } from "@/components/CategoryCarousel";
import { useIsMobile } from "@/hooks/use-mobile";

export interface ChantierPhoto {
  id: string;
  title: string;
  description: string;
  displayImg: string;
}

export interface Chantier {
  id: string;
  nom: string;
  description: string;
  categorie: Category;
  photos: ChantierPhoto[];
}

// Positions de la pile (bas → haut, index 0 = carte du dessous)
const STACK_3 = [
  { rotate: -4, x: 8,   y: 8,  dim: true  },
  { rotate: -2, x: 4,   y: 4,  dim: false },
  { rotate:  0, x: 0,   y: 0,  dim: false },
];
const STACK_2 = [STACK_3[1], STACK_3[2]];
const STACK_1 = [STACK_3[2]];

// Positions du fan au hover — desktop
const FAN_3 = [
  { rotate: -12, x: -36, y: 6,   dim: true  },
  { rotate:   0, x:   0, y: -12, dim: false },
  { rotate:  12, x:  36, y: 6,   dim: true  },
];
const FAN_2 = [
  { rotate: -8, x: -20, y: 4,  dim: true  },
  { rotate:  8, x:  20, y: 4,  dim: false },
];
const FAN_1 = [{ rotate: 0, x: 0, y: -6, dim: false }];

// Fan mobile — angle réduit à ±8° : rotate ±12° étend la carte de H/2×sin(12°)≈50px
// au-delà du container même sans déplacement x, ce qui déborde du viewport
const FAN_3_MOBILE = [
  { rotate: -8, x: 0, y: 10,  dim: true  },
  { rotate:  0, x: 0, y: -12, dim: false },
  { rotate:  8, x: 0, y: 10,  dim: true  },
];
const FAN_2_MOBILE = [
  { rotate: -6, x: 0, y: 8,  dim: true  },
  { rotate:  6, x: 0, y: 8,  dim: false },
];

function getConfigs(n: number, mobile: boolean) {
  if (n >= 3) return { stack: STACK_3, fan: mobile ? FAN_3_MOBILE : FAN_3 };
  if (n === 2) return { stack: STACK_2, fan: mobile ? FAN_2_MOBILE : FAN_2 };
  return { stack: STACK_1, fan: FAN_1 };
}

interface ChantierStackProps {
  chantier: Chantier;
}

export function ChantierStack({ chantier }: ChantierStackProps) {
  const [hovered, setHovered] = useState(false);
  const [open, setOpen]       = useState(false);
  const [idx, setIdx]         = useState(0);
  const touchStartX           = useRef<number | null>(null);

  const isMobile = useIsMobile();
  const cards  = chantier.photos.slice(0, 3);
  const total  = chantier.photos.length;
  const { stack, fan } = getConfigs(cards.length, isMobile === true);

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i - 1 + total) % total);
  };
  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIdx(i => (i + 1) % total);
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 50) {
      // swipe gauche → suivante, swipe droit → précédente
      setIdx(i => delta < 0 ? (i + 1) % total : (i - 1 + total) % total);
    }
    touchStartX.current = null;
  };

  return (
    <>
      <div
        className="cursor-pointer group relative"
        style={{ zIndex: hovered ? 10 : 1 }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { setIdx(0); setOpen(true); }}
      >
        {/* ── Pile de cartes ── */}
        <div className="relative" style={{ aspectRatio: "1 / 1.618" }}>
          {cards.map((photo, i) => {
            const cfg = hovered ? fan[i] : stack[i];
            return (
              <motion.div
                key={photo.id}
                className="absolute inset-0 rounded-2xl overflow-hidden ring-1 ring-black/10 shadow-md"
                style={{ zIndex: i + 1 }}
                animate={{ rotate: cfg.rotate, x: cfg.x, y: cfg.y }}
                transition={{ type: "spring", stiffness: 300, damping: 26 }}
              >
                <img
                  src={photo.displayImg}
                  alt={photo.title || chantier.nom}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                {cfg.dim && <div className="absolute inset-0 bg-charcoal/30" />}
              </motion.div>
            );
          })}

          {total > 1 && (
            <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-charcoal/70 backdrop-blur-sm text-xs font-display font-bold text-primary-foreground select-none">
              {total} photos
            </div>
          )}
        </div>

        {/* ── Infos ── */}
        <motion.div
          className="px-1"
          animate={{ marginTop: (hovered && cards.length > 1) ? 44 : 16 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
        >
          <p className="font-display font-bold text-charcoal-soft text-base leading-tight group-hover:text-primary transition-colors duration-300">
            {chantier.nom}
          </p>
          {chantier.description && (
            <p className="text-muted-foreground text-sm mt-1 leading-relaxed line-clamp-2">
              {chantier.description}
            </p>
          )}
        </motion.div>
      </div>

      {/* ── Lightbox ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-charcoal/96 backdrop-blur-md p-4 sm:p-6 overflow-y-auto"
            onClick={() => setOpen(false)}
          >
            {/* Fermer */}
            <button
              onClick={() => setOpen(false)}
              className="absolute top-5 right-5 text-primary-foreground/60 hover:text-primary-foreground transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="h-8 w-8" />
            </button>

            {/* En-tête */}
            <div className="text-center mb-4 px-10">
              <p className="font-display font-bold text-primary-foreground text-xl">{chantier.nom}</p>
              {chantier.description && (
                <p className="text-primary-foreground/50 text-sm mt-1 max-w-lg mx-auto leading-relaxed">
                  {chantier.description}
                </p>
              )}
            </div>

            {/* Zone image + chevrons (desktop) — swipe (mobile) */}
            <div
              className="flex items-center gap-3 sm:gap-5 w-full max-w-5xl"
              onClick={e => e.stopPropagation()}
            >
              {/* Chevron gauche — desktop uniquement */}
              <button
                onClick={prev}
                aria-label="Photo précédente"
                className={`hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-primary/30 hover:bg-primary/60 transition-colors backdrop-blur-sm ${total <= 1 ? "invisible" : ""}`}
              >
                <ChevronLeft className="h-6 w-6" style={{ color: 'hsl(85, 45%, 65%)', stroke: 'hsl(85, 45%, 65%)' }} />
              </button>

              {/* Image avec swipe tactile */}
              <div
                className="flex-1 min-w-0"
                onTouchStart={onTouchStart}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.img
                    key={idx}
                    src={chantier.photos[idx].displayImg}
                    alt={chantier.photos[idx].title || chantier.nom}
                    className="rounded-2xl shadow-2xl mx-auto object-contain"
                    style={{ maxHeight: "65vh", maxWidth: "100%", width: "auto" }}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.2 }}
                    draggable={false}
                  />
                </AnimatePresence>

                {/* Compteur + légende */}
                <div className="relative flex items-center justify-center mt-3 px-1">
                  {chantier.photos[idx].title && (
                    <p className="text-primary-foreground/50 text-sm font-display text-center">
                      {chantier.photos[idx].title}
                    </p>
                  )}
                  {total > 1 && (
                    <span className="absolute right-1 text-primary-foreground/35 text-sm font-display tabular-nums shrink-0">
                      {idx + 1} / {total}
                    </span>
                  )}
                </div>

                {/* Hint swipe — mobile uniquement */}
                {total > 1 && (
                  <p className="sm:hidden text-center text-primary-foreground/25 text-xs mt-2">
                    ← glissez pour naviguer →
                  </p>
                )}
              </div>

              {/* Chevron droit — desktop uniquement */}
              <button
                onClick={next}
                aria-label="Photo suivante"
                className={`hidden sm:flex shrink-0 items-center justify-center w-12 h-12 rounded-full bg-primary/30 hover:bg-primary/60 transition-colors backdrop-blur-sm ${total <= 1 ? "invisible" : ""}`}
              >
                <ChevronRight className="h-6 w-6" style={{ color: 'hsl(85, 45%, 65%)', stroke: 'hsl(85, 45%, 65%)' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
