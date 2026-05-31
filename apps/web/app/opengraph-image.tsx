import { ImageResponse } from "next/og";

export const alt = "cleaners — vertrouwensplatform voor schoonmaak in Amsterdam";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** OG image de marca (Stitch): blanco, acento azul, wordmark + tagline. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#ffffff",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top: wordmark */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: "#0a0a0a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 18, height: 18, background: "#0066ff", borderRadius: 4, transform: "rotate(45deg)" }} />
          </div>
          <div style={{ fontSize: 34, fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.02em" }}>cleaners</div>
        </div>

        {/* middle: tagline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", gap: 20, fontSize: 78, fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.035em" }}>
            <span style={{ color: "#0a0a0a" }}>Jij</span>
            <span style={{ color: "#0066ff" }}>kiest</span>
            <span style={{ color: "#0a0a0a" }}>wie jouw</span>
          </div>
          <div style={{ display: "flex", fontSize: 78, fontWeight: 800, color: "#0a0a0a", lineHeight: 1.05, letterSpacing: "-0.035em" }}>
            huis binnenkomt.
          </div>
          <div style={{ fontSize: 30, color: "#6b7280", marginTop: 24 }}>
            Geverifieerde schoonmakers in Amsterdam · veilig betalen
          </div>
        </div>

        {/* bottom: trust strip */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ height: 8, width: 8, borderRadius: 8, background: "#0066ff" }} />
          <div style={{ fontSize: 24, fontWeight: 600, color: "#4b5563", letterSpacing: "0.06em" }}>
            VERTROUWENSPLATFORM · GETCLEANERS.NL
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
