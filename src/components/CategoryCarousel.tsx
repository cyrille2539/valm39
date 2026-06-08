'use client';

import { useState, useEffect, useRef } from "react";

export type Category = "tout" | "cuisine" | "parquet" | "cloisons" | "peinture" | "électricité" | "autres";

export interface CarouselCard {
  value: Category;
  label: string;
  img: string;
  gradient: string;
  accentColor: string;
}

interface Props {
  cards: CarouselCard[];
  onSelect: (cat: Category) => void;
  externalPaused?: boolean;
}

const CARD_W = 200;
const CARD_H = Math.round(CARD_W * 1.618); // ≈ 323 px

const SHADOW_3D = [
  "inset 0 1px 0 rgba(255,255,255,0.08)",
  "0 1px 0 rgba(0,0,0,0.46)", "0 2px 0 rgba(0,0,0,0.44)",
  "0 3px 0 rgba(0,0,0,0.42)", "0 4px 0 rgba(0,0,0,0.40)",
  "0 5px 0 rgba(0,0,0,0.38)", "0 6px 0 rgba(0,0,0,0.36)",
  "0 7px 0 rgba(0,0,0,0.33)", "0 8px 0 rgba(0,0,0,0.30)",
  "0 10px 0 rgba(0,0,0,0.27)", "0 12px 0 rgba(0,0,0,0.24)",
  "0 14px 0 rgba(0,0,0,0.21)", "0 16px 0 rgba(0,0,0,0.18)",
  "0 18px 0 rgba(0,0,0,0.15)", "0 20px 0 rgba(0,0,0,0.12)",
  "0 24px 0 rgba(0,0,0,0.09)", "0 28px 0 rgba(0,0,0,0.06)",
  "0 32px 0 rgba(0,0,0,0.04)", "0 36px 0 rgba(0,0,0,0.02)",
  "1px 0 0 rgba(0,0,0,0.27)", "2px 0 0 rgba(0,0,0,0.26)",
  "3px 0 0 rgba(0,0,0,0.24)", "4px 0 0 rgba(0,0,0,0.22)",
  "5px 0 0 rgba(0,0,0,0.20)", "6px 0 0 rgba(0,0,0,0.18)",
  "7px 0 0 rgba(0,0,0,0.16)", "8px 0 0 rgba(0,0,0,0.14)",
  "10px 0 0 rgba(0,0,0,0.11)", "12px 0 0 rgba(0,0,0,0.08)",
  "14px 0 0 rgba(0,0,0,0.05)", "16px 0 0 rgba(0,0,0,0.03)",
  "18px 0 0 rgba(0,0,0,0.02)", "20px 0 0 rgba(0,0,0,0.01)",
  "2px 2px 0 rgba(0,0,0,0.21)", "4px 4px 0 rgba(0,0,0,0.18)",
  "6px 6px 0 rgba(0,0,0,0.15)", "8px 8px 0 rgba(0,0,0,0.12)",
  "10px 10px 0 rgba(0,0,0,0.09)", "12px 12px 0 rgba(0,0,0,0.07)",
  "14px 14px 0 rgba(0,0,0,0.05)", "16px 16px 0 rgba(0,0,0,0.03)",
  "0 40px 40px rgba(0,0,0,0.35)",
  "0 60px 120px rgba(0,0,0,0.28)",
].join(", ");

