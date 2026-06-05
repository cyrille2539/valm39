'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { PhoneLink } from "@/components/PhoneLink";
import Link from "next/link";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Layout } from "@/components/Layout";
import { CategoryCarousel } from "@/components/CategoryCarousel";
import type { Category, CarouselCard } from "@/components/CategoryCarousel";
import { ChantierStack } from "@/components/ChantierStack";
import type { Chantier } from "@/components/ChantierStack";
import { supabase } from "@/integrations/supabase/client";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ContactForm } from "@/components/ContactForm";

const heroHome = "/assets/hero-home.jpg";
const heroRealisations = "/assets/hero-realisations.jpg";
const serviceCuisine = "/assets/service-cuisine.jpg";
const serviceParquet = "/assets/service-parquet.jpg";
const serviceCloisons = "/assets/service-cloisons.jpg";
const servicePeinture = "/assets/service-peinture.jpg";
const heroRenovation = "/assets/hero-renovation.jpg";
const serviceElectricite = "/assets/service-electricite.jpg";
const baCuisineAvant = "/assets/ba-cuisine-avant.jpg";
const baCuisineApres = "/assets/ba-cuisine-apres.jpg";
const baParquetAvant = "/assets/ba-parquet-avant.jpg";
const baParquetApres = "/assets/ba-parquet-apres.jpg";
const baPeintureAvant = "/assets/ba-peinture-avant.jpg";
const baPeintureApres = "/assets/ba-peinture-apres.jpg";

