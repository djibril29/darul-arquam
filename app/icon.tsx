import { ImageResponse } from "next/og";
import { BRAND_GRADIENT, BRAND_GOLD, MOON_STAR_PATHS } from "@/lib/og/brand-icon";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BRAND_GRADIENT,
          borderRadius: 7,
        }}
      >
        <svg
          width={20}
          height={20}
          viewBox="0 0 24 24"
          fill="none"
          stroke={BRAND_GOLD}
          strokeWidth={2.4}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {MOON_STAR_PATHS.map((d) => (
            <path key={d} d={d} />
          ))}
        </svg>
      </div>
    ),
    { ...size }
  );
}