const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`;

export function CategoryCarousel({ cards, onSelect, externalPaused = false }: Props) {
  const n = cards.length;
  const STEP = 360 / n;
  const RADIUS = Math.round((CARD_W + 40) / (2 * Math.sin(Math.PI / n)));

  // Largeur visuelle native du cylindre : 2×RADIUS + CARD_W ≈ 754 px
  const NATIVE_W = 2 * RADIUS + CARD_W;
  const NATIVE_H = CARD_H + 80; // 40 px de marge haut/bas pour les ombres

  // Mesure du container pour calculer l'échelle sans overflow:hidden brutal
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [containerW, setContainerW] = useState(NATIVE_W);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const ro = new ResizeObserver(entries => setContainerW(entries[0].contentRect.width));
    ro.observe(el);
    setContainerW(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  // ≤ 1 : le carousel se réduit pour tenir, mais ne grossit jamais
  const scale = containerW > 0 ? Math.min(1, containerW / NATIVE_W) : 1;

  const [frontIdx, setFrontIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragDeg, setDragDeg] = useState(0);
  const [paused, setPaused] = useState(false);

  const startX = useRef<number | null>(null);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  const RESUME_DELAY = 8000;
  const rotation = -(frontIdx * STEP) + dragDeg;

  // Z-index explicite : évite les échecs de tri automatique du preserve-3d.
  const getZIndex = (i: number) => {
    const angleDeg = i * STEP + rotation;
    return Math.round(Math.cos((angleDeg * Math.PI) / 180) * 50) + 51;
  };

  const pause = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), RESUME_DELAY);
  };

  // Clic volontaire → rotation arrêtée sans reprise automatique
  const pauseForever = () => {
    setPaused(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
  };

  useEffect(() => () => { if (resumeTimer.current) clearTimeout(resumeTimer.current); }, []);

  // Annule le timer de reprise tant que la souris est sur la grille des chantiers
  useEffect(() => {
    if (externalPaused && resumeTimer.current) clearTimeout(resumeTimer.current);
  }, [externalPaused]);

  useEffect(() => {
    if (isDragging || paused || externalPaused) return;
    const t = setInterval(() => setFrontIdx(p => (p + 1) % n), 3400);
    return () => clearInterval(t);
  }, [isDragging, paused, externalPaused, n]);

  useEffect(() => {
    onSelectRef.current(cards[frontIdx].value);
  }, [frontIdx, cards]);

  const snap = (deg: number) => {
    const steps = Math.round(deg / STEP);
    setFrontIdx(p => ((p - steps) % n + n) % n);
    setDragDeg(0);
  };

  const down = (x: number) => { pause(); setIsDragging(true); startX.current = x; };
  const move = (x: number) => {
    if (!isDragging || startX.current === null) return;
    setDragDeg((x - startX.current) * 0.45);
  };
  const up = () => {
    if (!isDragging) return;
    setIsDragging(false);
    snap(dragDeg);
    startX.current = null;
  };
  const goTo = (i: number) => { if (isDragging) return; pauseForever(); setFrontIdx(i); setDragDeg(0); };

  return (
    <div className="flex flex-col items-center gap-5 mb-14">

      {/*
        Wrapper de mesure :
        - height = NATIVE_H × scale  (réserve l'espace visuel exact)
        - position:relative          (ancre l'enfant absolu)
        - overflow:hidden            (empêche le scroll horizontal provoqué par
                                      la scène native ≈754 px sur mobile)
        Sur desktop (scale=1) : wrapper = NATIVE_H, scène centrée, rien coupé.
        Sur mobile (scale<1)  : la scène (754 px) est scalée pour tenir dans
                                containerW — l'overflow:hidden ne coupe aucun
                                contenu visible (les ombres ≤36 px rentrent
                                dans les 40 px de marge NATIVE_H).
      */}
      <div
        ref={wrapperRef}
        style={{
          width: "100%",
          height: NATIVE_H * scale,
          position: "relative",
        }}
      >
        {/*
          Scène native (NATIVE_W × NATIVE_H) positionnée en absolu.
          left = (containerW - NATIVE_W) / 2  → centre l'élément horizontalement.
          transformOrigin: 'top center'        → le pivot de scale est le centre
                                                 horizontal de la scène.
          Résultat : sur mobile, la scène remplit exactement 0…containerW px.
        */}
        <div
          style={{
            position: "absolute",
            left: (containerW - NATIVE_W) / 2,
            top: 0,
            width: NATIVE_W,
            height: NATIVE_H,
            transform: scale < 1 ? `scale(${scale})` : undefined,
            transformOrigin: "top center",
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={e => down(e.clientX)}
          onMouseMove={e => move(e.clientX)}
          onMouseUp={up}
          onMouseLeave={up}
          onTouchStart={e => down(e.touches[0].clientX)}
          onTouchMove={e => { e.preventDefault(); move(e.touches[0].clientX); }}
          onTouchEnd={up}
        >
          {/* ── Scène perspective ── */}
          <div
            className="w-full h-full flex items-center justify-center select-none"
            style={{ perspective: 900 }}
          >
            {/* Cylindre rotatif */}
            <div style={{
              width: CARD_W,
              height: CARD_H,
              position: "relative",
              transformStyle: "preserve-3d",
              transform: `rotateY(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)",
            }}>
              {cards.map((card, i) => {
                const isActive = frontIdx === i;
                return (
                  <div
                    key={card.value}
                    onClick={() => goTo(i)}
                    style={{
                      position: "absolute",
                      width: CARD_W,
                      height: CARD_H,
                      left: 0, top: 0,
                      transform: `rotateY(${i * STEP}deg) translateZ(${RADIUS}px)`,
                      borderRadius: 16,
                      overflow: "hidden",
                      background: card.gradient,
                      boxShadow: SHADOW_3D,
                      cursor: "pointer",
                      zIndex: getZIndex(i),
                    }}
                  >
                    {/* Photo */}
                    <img
                      src={card.img} alt={card.label}
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ pointerEvents: "none" }}
                      draggable={false}
                    />

                    {/* Grain artisanal */}
                    <div
                      className="absolute inset-0 opacity-[0.12] mix-blend-overlay pointer-events-none"
                      style={{ backgroundImage: GRAIN }}
                    />

                    {/* Voile chaud */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(to bottom, rgba(240,232,218,0.20) 0%, rgba(175,150,115,0.20) 100%)" }}
                    />

                    {/* Overlay sombre bas → haut */}
                    <div className="absolute inset-0 pointer-events-none"
                      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.50) 60%, rgba(0,0,0,0.20) 100%)" }}
                    />

                    {/* Biseau verre sablé */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{
                      background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 55%)",
                      borderTop: "1px solid rgba(255,255,255,0.22)",
                      borderLeft: "1px solid rgba(255,255,255,0.16)",
                      borderBottom: "1px solid transparent",
                      borderRight: "1px solid transparent",
                    }} />

                    {/* Anneau actif */}
                    {isActive && (
                      <div className="absolute inset-0 rounded-2xl pointer-events-none"
                        style={{ boxShadow: `inset 0 0 0 1.5px ${card.accentColor}55` }}
                      />
                    )}

                    {/* Contenu */}
                    <div className="absolute inset-0 flex flex-col justify-end p-5">
                      <h3 style={{
                        fontFamily: "Georgia, serif",
                        fontWeight: 700,
                        fontSize: 18,
                        color: "white",
                        margin: 0,
                        letterSpacing: "0.01em",
                      }}>
                        {card.label}
                      </h3>
                    </div>

                    {/* Point accentué */}
                    {isActive && (
                      <div style={{
                        position: "absolute", top: 14, right: 14,
                        width: 7, height: 7, borderRadius: "50%",
                        background: card.accentColor,
                        boxShadow: `0 0 10px ${card.accentColor}`,
                      }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Indicateur dots ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 items-center">
        {cards.map((card, i) => (
          <button
            key={card.value}
            onClick={() => goTo(i)}
            aria-label={card.label}
            style={{
              width: frontIdx === i ? 22 : 6,
              height: 6,
              borderRadius: 3,
              background: frontIdx === i ? "hsl(var(--primary))" : "hsl(var(--border))",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Hint */}
      <p className="text-muted-foreground/40 text-xs">
        {paused ? "Catégorie sélectionnée — glissez pour changer" : "Glissez ou cliquez pour filtrer"}
      </p>

    </div>
  );
}
