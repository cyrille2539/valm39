'use client';

import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowRight, Award } from "lucide-react";
import { PhoneLink } from "@/components/PhoneLink";
import { ContactForm } from "@/components/ContactForm";
import { MobileMenu } from "@/components/MobileMenu";
import { ShinyButton } from "@/components/ui/shiny-button";
import Link from "next/link";
import AnimatedLogo from "@/components/AnimatedLogo";
import { RulerNav } from "@/components/RulerNav";
import SocialProofBar from "@/components/SocialProofBar";
import BeforeAfterGallery from "@/components/BeforeAfterSection";
import ServiceCard from "@/components/ServiceCard";
import { usePageMeta } from "@/hooks/usePageMeta";

const heroHome = "/assets/hero-home.jpg";
const heroRenovation = "/assets/hero-renovation.jpg";
const bgSection2 = "/assets/bg-section2.jpg";
const bgSection4 = "/assets/bg-section4.jpg";
const serviceCuisine = "/assets/service-cuisine.jpg";
const serviceParquet = "/assets/service-parquet.jpg";
const serviceCloisons = "/assets/service-cloisons.jpg";
const servicePeinture = "/assets/service-peinture.jpg";
const serviceElectricite = "/assets/service-electricite.jpg";
const solutionLocations = "/assets/solution-locations.jpg";
const solutionInvestisseurs = "/assets/solution-investisseurs.jpg";
const solutionAgences = "/assets/solution-agences.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } },
};

const SectionBg = ({ src, delay = 0 }: { src: string; delay?: number }) => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <motion.img
      src={src}
      className="w-full h-full object-cover grayscale"
      aria-hidden
      animate={{ opacity: [0.08, 0.25, 0.08] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }}
    />
    <motion.div
      className="absolute inset-0"
      style={{ background: "radial-gradient(ellipse at 60% 50%, rgba(212,192,165,0.26) 0%, transparent 70%)" }}
      animate={{ opacity: [0.15, 0.9, 0.15] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay }}
    />
  </div>
);

const services = [
  {
    title: "Pose de cuisine",
    desc: "Installation complète sur mesure ou en kit, raccordements et finitions soignées. Un espace fonctionnel et esthétique pensé pour durer.",
    stat: "Sur mesure",
    gradient: "linear-gradient(135deg, #2a1f14 0%, #4a3520 40%, #6b5a3e 70%, #8c7355 100%)",
    accentColor: "#c8a96e",
    image: serviceCuisine,
  },
  {
    title: "Pose de parquet",
    desc: "Massif, contrecollé ou stratifié — posé avec précision pour un sol chaleureux et résistant. Chêne, noyer, ou essence de votre choix.",
    stat: "Massif · Stratifié",
    gradient: "linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 40%, #4a6b4a 70%, #6b8c5a 100%)",
    accentColor: "#8aad6e",
    image: serviceParquet,
  },
  {
    title: "Pose de cloisons",
    desc: "Placo, ossature bois ou métal. Isolation phonique et thermique intégrée pour redistribuer vos espaces intelligemment.",
    stat: "Isolant · Rapide",
    gradient: "linear-gradient(135deg, #1a1a2a 0%, #2d2d4a 40%, #3d3d5c 70%, #5c5c7a 100%)",
    accentColor: "#8e8ec8",
    image: serviceCloisons,
  },
  {
    title: "Peinture intérieure",
    desc: "Préparation minutieuse des surfaces et application soignée. Mate, satinée ou laquée pour un rendu impeccable.",
    stat: "Mate · Satinée · Laquée",
    gradient: "linear-gradient(135deg, #2a1a1a 0%, #4a2d2d 40%, #6b4040 70%, #8c5555 100%)",
    accentColor: "#c87878",
    image: servicePeinture,
  },
  {
    title: "Électricité",
    desc: "Mise aux normes, création de circuits, pose de prises et luminaires. Travaux réalisés en coordination avec vos autres chantiers.",
    stat: "Normes NF C 15-100",
    gradient: "linear-gradient(135deg, #1a1a08 0%, #2e2e10 40%, #4a4a1a 70%, #6b6b28 100%)",
    accentColor: "#d4c84e",
    image: serviceElectricite,
  },
];

