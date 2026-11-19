import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0A08",
          color: "#C6A664",
          fontSize: 64,
          fontWeight: 600,
          letterSpacing: "0.08em",
          border: "2px solid #221E18",
        }}
      >
        PS
      </div>
    ),
    { ...size }
  );
}