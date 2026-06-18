import { ImageResponse } from "next/og";
import { BRAND_GRADIENT, BRAND_GOLD, MOON_STAR_PATHS } from "@/lib/og/brand-icon";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Darul Arqam — Lecture et analyse numérique du Coran";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_GRADIENT,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: 420,
            height: 420,
            borderRadius: "50%",
            border: `2px solid ${BRAND_GOLD}`,
            opacity: 0.15,
            top: -160,
            right: -120,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 260,
            height: 260,
            borderRadius: "50%",
            border: `2px solid ${BRAND_GOLD}`,
            opacity: 0.15,
            bottom: -110,
            left: -80,
            display: "flex",
          }}
        />

        <div
          style={{
            width: 150,
            height: 150,
            borderRadius: 32,
            background: "rgba(255,255,255,0.15)",
            border: `2px solid ${BRAND_GOLD}80`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width={84}
            height={84}
            viewBox="0 0 24 24"
            fill="none"
            stroke={BRAND_GOLD}
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {MOON_STAR_PATHS.map((d) => (
              <path key={d} d={d} />
            ))}
          </svg>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 76,
            fontWeight: 700,
            color: "#FFFFFF",
            marginTop: 36,
          }}
        >
          Darul Arqam
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "rgba(255,255,255,0.75)",
            marginTop: 14,
          }}
        >
          Lecture &amp; analyse numérique du Coran
        </div>
      </div>
    ),
    { ...size }
  );
}
