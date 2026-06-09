'use client';

import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { supabase } from "@/integrations/supabase/client";

const bgSection3 = "/assets/bg-section3.jpg";
const beforeCuisine = "/assets/ba-cuisine-avant.jpg";
const afterCuisine  = "/assets/ba-cuisine-apres.jpg";
const beforeParquet  = "/assets/ba-parquet-avant.jpg";
const afterParquet   = "/assets/ba-parquet-apres.jpg";
const beforePeinture = "/assets/ba-peinture-avant.jpg";
const afterPeinture  = "/assets/ba-peinture-apres.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

interface BeforeAfterItem {
  id: string;
  title: string;
  description: string;
  before_image_url: string | null;
  after_image_url: string | null;
}

const fallbackItems: BeforeAfterItem[] = [
  { id: "1", title: "Rénovation cuisine complète",  description: "", before_image_url: beforeCuisine, after_image_url: afterCuisine  },
  { id: "2", title: "Pose de parquet chêne massif", description: "", before_image_url: beforeParquet, after_image_url: afterParquet  },
  { id: "3", title: "Peinture & redistribution",    description: "", before_image_url: beforePeinture, after_image_url: afterPeinture },
];

type AnimPhase = "split" | "covering" | "shimmer";

interface BeforeAfterCardProps {
  item: BeforeAfterItem;
  index: number;
  isExpanded: boolean;
  isAnyHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

// Même mécanique que ServiceCard : la carte EST le flex item
function BeforeAfterCard({ item, index, isExpanded, isAnyHovered, onMouseEnter, onMouseLeave }: BeforeAfterCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(cardRef, { once: true, margin: "-100px" });
  const [phase, setPhase] = useState<AnimPhase>("split");
  const [didAutoPlay, setDidAutoPlay] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [goldenHeight, setGoldenHeight] = useState<number | null>(null);
  const [hoveredLocked, setHoveredLocked] = useState(false);

  // Mesure unique au montage sur le flex item lui-même (comme ServiceCard)
  useLayoutEffect(() => {
    if (cardRef.current) {
      setGoldenHeight(Math.round(cardRef.current.offsetWidth * 1.618));
    }
  }, []);

  // Verrouille toutes les cartes ensemble quand l'une est survolée
  useEffect(() => {
    if (isAnyHovered) {
      setHoveredLocked(true);
    } else {
      const t = setTimeout(() => setHoveredLocked(false), 650);
      return () => clearTimeout(t);
    }
  }, [isAnyHovered]);

  function play() {
    if (phase !== "split") return;
    setPhase("covering");
    timer.current = setTimeout(() => {
      setPhase("shimmer");
      timer.current = setTimeout(() => setPhase("split"), 3000);
    }, 4000);
  }

  useEffect(() => {
    if (isInView && !didAutoPlay) {
      setDidAutoPlay(true);
      const t = setTimeout(play, 300);
      return () => clearTimeout(t);
    }
  }, [isInView]);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const clipAnimate =
    phase === "covering" ? { clipPath: ["inset(0 0 0 100%)", "inset(0 0 0 0)"] }
    : phase === "shimmer" ? { clipPath: "inset(0 0 0 0)" }
    : { clipPath: "inset(0 0 0 50%)" };
  const dur = phase === "covering" ? 4 : 0;

  const shadow3d = [
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
    "0 40px 40px rgba(0,0,0,0.35)", "0 60px 120px rgba(0,0,0,0.28)",
  ].join(", ");

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ delay: index * 0.15, duration: 0.6, ease: "easeOut" as const }}
      onMouseEnter={() => { onMouseEnter(); if (phase === "split") play(); }}
      onMouseLeave={onMouseLeave}
      className="relative rounded-2xl cursor-pointer select-none ring-1 ring-white/10"
      style={{
        ...(hoveredLocked && goldenHeight
          ? { height: `${goldenHeight}px` }
          : { aspectRatio: "1 / 1.618", alignSelf: "flex-start" }
        ),
        flex: isExpanded ? "2 1 0%" : "1 1 0%",
        maxWidth: "calc(80vh / 1.618)",
        transition: "flex 0.6s cubic-bezier(0.22, 1, 0.36, 1)",
        minWidth: 0,
        boxShadow: shadow3d,
      }}
    >
      {/* Div interne : overflow-hidden pour l'animation clip-path */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        {/* Before layer */}
        <div className="absolute inset-0 bg-muted">
          {item.before_image_url ? (
            <Image src={item.before_image_url} alt={`${item.title} — état avant travaux`} fill className="object-cover" sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="text-center">
                <span className="font-display text-4xl font-bold text-charcoal-soft/20">Avant</span>
                <p className="text-sm text-muted-foreground mt-2">Photo à venir</p>
              </div>
            </div>
          )}
        </div>
        {/* After layer */}
        <motion.div
          className="absolute inset-0 bg-primary/20"
          initial={false}
          animate={clipAnimate}
          transition={{ duration: dur, ease: "easeInOut" }}
        >
          {item.after_image_url ? (
            <Image src={item.after_image_url} alt={`${item.title} — résultat après travaux ValM39`} fill className="object-cover" sizes="(max-width: 639px) 90vw, (max-width: 1023px) 45vw, 33vw" />
          ) : (
            <div className="flex items-center justify-center w-full h-full relative z-10">
              <div className="text-center">
                <span className="font-display text-4xl font-bold text-primary/30">Après</span>
                <p className="text-sm text-muted-foreground mt-2">Photo à venir</p>
              </div>
            </div>
          )}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.15) 45%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.15) 55%, transparent 60%)",
              backgroundSize: "200% 100%",
            }}
            animate={phase === "shimmer" ? { backgroundPosition: ["200% 0", "-200% 0"] } : { backgroundPosition: "200% 0" }}
            transition={phase === "shimmer" ? { duration: 1.5, ease: "easeInOut", repeat: 1 } : { duration: 0 }}
          />
        </motion.div>

      </div>

      {/* Dégradé sombre bas → haut — en dehors du overflow-hidden pour ne pas masquer l'animation */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.4) 45%, rgba(0,0,0,0.1) 100%)" }}
      />

      {/* Bord verre sablé */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.08) 0%, transparent 55%)",
          borderTop: "1px solid rgba(255,255,255,0.22)",
          borderLeft: "1px solid rgba(255,255,255,0.16)",
          borderBottom: "1px solid transparent",
          borderRight: "1px solid transparent",
        }}
      />

      {/* Titre en bas de la carte */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3">
        <h3 className="font-display text-base font-bold text-white leading-snug">{item.title}</h3>
      </div>
    </motion.div>
  );
}

