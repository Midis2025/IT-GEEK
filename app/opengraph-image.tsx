import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "ITGeek — Microsoft 365 & antivirus experts who fix it fast";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  // Official logo (unaltered) on its original white background.
  const logo = await readFile(join(process.cwd(), "public/brand/itgeek-logo.jpeg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "radial-gradient(circle at 90% 0%, rgba(11,99,229,0.6), transparent 55%), #071330",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={243} height={100} alt="" style={{ borderRadius: 12 }} />
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexWrap: "wrap", fontSize: 76, fontWeight: 800, lineHeight: 1.1, letterSpacing: -2 }}>
            <span>Microsoft 365 & antivirus experts who&nbsp;</span>
            <span style={{ color: "#22C55E" }}>fix it fast.</span>
          </div>
          <div style={{ fontSize: 30, color: "#A9B8D6" }}>Australian remote IT support · No fix, no pay</div>
        </div>
      </div>
    ),
    size,
  );
}
