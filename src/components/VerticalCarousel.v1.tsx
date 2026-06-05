'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const ITEM_H = 110; // hauteur fixe par item en px

function CarouselItem({
  text,
  index,
  activePos,
}: {
  text: string;
  index: number;
  activePos: MotionValue<number>;
}) {
  // Chaque item est centré absolument, puis décalé selon sa distance avec l'item actif
  const y       = useTransform(activePos, (a) => (index - a) * ITEM_H);
  const scale   = useTransform(activePos, (a) => Math.max(0.78, 1 - Math.abs(index - a) * 0.1));
  const opacity = useTransform(activePos, (a) => Math.max(0,    1 - Math.abs(index - a) * 0.4));

  return (
    <motion.div
      style={{
        y,
        scale,
        opacity,
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        marginTop: -ITEM_H / 2,
        height: ITEM_H,
      }}
      className="flex items-center justify-center gap-8 sm:gap-16 px-8 sm:px-16 max-w-4xl mx-auto"
    >
      <span
        className="font-display font-bold text-primary/20 select-none shrink-0 leading-none"
        style={{ fontSize: "clamp(3rem, 6vw, 5rem)", minWidth: "3ch" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal-soft leading-snug">
        {text}
      </p>
    </motion.div>
  );
}

interface VerticalCarouselProps {
  eyebrow: string;
  title: string;
  items: string[];
  bg?: string;
}

export function VerticalCarousel({
  eyebrow,
  title,
  items,
  bg = "bg-background",
}: VerticalCarouselProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Position active : 0 = premier item, N-1 = dernier item
  const activePos = useTransform(scrollYProgress, [0, 1], [0, items.length - 1]);

  return (
    <section
      ref={sectionRef}
      className={bg}
      style={{ height: `${items.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden pb-20">

        {/* En-tête */}
        <div className="pt-24 px-8 sm:px-16 pb-6 shrink-0 text-center">
          <p className="text-primary font-display italic text-5xl mb-2">{eyebrow}</p>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft">{title}</h2>
        </div>

        {/* Zone carousel — overflow hidden pour masquer les items hors focus */}
        <div className="relative flex-1 overflow-hidden">
          {items.map((text, i) => (
            <CarouselItem
              key={i}
              text={text}
              index={i}
              activePos={activePos}
            />
          ))}
        </div>

        {/* Barre de progression */}
        <div className="px-8 sm:px-16 pb-2 shrink-0 flex items-center gap-4 w-56">
          <div className="flex-1 h-px bg-border relative overflow-hidden rounded-full">
            <motion.div
              className="absolute inset-y-0 left-0 bg-primary rounded-full"
              style={{ scaleX: scrollYProgress, originX: 0, height: "1px" }}
            />
          </div>
          <span className="font-body text-xs text-muted-foreground uppercase tracking-widest shrink-0">
            {items.length}
          </span>
        </div>

      </div>
    </section>
  );
}
