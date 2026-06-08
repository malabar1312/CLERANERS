import { ImageResponse } from "next/og";
import { getCleanerProfileById } from "@/lib/data/cleaners";

export const alt = "Cleaner profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function CleanerOG({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profile = await getCleanerProfileById(id);
  if (!profile) {
    return new ImageResponse(
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0a0a0a", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 40 }}>
        cleaners
      </div>,
      { ...size },
    );
  }

  const initials = profile.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0e1015",
          padding: "60px 72px",
          fontFamily: "sans-serif",
          color: "#ffffff",
        }}
      >
        {/* Top: brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 16, height: 16, background: "#0066ff", borderRadius: 4, transform: "rotate(45deg)" }} />
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em" }}>cleaners</div>
        </div>

        {/* Middle: profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              background: "#0066ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
              fontWeight: 800,
              color: "#ffffff",
            }}
          >
            {initials}
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 56, fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
              {profile.name}
            </div>
            <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 24, color: "#9ca3af" }}>
              <span>★ {profile.rating.toFixed(1)}</span>
              <span>·</span>
              <span>{profile.hood}</span>
              <span>·</span>
              <span>€{profile.pricePerHour}/u</span>
            </div>
          </div>
        </div>

        {/* Bottom: trust */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ height: 8, width: 8, borderRadius: 8, background: "#0066ff" }} />
          <div style={{ fontSize: 20, fontWeight: 600, color: "#6b7280", letterSpacing: "0.05em" }}>
            GEVERIFIEERD · VERZEKERD · GETCLEANERS.NL
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