export default function Home() {
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const [hoveredSolution, setHoveredSolution] = useState<number | null>(null);

  usePageMeta({
    title: "ValM39 — Artisan rénovation intérieure dans le Jura (39)",
    description: "Artisan rénovation intérieure dans le Jura (39). Cuisine, parquet, cloisons, peinture — finitions exemplaires, devis transparent. Réponse sous 24h.",
    canonical: "https://www.valm39.fr/",
    ogUrl: "https://www.valm39.fr/",
  });

  return (
    <div className="min-h-screen bg-background font-body">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border overflow-visible">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between overflow-visible">
          <AnimatedLogo />
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

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.18 }}
          animate={{ scale: 1 }}
          transition={{ duration: 11, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <img
            src={heroHome}
            alt="Rénovation intérieure par ValM39 – cuisine, parquet et peinture"
            className="w-full h-full object-cover object-center"
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-charcoal/85 via-charcoal/60 to-charcoal/30 sm:to-transparent" />
        <motion.div
          className="absolute top-0 left-0 right-0 bg-charcoal z-10"
          initial={{ height: "50%" }}
          animate={{ height: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-charcoal z-10"
          initial={{ height: "50%" }}
          animate={{ height: 0 }}
          transition={{ delay: 0.1, duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        />
        <motion.div
          className="absolute inset-0 z-[5] pointer-events-none"
          style={{
            background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.06) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPosition: "-100% 0" }}
          animate={{ backgroundPosition: "200% 0" }}
          transition={{ delay: 1.0, duration: 1.2, ease: "easeInOut" }}
        />

        <div className="relative z-20 max-w-6xl mx-auto px-6 py-10 sm:py-20 w-full">
          <div className="max-w-2xl text-center mx-auto">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight mb-4">
              {"La qualité de finition".split(" ").map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.25em]">
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.95 + i * 0.08, type: "spring", stiffness: 120, damping: 14 }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>
            <div className="overflow-hidden mb-8">
              <motion.span
                className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold italic text-olive-light leading-tight inline-block"
                initial={{ x: -60, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.35, type: "spring", stiffness: 90, damping: 14 }}
              >
                qui fait la différence
              </motion.span>
            </div>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.55, duration: 0.6, ease: "easeOut" }}
              className="text-lg sm:text-xl text-primary-foreground/80 mb-10 leading-relaxed"
            >
              Cuisine, parquet, cloisons, peinture<br className="hidden sm:block" />Des travaux réalisés avec soin pour un intérieur qui vous ressemble.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.75, type: "spring", stiffness: 200, damping: 20 }}
              className="flex justify-center"
            >
              <ShinyButton href="#services" size="lg" variant="light">
                Découvrir nos prestations <ArrowRight className="h-5 w-5" />
              </ShinyButton>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF BAR */}
      <SocialProofBar />

      {/* SERVICES */}
      <section id="services" className="relative py-20 sm:py-28 bg-background">
        <SectionBg src={bgSection2} delay={0} />
        <div className="relative z-10 max-w-6xl mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="mb-14"
          >
            <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-3 text-center">
              Nos savoir-faire
            </motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft text-center mb-4">
              Des prestations de qualité artisanale
            </motion.h2>
            <motion.p variants={fadeUp} className="text-center text-muted-foreground max-w-2xl mx-auto leading-relaxed text-base sm:text-lg">
              Chaque chantier est traité avec le même souci du détail et de la finition.
            </motion.p>
          </motion.div>

          <div className="hidden lg:flex gap-3">
            {services.map((service, i) => (
              <ServiceCard
                key={i}
                index={i}
                title={service.title}
                description={service.desc}
                stat={service.stat}
                gradient={service.gradient}
                accentColor={service.accentColor}
                image={service.image}
                isExpanded={hoveredService === i}
                isAnyHovered={hoveredService !== null}
                onMouseEnter={() => setHoveredService(i)}
                onMouseLeave={() => setHoveredService(null)}
              />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4 lg:hidden">
            {services.map((service, i) => (
              <ServiceCard
                key={i}
                index={i}
                title={service.title}
                description={service.desc}
                stat={service.stat}
                gradient={service.gradient}
                accentColor={service.accentColor}
                image={service.image}
                isExpanded={false}
                isAnyHovered={false}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
              />
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-10 flex justify-center"
          >
            <span className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-primary/30 bg-primary/5 font-display font-bold text-charcoal-soft text-base sm:text-lg">
              <Award className="h-4 w-4 text-primary shrink-0" />
              Certification AFPIA · Poseur agenceur de cuisine
            </span>
          </motion.div>
        </div>
      </section>

      {/* GALERIE AVANT / APRÈS */}
      <BeforeAfterGallery />

      {/* POURQUOI VALM39 */}
      <section id="pourquoi" className="relative py-20 sm:py-28 bg-background border-y border-border overflow-hidden">
        <SectionBg src={bgSection4} delay={2} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 max-w-5xl mx-auto px-6"
        >
          <div className="mb-16 text-center">
            <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-2">Notre engagement</motion.p>
            <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft">
              Pourquoi choisir ValM39 ?
            </motion.h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { title: "Finition exemplaire", desc: "Chaque détail compte. Nous ne quittons pas un chantier tant que le résultat n'est pas irréprochable." },
              { title: "Devis transparent", desc: "Pas de mauvaise surprise. Un prix fixe, clair et détaillé avant le début des travaux." },
              { title: "Délais respectés", desc: "Un planning précis, une communication régulière, et des travaux livrés dans les temps." },
            ].map((item, i) => (
              <motion.div key={i} variants={fadeUp} className="group flex items-center gap-8 sm:gap-16 py-10 sm:py-12">
                <span
                  className="font-display font-bold text-primary/[0.18] select-none shrink-0 leading-none group-hover:text-primary/40 transition-colors duration-500"
                  style={{ fontSize: "clamp(5rem, 10vw, 8rem)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex-1 sm:flex sm:items-center sm:gap-16">
                  <h3 className="font-display text-2xl sm:text-3xl font-bold text-charcoal-soft sm:w-64 shrink-0 mb-3 sm:mb-0">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base sm:text-lg">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* NOS SOLUTIONS PAR PROFIL */}
      <section id="solutions" className="relative py-20 sm:py-28 bg-card border-y border-border">
        <SectionBg src={solutionLocations} delay={4} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="relative z-10 max-w-5xl mx-auto px-6"
        >
          <motion.p variants={fadeUp} className="text-primary font-display italic text-5xl mb-3 text-center">Des solutions adaptées</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-charcoal-soft text-center mb-4">
            Quel que soit votre projet, nous avons la réponse
          </motion.h2>
          <motion.p variants={fadeUp} className="text-center text-muted-foreground max-w-2xl mx-auto mb-14 leading-relaxed">
            Particulier, professionnel ou investisseur — nous adaptons notre accompagnement à vos objectifs.
          </motion.p>
          <div className="hidden lg:flex gap-3">
            {[
              { title: "Locations saisonnières", desc: "Transformez votre Airbnb en coup de cœur des voyageurs. +20 à +40 % sur votre tarif à la nuitée.", stat: "Airbnb · Gîtes", gradient: "linear-gradient(135deg, #2a1a0a 0%, #4a3010 40%, #6b4f28 70%, #8c6e45 100%)", accentColor: "#d4a96e", image: solutionLocations, to: "/locations-saisonnieres" },
              { title: "Investisseurs immobiliers", desc: "Maximisez le rendement de votre patrimoine grâce à une rénovation ciblée et rentable.", stat: "ROI · Patrimoine", gradient: "linear-gradient(135deg, #0a1a2a 0%, #103050 40%, #1a4a6b 70%, #2a6080 100%)", accentColor: "#6eb4d4", image: solutionInvestisseurs, to: "/investisseurs" },
              { title: "Agences immobilières", desc: "Accélérez vos ventes avec des biens rénovés qui séduisent dès la première visite.", stat: "Vente · Valorisation", gradient: "linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 40%, #2d5a2d 70%, #3d7a3d 100%)", accentColor: "#8ab86e", image: solutionAgences, to: "/agences-immobilieres" },
            ].map((item, i) => (
              <ServiceCard
                key={i}
                index={i}
                title={item.title}
                description={item.desc}
                stat={item.stat}
                gradient={item.gradient}
                accentColor={item.accentColor}
                image={item.image}
                to={item.to}
                ctaLabel="Découvrir"
                isExpanded={hoveredSolution === i}
                isAnyHovered={hoveredSolution !== null}
                onMouseEnter={() => setHoveredSolution(i)}
                onMouseLeave={() => setHoveredSolution(null)}
              />
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:hidden">
            {[
              { title: "Locations saisonnières", desc: "Transformez votre Airbnb en coup de cœur des voyageurs. +20 à +40 % sur votre tarif à la nuitée.", stat: "Airbnb · Gîtes", gradient: "linear-gradient(135deg, #2a1a0a 0%, #4a3010 40%, #6b4f28 70%, #8c6e45 100%)", accentColor: "#d4a96e", image: solutionLocations, to: "/locations-saisonnieres" },
              { title: "Investisseurs immobiliers", desc: "Maximisez le rendement de votre patrimoine grâce à une rénovation ciblée et rentable.", stat: "ROI · Patrimoine", gradient: "linear-gradient(135deg, #0a1a2a 0%, #103050 40%, #1a4a6b 70%, #2a6080 100%)", accentColor: "#6eb4d4", image: solutionInvestisseurs, to: "/investisseurs" },
              { title: "Agences immobilières", desc: "Accélérez vos ventes avec des biens rénovés qui séduisent dès la première visite.", stat: "Vente · Valorisation", gradient: "linear-gradient(135deg, #0a1f0a 0%, #1a3a1a 40%, #2d5a2d 70%, #3d7a3d 100%)", accentColor: "#8ab86e", image: solutionAgences, to: "/agences-immobilieres" },
            ].map((item, i) => (
              <ServiceCard
                key={i}
                index={i}
                title={item.title}
                description={item.desc}
                stat={item.stat}
                gradient={item.gradient}
                accentColor={item.accentColor}
                image={item.image}
                to={item.to}
                ctaLabel="Découvrir"
                isExpanded={false}
                isAnyHovered={false}
                onMouseEnter={() => {}}
                onMouseLeave={() => {}}
              />
            ))}
          </div>
        </motion.div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 sm:py-28 lg:pb-32 bg-charcoal">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-2xl mx-auto px-6 text-center"
        >
          <motion.p variants={fadeUp} className="text-olive-light font-display italic text-5xl mb-3">Parlons de votre projet</motion.p>
          <motion.h2 variants={fadeUp} className="font-display text-3xl sm:text-4xl font-bold text-primary-foreground mb-6">
            Demandez votre devis gratuit
          </motion.h2>
          <motion.p variants={fadeUp} className="text-primary-foreground/70 mb-10 leading-relaxed text-base sm:text-lg">
            Décrivez-nous votre projet et nous vous recontactons sous 24h pour un devis personnalisé, gratuit et sans engagement.
          </motion.p>
          <ContactForm source="accueil" />
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4 text-primary-foreground/50 text-sm">
            <span>Gratuit · Sans engagement · Réponse sous 24h</span>
            <span className="hidden sm:inline text-primary-foreground/20">|</span>
            <PhoneLink />
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="pt-6 pb-[calc(1.5rem+4rem+env(safe-area-inset-bottom,0px))] lg:py-6 bg-charcoal border-t border-primary-foreground/10 lg:fixed lg:bottom-0 lg:left-0 lg:right-0 lg:z-40">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold text-primary-foreground/80">
              Val<span className="text-primary">M39</span>
            </span>
            <span className="text-[10px] text-primary-foreground/30 tracking-wide">Lot la Combale, 39200 Saint-Claude</span>
            <span className="text-[10px] text-primary-foreground/30 tracking-wide">SIRET 101 461 598 00019</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-primary-foreground/40">
            <Link href="/locations-saisonnieres" className="hover:text-primary transition-colors">Locations saisonnières</Link>
            <Link href="/investisseurs" className="hover:text-primary transition-colors">Investisseurs</Link>
            <Link href="/agences-immobilieres" className="hover:text-primary transition-colors">Agences</Link>
            <Link href="/realisations" className="hover:text-primary transition-colors">Réalisations</Link>
            <span>© 2025 ValM39</span>
          </div>
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
