'use client';

import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

// ─── Dimensions ────────────────────────────────────────────────────────────────
const ZONE_W  = 100;
const TICK_W  = 20;
const UNIT    = ZONE_W + TICK_W;          // 120 px
const VISIBLE = 4 * TICK_W + 3 * ZONE_W; // 380 px

const centreX = (k: number) => UNIT * (1 - k);

// ─── Pages ─────────────────────────────────────────────────────────────────────
const PAGES = [
  { path: "/",                      label: "Accueil",      k: 1 },
  { path: "/realisations",          label: "Réalisations", k: 2 },
  { path: "/locations-saisonnieres",label: "Locations",    k: 3 },
  { path: "/investisseurs",         label: "Investisseurs",k: 4 },
  { path: "/agences-immobilieres",  label: "Agences",      k: 5 },
] as const;

// ─── Graduation millimètre ─────────────────────────────────────────────────────
const MM = [4, 4, 4, 4, 7, 4, 4, 4, 4];

// ─── Tick majeur ───────────────────────────────────────────────────────────────
function MajorTick({ num, highlight }: { num: number | null; highlight: boolean }) {
  return (
    <div style={{
      width: TICK_W, height: "100%", flexShrink: 0,
      position: "relative", display: "flex",
      justifyContent: "center", alignItems: "flex-start", paddingTop: 3,
    }}>
      <div style={{
        width:   highlight ? 2 : 1.5,
        height:  highlight ? 18 : 14,
        background: "hsl(32,18%,28%)",
        opacity: highlight ? 0.78 : 0.50,
        transition: "all 0.25s",
      }} />
      {num !== null && (
        <span style={{
          position: "absolute",
          top: highlight ? 25 : 20,
          fontFamily: "ui-monospace,'SF Mono',Consolas,monospace",
          fontSize: 8, lineHeight: 1,
          color:      highlight ? "hsl(32,12%,16%)" : "hsl(32,12%,55%)",
          fontWeight: highlight ? 600 : 400,
          opacity:    highlight ? 0.88 : 0.52,
          transition: "all 0.25s",
          userSelect: "none",
        }}>
          {num}
        </span>
      )}
    </div>
  );
}

// ─── Zone page ─────────────────────────────────────────────────────────────────
function SecZone({ label, active, onClick }: {
  label: string; active: boolean; onClick: () => void;
}) {
  return (
    <div style={{
      width: ZONE_W, height: "100%", flexShrink: 0,
      display: "flex", flexDirection: "column",
      alignItems: "center", paddingTop: 3, paddingBottom: 3,
    }}>
      <div style={{ display: "flex", width: "100%", justifyContent: "space-evenly", alignItems: "flex-start" }}>
        {MM.map((h, i) => (
          <div key={i} style={{
            width: 1, height: h,
            background: "hsl(32,18%,28%)",
            opacity: active ? (h === 7 ? 0.52 : 0.26) : (h === 7 ? 0.28 : 0.13),
            transition: "opacity 0.2s",
          }} />
        ))}
      </div>
      <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
        <button
          onClick={onClick}
          style={{
            fontFamily: "ui-monospace,'SF Mono',Consolas,monospace",
            fontSize: 9, letterSpacing: "0.09em",
            textTransform: "uppercase",
            fontWeight: active ? 700 : 400,
            color: active ? "hsl(32,10%,14%)" : "hsl(32,12%,52%)",
            background: "none", border: "none",
            cursor: "pointer", lineHeight: 1,
            padding: 0, transition: "color 0.2s",
            whiteSpace: "nowrap",
          }}
        >
          {label}
        </button>
      </div>
    </div>
  );
}

