import {
  OG_ALT,
  OG_CONTENT_TYPE,
  OG_SIZE,
  renderOgBrandImage,
} from "@/lib/og-brand-image";

export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Root Twitter / X card image — same brand art as Open Graph (IP-S4). */
export default function Image() {
  return renderOgBrandImage();
}
