import { ImageResponse } from "next/og";

/** Shared OG / Twitter size — 1.91:1, safe for FB / LinkedIn / X. */
export const OG_SIZE = { width: 1200, height: 630 } as const;

export const OG_CONTENT_TYPE = "image/png";

export const OG_ALT =
  "iPartner — put your brand where the category already lives. Category sponsorship across the network.";

/**
 * Warm marketplace OG art using Andre-era --ipp-* tokens (hex).
 * Do not invent a new palette — matches globals.css.
 *
 * Satori rule: any element with more than one child needs display:flex|contents|none.
 */
const IPP = {
  primary: "#223843",
  secondary: "#476a78",
  accent: "#8bc53f",
  bg: "#f9f7f5",
  text: "#0f172a",
  mist: "#c5ced4",
  cream: "#efecea",
} as const;

/**
 * Generate the root social share image.
 * Composition: brand first, one headline, one short line, accent — safe crop margins.
 */
export function renderOgBrandImage(): ImageResponse {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 72px",
        background: `linear-gradient(165deg, ${IPP.mist} 0%, ${IPP.cream} 42%, ${IPP.bg} 100%)`,
        color: IPP.text,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      {/* Top row — brand + tier cue */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: IPP.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 800,
              color: IPP.text,
              letterSpacing: "-0.04em",
              marginRight: 16,
            }}
          >
            i
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 40,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: IPP.text,
            }}
          >
            iPartner
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.72)",
            border: `2px solid ${IPP.accent}`,
            fontSize: 18,
            fontWeight: 700,
            color: IPP.primary,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Sponsorship
        </div>
      </div>

      {/* Hero copy — large, few words, center-weighted for crop safety */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: 980,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            fontSize: 58,
            fontWeight: 800,
            letterSpacing: "-0.035em",
            lineHeight: 1.1,
            color: IPP.text,
          }}
        >
          <span style={{ display: "flex" }}>
            Put your brand where the&nbsp;
          </span>
          <span style={{ display: "flex", color: IPP.accent }}>category</span>
          <span style={{ display: "flex" }}>&nbsp;already lives.</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 26,
            fontWeight: 500,
            lineHeight: 1.35,
            color: IPP.secondary,
            maxWidth: 820,
          }}
        >
          Category placement across the network — Bronze, Silver, or Gold.
        </div>
      </div>

      {/* Footer strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 22,
            fontWeight: 600,
            color: IPP.primary,
          }}
        >
          <span style={{ display: "flex" }}>ipartner.com</span>
          <span
            style={{
              display: "flex",
              color: IPP.accent,
              fontWeight: 800,
              marginLeft: 12,
              marginRight: 12,
            }}
          >
            ·
          </span>
          <span
            style={{
              display: "flex",
              color: IPP.secondary,
              fontWeight: 500,
            }}
          >
            Partner on premium domains
          </span>
        </div>
        <div
          style={{
            display: "flex",
            width: 160,
            height: 8,
            borderRadius: 999,
            background: IPP.accent,
          }}
        />
      </div>
    </div>,
    {
      ...OG_SIZE,
    },
  );
}
