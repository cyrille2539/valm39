'use client';

import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { PhoneLink } from "@/components/PhoneLink";
import { Input } from "@/components/ui/input";
import { ShinyButton } from "@/components/ui/shiny-button";
import { Layout } from "@/components/Layout";
import { usePageMeta } from "@/hooks/usePageMeta";
import { HorizontalScrollCards } from "@/components/HorizontalScrollCards";
import { ContactForm } from "@/components/ContactForm";
import { VerticalCarousel } from "@/components/VerticalCarousel";

const heroImage = "/assets/hero-renovation.jpg";
const beforeAfterImage = "/assets/avant-apres-locations.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

export default function CoupDeCoeur() {
  usePageMeta({
    title: "Rénovation Airbnb & Gîtes dans le Jura — ValM39",
    description: "Transformez votre location saisonnière en coup de cœur des voyageurs. +20 à +40 % sur votre tarif à la nuitée. ROI en 3 à 6 mois. Artisan ValM39, Jura (39).",
    canonical: "https://www.valm39.fr/locations-saisonnieres",
    ogUrl: "https://www.valm39.fr/locations-saisonnieres",
  });

  return (
    <Layout>
      {/* 1. HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div className="absolute inset-0" initial={{ scale: 1.18 }} animate={{ scale: 1 }} transition={{ duration: 11, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <img src={heroImage} alt="Intérieur rénové par valM39 – cuisine moderne avec parquet chêne" className="w-full h-full object-cover" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/60 to-transparent" />
        <motion.div className="absolute top-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />
        <motion.div className="absolute bottom-0 left-0 right-0 bg-charcoal z-10" initial={{ height: "50%" }} animate={{ height: 0 }} transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }} />

        <div className="relative z-20 max-w-6xl mx-auto px-6 py-20">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-2">
              <div>
                <span className="inline-block overflow-hidden mr-[0.25em]">
                  <motion.span className="inline-block" initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.95, type: "spring", stiffness: 120, damping: 14 }}>
                    Transformez
                  </motion.span>
                </span>
              </div>
              <div>
                {"votre location saisonnière en".split(" ").map((word, i) => (
                  <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                    <motion.span className="inline-block" initial={{ y: "110%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.05 + i * 0.07, type: "spring", stiffness: 120, damping: 14 }}>
                      {word}
                    </motion.span>
                  </span>
                ))}
              </div>
            </h1>
            <div className="overflow-hidden mb-6">
              <motion.span className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold italic text-olive-light leading-tight inline-block" initial={{ x: -60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5, type: "spring", stiffness: 90, damping: 14 }}>
                coup de cœur des voyageurs
              </motion.span>
            </div>
            <motion.p initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.65, duration: 0.6 }} className="text-lg sm:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Un intérieur « Instagrammable » qui justifie +20 à +40 % sur votre prix à la nuitée<br />avec un retour sur investissement en 3 à 6 mois.
            </motion.p>
            <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.8, type: "spring", stiffness: 200, damping: 20 }} className="flex flex-col sm:flex-row gap-4 mb-10">
              <ShinyButton href="#contact" size="lg" variant="light">
                Demandez une visite <ArrowRight className="h-5 w-5" />
              </ShinyButton>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.0, duration: 0.6 }} className="space-y-2">
              {[
                "Propriétaires Airbnb qui veulent augmenter leur tarif à la nuitée",
                "Gérants de gîtes lassés des avis moyens et du calendrier vide",
                "Investisseurs locatifs qui veulent maximiser leur rendement",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="font-display font-bold text-primary/50 text-sm shrink-0 w-6">—</span>
                  <span className="text-primary-foreground/90 text-sm sm:text-base">{item}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. PROBLÈMES */}
      <HorizontalScrollCards
        eyebrow="Ce que vous vivez en ce moment"
        title="Vous reconnaissez-vous ?"
        bg="bg-card"
        items={[
          "Votre annonce stagne à 3-4 étoiles\net vous voyez des logements moins bien situés afficher complet…",
          "Votre prix à la nuitée est plafonné :\nimpossible d'augmenter sans perdre des réservations.",
          "Vos photos ne déclenchent pas le « coup de cœur »\nles voyageurs scrollent sans cliquer.",
          "Vous passez un temps fou à gérer les réclamations,\nles petites réparations et le turnover.",
          "Vous hésitez à investir dans la rénovation :\n« est-ce que ça vaut vraiment le coup ? »",
        ]}
      />

      {/* 3. TRANSFORMATION */}
      <section className="py-20 sm:py-28 bg-background">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-3">Ce que vous souhaitez</motion.p>
              <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                <span style={{ wordSpacing: "-0.08em" }}>Un intérieur qui travaille <span className="italic text-primary">pour vous</span></span>
              </motion.h2>
              <div className="divide-y divide-border mt-2">
                {[
                  "+20 à +40 % sur votre tarif à la nuitée dès la remise en ligne",
                  "Taux d'occupation en hausse grâce aux avis 5★ et aux photos qui séduisent",
                  "ROI de votre investissement en 3 à 6 mois",
                  "Moins de réclamations et de gestion grâce à des matériaux durables",
                  "Patrimoine valorisé : +10 à +20 % à la revente",
                ].map((item, i) => (
                  <motion.div key={i} variants={fadeUp} className="group flex items-center gap-5 py-4">
                    <span className="font-display font-bold text-primary/25 select-none shrink-0 text-2xl group-hover:text-primary/60 transition-colors duration-300">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-foreground/85 leading-relaxed">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div variants={fadeUp} className="relative">
              <img src={beforeAfterImage} alt="Avant / Après – Rénovation cuisine par valM39" className="rounded-2xl shadow-2xl w-full" />
              {/* Labels Avant / Après */}
              <div className="absolute top-3 left-3 bg-charcoal/70 backdrop-blur-sm text-primary-foreground text-xs font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">Avant</div>
              <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground text-xs font-display font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg">Après</div>
              <div className="absolute -bottom-4 -right-4 bg-primary text-primary-foreground rounded-xl px-5 py-3 shadow-lg">
                <p className="font-display font-bold text-lg">+40 %</p>
                <p className="text-xs opacity-80">revenu / nuitée</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* 4. ACCOMPAGNEMENT */}
      <VerticalCarousel
        eyebrow="Notre accompagnement"
        title="Comment nous transformons votre bien"
        bg="bg-card"
        itemHeight={140}
        items={[
          { title: "Estimation",           desc: "Visite du site : nous analysons votre bien et définissons ensemble un plan de transformation." },
          { title: "La métamorphose",     desc: "Cuisine, sols, peinture, cloisons — nous réalisons les travaux avec des matériaux durables et une finition exemplaire." },
          { title: "Finitions & contrôle", desc: "Vérification et ajustement si nécessaire pour un résultat irréprochable." },
          { title: "Prêt à séduire",      desc: "Un nouvel intérieur pour optimiser votre annonce et déclencher des réservations." },
        ]}
      />

      {/* 6. CTA FINAL */}
      <section id="contact" className="py-20 sm:py-28 lg:pb-32 bg-charcoal">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={stagger} className="max-w-2xl mx-auto px-6 text-center">
          <motion.p variants={fadeUp} className="text-olive-light font-display italic text-5xl mb-3">Prêt à transformer votre bien ?</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">Votre location 2.0 vous attend</motion.h2>
          <motion.p variants={fadeUp} className="text-primary-foreground/70 mb-10 leading-relaxed">
            Laissez-nous vos coordonnées et nous vous recontactons sous 24h<br />pour planifier votre estimation gratuite.
          </motion.p>
          <ContactForm source="locations" ctaLabel="C'est parti" />
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-6 text-primary-foreground/60 text-sm">
            <PhoneLink />
            <span className="hidden sm:inline text-primary-foreground/20">|</span>
            <span>Audit gratuit · Sans engagement</span>
          </motion.div>
        </motion.div>
      </section>
    </Layout>
  );
}
