import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgBrandImage,
} from "@/lib/og-brand-image";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Root Open Graph image — Next.js file convention (IP-S4). */
export default function Image() {
  return renderOgBrandImage();
}
