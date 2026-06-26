import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/og/brand-icon";

export async function GET() {
  return new ImageResponse(<BrandMark size={192} radius={42} />, {
    width: 192,
    height: 192,
  });
}
