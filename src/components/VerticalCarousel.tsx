'use client';

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

type ItemData = string | { title: string; desc: string };

function CarouselItem({
  item,
  index,
  activePos,
  itemHeight,
}: {
  item: ItemData;
  index: number;
  activePos: MotionValue<number>;
  itemHeight: number;
}) {
  const y       = useTransform(activePos, (a) => (index - a) * itemHeight);
  const scale   = useTransform(activePos, (a) => Math.max(0.78, 1.3 - Math.abs(index - a) * 0.24));
  const opacity = useTransform(activePos, (a) => Math.max(0,    1   - Math.abs(index - a) * 0.4));

  const isRich = typeof item === "object";

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
        marginTop: -itemHeight / 2,
        height: itemHeight,
      }}
      className="flex items-center justify-center gap-8 sm:gap-16 px-8 sm:px-16 max-w-4xl mx-auto"
    >
      <span
        className="font-display font-bold text-primary/20 select-none shrink-0 leading-none"
        style={{ fontSize: "clamp(3rem, 6vw, 5rem)", minWidth: "3ch" }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {isRich ? (
        <div className="flex-1 sm:flex sm:items-center sm:gap-12">
          <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal-soft sm:w-52 shrink-0 mb-1 sm:mb-0">
            {(item as { title: string; desc: string }).title}
          </h3>
          <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">
            {(item as { title: string; desc: string }).desc}
          </p>
        </div>
      ) : (
        <p className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-charcoal-soft leading-snug flex-1 whitespace-pre-line">
          {item as string}
        </p>
      )}
    </motion.div>
  );
}

interface VerticalCarouselProps {
  eyebrow: string;
  title: string;
  items: ItemData[];
  bg?: string;
  itemHeight?: number;
}

export function VerticalCarousel({
  eyebrow,
  title,
  items,
  bg = "bg-background",
  itemHeight = 110,
}: VerticalCarouselProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const activePos = useTransform(scrollYProgress, [0, 1], [0, items.length - 1]);

  return (
    <section
      ref={sectionRef}
      className={bg}
      style={{ height: `${items.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen flex flex-col overflow-hidden pb-20">

        {/* En-tête */}
        <div className="pt-20 sm:pt-24 px-6 sm:px-16 pb-4 sm:pb-6 shrink-0 text-center">
          <p className="text-primary font-display italic text-4xl sm:text-5xl mb-2">{eyebrow}</p>
          <h2 className="font-display text-2xl sm:text-3xl sm:text-4xl font-bold text-charcoal-soft">{title}</h2>
        </div>

        {/* Zone carousel */}
        <div className="relative flex-1 overflow-hidden">
          {items.map((item, i) => (
            <CarouselItem
              key={i}
              item={item}
              index={i}
              activePos={activePos}
              itemHeight={itemHeight}
            />
          ))}
        </div>


      </div>
    </section>
  );
}
