import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import path from "path";

export const alt = "ValM39 — Artisan rénovation intérieure dans le Jura (39)";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const logoBuffer = readFileSync(
    path.join(process.cwd(), "public/assets/logo-valm391.png")
  );
  const logoSrc = `data:image/png;base64,${logoBuffer.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          alignItems: "center",
          background: "linear-gradient(135deg, #1e1c1a 0%, #2e2a27 100%)",
          padding: "0 80px 0 86px",
          gap: "64px",
          position: "relative",
        }}
      >
        {/* Barre accent verte */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "6px",
            background: "linear-gradient(to bottom, #6b8f3a, #4a6628)",
          }}
        />

        {/* Logo */}
        <img
          src={logoSrc}
          width={210}
          height={210}
          style={{ borderRadius: "50%", flexShrink: 0 }}
        />

        {/* Séparateur vertical */}
        <div
          style={{
            width: "1px",
            height: "220px",
            background: "rgba(255,255,255,0.12)",
            flexShrink: 0,
          }}
        />

        {/* Texte */}
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <span
            style={{
              color: "#7fa845",
              fontSize: "26px",
              fontStyle: "italic",
              fontFamily: "Georgia, serif",
              letterSpacing: "0.03em",
            }}
          >
            Artisan rénovation intérieure
          </span>
          <span
            style={{
              color: "#f0ece4",
              fontSize: "100px",
              fontWeight: "700",
              fontFamily: "Georgia, serif",
              lineHeight: 1,
              letterSpacing: "-0.02em",
            }}
          >
            ValM39
          </span>
          <span
            style={{
              color: "#8a8480",
              fontSize: "30px",
              fontFamily: "Georgia, serif",
              marginTop: "10px",
              letterSpacing: "0.02em",
            }}
          >
            Cuisine · Parquet · Cloisons · Peinture
          </span>
          <span
            style={{
              color: "#7fa845",
              fontSize: "24px",
              fontFamily: "Georgia, serif",
              marginTop: "6px",
            }}
          >
            Jura (39) — Devis gratuit sous 24h
          </span>
        </div>
      </div>
    ),
    { ...size }
  );
}
