import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 28,
          fontWeight: 600,
          letterSpacing: "0.08em",
        }}
      >
        PS
      </div>
    ),
    { ...size }
  );
}