// ─── Zone buffer ───────────────────────────────────────────────────────────────
function BufZone() {
  return (
    <div style={{
      width: ZONE_W, height: "100%", flexShrink: 0,
      display: "flex", alignItems: "flex-start",
      justifyContent: "center", paddingTop: 3,
    }}>
      <div style={{ display: "flex", width: "100%", justifyContent: "space-evenly", alignItems: "flex-start" }}>
        {MM.map((h, i) => (
          <div key={i} style={{
            width: 1, height: h,
            background: "hsl(32,18%,28%)",
            opacity: h === 7 ? 0.18 : 0.09,
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export function RulerNav() {
  const pathname = usePathname();
  const router = useRouter();

  const activePage = PAGES.find(p => p.path === pathname) ?? PAGES[0];
  const activeIdx  = PAGES.indexOf(activePage);
  const k          = activePage.k;

  const canPrev = activeIdx > 0;
  const canNext = activeIdx < PAGES.length - 1;

  const goPrev = () => { if (canPrev) router.push(PAGES[activeIdx - 1].path); };
  const goNext = () => { if (canNext) router.push(PAGES[activeIdx + 1].path); };

  type El = { t: "tick"; num: number } | { t: "buf" } | { t: "page"; idx: number };
  const TAPE: El[] = [
    { t: "tick", num: 0 },
    { t: "buf" },
    { t: "tick", num: 1 },
    { t: "page", idx: 0 },
    { t: "tick", num: 2 },
    { t: "page", idx: 1 },
    { t: "tick", num: 3 },
    { t: "page", idx: 2 },
    { t: "tick", num: 4 },
    { t: "page", idx: 3 },
    { t: "tick", num: 5 },
    { t: "page", idx: 4 },
    { t: "tick", num: 6 },
    { t: "buf" },
    { t: "tick", num: 7 },
  ];

  const triBtn = (visible: boolean, side: "left" | "right"): React.CSSProperties => ({
    position: "absolute", top: 0, bottom: 0, [side]: 0,
    width: 22, display: "flex", alignItems: "center", justifyContent: "center",
    background: "none", border: "none",
    cursor: visible ? "pointer" : "default",
    padding: 0, opacity: visible ? 1 : 0,
    pointerEvents: visible ? "auto" : "none",
    transition: "opacity 0.25s ease", zIndex: 2,
  });

  return (
    <div style={{ position: "relative", width: VISIBLE, height: 42 }}>
      <div style={{
        width: VISIBLE, height: 42, overflow: "hidden",
        borderRadius: 3,
        background: "linear-gradient(180deg, hsl(44,42%,91%) 0%, hsl(42,36%,84%) 100%)",
        borderTop:    "1.5px solid hsl(34,22%,58%)",
        borderBottom: "1.5px solid hsl(34,22%,52%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.07), 0 2px 10px rgba(0,0,0,0.20), 0 1px 3px rgba(0,0,0,0.14)",
      }}>
        <motion.div
          style={{ display: "flex", height: "100%" }}
          animate={{ x: centreX(k) }}
          transition={{ type: "spring", stiffness: 220, damping: 30, mass: 0.7 }}
        >
          {TAPE.map((el, i) => {
            if (el.t === "tick") {
              const highlight = el.num === activePage.k;
              return <MajorTick key={i} num={el.num} highlight={highlight} />;
            }
            if (el.t === "page") {
              const page = PAGES[el.idx];
              return (
                <SecZone
                  key={i}
                  label={page.label}
                  active={pathname === page.path}
                  onClick={() => router.push(page.path)}
                />
              );
            }
            return <BufZone key={i} />;
          })}
        </motion.div>
      </div>

      <button style={triBtn(canPrev, "left")} onClick={goPrev} aria-label="Page précédente">
        <div style={{
          width: 0, height: 0,
          borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
          borderRight: "8px solid hsl(30,10%,22%)", opacity: 0.6,
        }} />
      </button>

      <button style={triBtn(canNext, "right")} onClick={goNext} aria-label="Page suivante">
        <div style={{
          width: 0, height: 0,
          borderTop: "5px solid transparent", borderBottom: "5px solid transparent",
          borderLeft: "8px solid hsl(30,10%,22%)", opacity: 0.6,
        }} />
      </button>
    </div>
  );
}