function BeforeAfterGalleryComponent() {
  const [items, setItems] = useState<BeforeAfterItem[]>(fallbackItems);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  useEffect(() => {
    supabase
      .from("media_items")
      .select("id, title, description, before_image_url, after_image_url")
      .contains("display_on", ["home_before_after"])
      .not("before_image_url", "is", null)
      .not("after_image_url", "is", null)
      .order("sort_order")
      .limit(3)
      .then(({ data }) => {
        if (data && data.length > 0) setItems(data);
      });
  }, []);

  return (
    <section id="avant-apres" className="relative py-20 sm:py-28 bg-card">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute inset-0"
          aria-hidden
          animate={{ opacity: [0.08, 0.25, 0.08] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <Image src={bgSection3} alt="" fill className="object-cover grayscale" sizes="100vw" quality={40} />
        </motion.div>
        <motion.div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(212,192,165,0.26) 0%, transparent 70%)" }}
          animate={{ opacity: [0.15, 0.9, 0.15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
      </div>
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={stagger}
        className="relative z-10 max-w-5xl mx-auto px-6"
      >
        <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-3 text-center">
          Nos réalisations
        </motion.p>
        <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft text-center mb-4">
          Avant / Après
        </motion.h2>
        <motion.p variants={fadeUp} className="text-center text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed">
          Survolez les cartes pour découvrir la transformation. Chaque projet est unique, chaque finition est soignée.
        </motion.p>

        {/* Mobile : grille — cartes statiques sans expansion */}
        <div className="grid sm:grid-cols-2 lg:hidden gap-8">
          {items.map((item, i) => (
            <BeforeAfterCard
              key={item.id}
              item={item}
              index={i}
              isExpanded={false}
              isAnyHovered={false}
              onMouseEnter={() => {}}
              onMouseLeave={() => {}}
            />
          ))}
        </div>

        {/* Desktop : flex expand-on-hover, items-start pour ne pas étirer */}
        <div className="hidden lg:flex gap-8 items-start">
          {items.map((item, i) => (
            <BeforeAfterCard
              key={item.id}
              item={item}
              index={i}
              isExpanded={hoveredItem === i}
              isAnyHovered={hoveredItem !== null}
              onMouseEnter={() => setHoveredItem(i)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>

        <motion.div variants={fadeUp} className="flex justify-center mt-12">
          <ShinyButton to="/realisations" size="lg" variant="light" lightBg>
            Voir toutes nos réalisations <ArrowRight className="h-5 w-5" />
          </ShinyButton>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default BeforeAfterGalleryComponent;
