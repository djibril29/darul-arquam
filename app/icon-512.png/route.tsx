import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/og/brand-icon";

export async function GET() {
  return new ImageResponse(<BrandMark size={512} radius={112} />, {
    width: 512,
    height: 512,
  });
}
