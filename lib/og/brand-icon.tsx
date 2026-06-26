export const BRAND_GRADIENT = "linear-gradient(160deg, #0B6B3A 0%, #0F8A5F 100%)";
export const BRAND_GOLD = "#D6A33D";
export const BRAND_CREAM = "#F8F5EC";

/** Tracé exact de l'icône lucide "moon-star", déjà utilisée comme marque Darul Arqam sur login/register. */
export const MOON_STAR_PATHS = [
  "M18 5h4",
  "M20 3v4",
  "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401",
];

/** Marque Darul Arqam (dégradé + lune/étoile) utilisée par toutes les icônes générées via next/og (favicon, apple-icon, icônes de manifest PWA). */
export function BrandMark({ size, radius = 0 }: { size: number; radius?: number }) {
  const innerSize = Math.round(size * 0.6);
  const strokeWidth = size <= 40 ? 2.4 : 2;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: BRAND_GRADIENT,
        borderRadius: radius,
      }}
    >
      <svg
        width={innerSize}
        height={innerSize}
        viewBox="0 0 24 24"
        fill="none"
        stroke={BRAND_GOLD}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {MOON_STAR_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </svg>
    </div>
  );
}