const fadeUp = {
  hidden:  { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const CATEGORY_CARDS: CarouselCard[] = [
  { value: "tout",     label: "Tout voir",     img: heroHome,        gradient: "linear-gradient(135deg, #2a2218 0%, #3d3425 40%, #524838 70%, #6a5e4a 100%)", accentColor: "#c8a96e" },
  { value: "cuisine",  label: "Cuisine",        img: serviceCuisine,  gradient: "linear-gradient(135deg, #2a1f14 0%, #4a3520 40%, #6b5a3e 70%, #8c7355 100%)", accentColor: "#c8a96e" },
  { value: "parquet",  label: "Parquet",         img: serviceParquet,  gradient: "linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 40%, #4a6b4a 70%, #6b8c5a 100%)", accentColor: "#8aad6e" },
  { value: "cloisons", label: "Cloisons",        img: serviceCloisons, gradient: "linear-gradient(135deg, #1a1a2a 0%, #2d2d4a 40%, #3d3d5c 70%, #5c5c7a 100%)", accentColor: "#8e8ec8" },
  { value: "peinture",     label: "Peinture",        img: servicePeinture, gradient: "linear-gradient(135deg, #2a1a1a 0%, #4a2d2d 40%, #6b4040 70%, #8c5555 100%)", accentColor: "#c87878" },
  { value: "électricité", label: "Électricité",     img: serviceElectricite,  gradient: "linear-gradient(135deg, #1a1a08 0%, #2e2e10 40%, #4a4a1a 70%, #6b6b28 100%)", accentColor: "#d4c84e" },
  { value: "autres",      label: "Autres travaux",  img: heroRenovation,  gradient: "linear-gradient(135deg, #1a1818 0%, #2d2a28 40%, #403e3a 70%, #555250 100%)", accentColor: "#a09080" },
];

const MOCK_CHANTIERS: Chantier[] = [
  {
    id: "c-cuisine-arbois",
    nom: "Cuisine — Arbois",
    description: "Rénovation complète d'une cuisine de 12 m² — nouveaux meubles, plan de travail quartz, carrelage et électroménager encastré.",
    categorie: "cuisine",
    photos: [
      { id: "pc1", title: "Après travaux", description: "", displayImg: baCuisineApres },
      { id: "pc2", title: "Avant travaux", description: "", displayImg: baCuisineAvant },
      { id: "pc3", title: "Détail finitions", description: "", displayImg: serviceCuisine },
    ],
  },
  {
    id: "c-parquet-lons",
    nom: "Parquet — Lons-le-Saunier",
    description: "Pose d'un parquet chêne massif en chevrons sur 45 m² — ragréage, mise à niveau et finition huile naturelle.",
    categorie: "parquet",
    photos: [
      { id: "pp1", title: "Après travaux", description: "", displayImg: baParquetApres },
      { id: "pp2", title: "Avant travaux", description: "", displayImg: baParquetAvant },
      { id: "pp3", title: "Détail pose chevrons", description: "", displayImg: serviceParquet },
    ],
  },
  {
    id: "c-cloisons-dole",
    nom: "Cloisons — Dole",
    description: "Création d'une suite parentale par redistribution des espaces avec cloisons sèches et isolation phonique renforcée.",
    categorie: "cloisons",
    photos: [
      { id: "pcl1", title: "Chantier en cours", description: "", displayImg: serviceCloisons },
    ],
  },
  {
    id: "c-peinture-salins",
    nom: "Peinture — Salins-les-Bains",
    description: "Rénovation complète d'un appartement de 65 m² — suppression de cloisons, peinture premium et redistribution des pièces.",
    categorie: "peinture",
    photos: [
      { id: "ppt1", title: "Après travaux", description: "", displayImg: baPeintureApres },
      { id: "ppt2", title: "Avant travaux", description: "", displayImg: baPeintureAvant },
      { id: "ppt3", title: "Détail finitions", description: "", displayImg: servicePeinture },
    ],
  },
];

export default function Realisations() {
  const [activeFilter, setActiveFilter] = useState<Category>("tout");
  const [chantiers, setChantiers]       = useState<Chantier[]>(MOCK_CHANTIERS);
  const [loading, setLoading]           = useState(true);

  usePageMeta({
    title: "Réalisations rénovation intérieure Jura (39) | ValM39",
    description: "Chantiers de rénovation dans le Jura : cuisines, parquets, cloisons, peinture. Photos avant/après par chantier. Artisan ValM39 certifié AFPIA.",
    canonical: "https://www.valm39.fr/realisations",
    ogUrl: "https://www.valm39.fr/realisations",
  });

  useEffect(() => {
    supabase
      .from("media_items")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .select("id, title, description, category, image_url, before_image_url, after_image_url, chantier_id, chantier_nom, chantier_description" as any)
      .contains("display_on", ["realisations"])
      .order("sort_order")
      .then(({ data }) => {
        if (data && data.length > 0) {
          const map = new Map<string, Chantier>();
          for (const item of data as any[]) {
            const img = item.image_url ?? item.after_image_url ?? item.before_image_url;
            if (!img) continue;
            const key = item.chantier_id ?? item.id;
            if (!map.has(key)) {
              map.set(key, {
                id: key,
                nom: item.chantier_nom ?? item.title ?? "Chantier",
                description: item.chantier_description ?? item.description ?? "",
                categorie: (item.category as Category) ?? "autres",
                photos: [],
              });
            }
            map.get(key)!.photos.push({
              id: item.id,
              title: item.title ?? "",
              description: item.description ?? "",
              displayImg: img,
            });
          }
          const grouped = Array.from(map.values());
          if (grouped.length > 0) setChantiers(grouped);
        }
        setLoading(false);
      });
  }, []);

  const filtered = activeFilter === "tout"
    ? chantiers
    : chantiers.filter(c => c.categorie === activeFilter);

  return (
    <Layout>
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 11, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <img src={heroRealisations} alt="Galerie rénovation intérieure ValM39 — Jura (39)" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/50 to-charcoal/20" />
        <motion.div className="absolute top-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
        <motion.div className="absolute bottom-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
        <div className="relative z-20 max-w-6xl mx-auto px-6 w-full">
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-2">
            {"Nos".split(" ").map((word, i) => (
              <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                <motion.span className="inline-block" initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95 + i * 0.1, type: "spring", stiffness: 120, damping: 14 }}>{word}</motion.span>
              </span>
            ))}
          </h1>
          <div className="overflow-hidden">
            <motion.span className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold italic text-olive-light leading-tight inline-block" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.2, type: "spring", stiffness: 90, damping: 14 }}>
              réalisations
            </motion.span>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28 lg:pb-32 bg-background">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="max-w-6xl mx-auto px-6">
          <div className="mb-12 text-center">
            <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-2">Chantier après chantier</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft mb-4">La finition qui fait la différence</motion.h2>
            <motion.p variants={fadeUp} className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Sélectionnez une catégorie puis cliquez sur un chantier pour parcourir toutes ses photos.
            </motion.p>
          </div>

          <motion.div variants={fadeUp} className="mb-14">
            <CategoryCarousel cards={CATEGORY_CARDS} onSelect={setActiveFilter} />
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="rounded-2xl bg-muted animate-pulse" style={{ aspectRatio: "1 / 1.618" }} />
                  <div className="mt-4 h-4 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="mt-2 h-3 w-full rounded bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground py-16">Aucune réalisation dans cette catégorie pour l'instant.</p>
          ) : (
            <motion.div key={activeFilter} initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-20 gap-y-20">
              {filtered.map(chantier => (
                <motion.div key={chantier.id} variants={fadeUp}>
                  <ChantierStack chantier={chantier} />
                </motion.div>
              ))}
            </motion.div>
          )}

          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.4, duration: 0.6 }} className="text-center text-muted-foreground/50 text-sm mt-14">
            Galerie enrichie régulièrement — nouvelles réalisations à venir
          </motion.p>
        </motion.div>
      </section>

      <section className="py-16 bg-card border-y border-border">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="max-w-5xl mx-auto px-6">
          <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-2 text-center">Votre profil</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft text-center mb-10">Une offre adaptée à vos objectifs</motion.h2>
          <div className="divide-y divide-border">
            {[
              { to: "/locations-saisonnieres", label: "Locations saisonnières",   desc: "Transformez votre Airbnb ou gîte en coup de cœur des voyageurs. +20 à +40 % sur votre nuitée." },
              { to: "/investisseurs",          label: "Investisseurs immobiliers", desc: "Maximisez la valeur locative et le prix de revente de votre patrimoine dans le Jura." },
              { to: "/agences-immobilieres",   label: "Agences immobilières",      desc: "Un artisan référent pour rénover les biens avant mise en vente. Délais courts, finitions irréprochables." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Link href={item.to} className="group flex items-center gap-8 sm:gap-16 py-8">
                  <span className="font-display font-bold text-primary/[0.18] select-none shrink-0 leading-none group-hover:text-primary/40 transition-colors duration-500" style={{ fontSize: "clamp(3.5rem, 7vw, 6rem)" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 sm:flex sm:items-center sm:gap-12">
                    <h3 className="font-display text-xl sm:text-2xl font-bold text-charcoal-soft sm:w-64 shrink-0 mb-1 sm:mb-0 group-hover:text-primary transition-colors duration-300">{item.label}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{item.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-primary/30 shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      <section id="contact" className="py-20 sm:py-28 lg:pb-32 bg-charcoal">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-2xl mx-auto px-6 text-center">
          <motion.p variants={fadeUp} className="text-olive-light font-display italic text-5xl mb-3">Votre projet</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">Notre prochaine réalisation</motion.h2>
          <motion.p variants={fadeUp} className="text-primary-foreground/70 mb-10 leading-relaxed">
            Cuisine, parquet, cloisons, peinture ou encore électricité<br />décrivez votre projet et recevez un devis gratuit sous 24h,<br />clair et sans engagement.
          </motion.p>
          <ContactForm source="realisations" />
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-foreground/50 text-sm">
            <span>Gratuit · Sans engagement · Réponse sous 24h</span>
            <span className="hidden sm:inline text-primary-foreground/20">|</span>
            <PhoneLink />
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}
