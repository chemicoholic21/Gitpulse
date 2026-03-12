import { ImageResponse } from "next/og";
import { db } from "@/lib/db";
import { leaderboard } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { deriveExperienceLevel } from "@/lib/scoring";

export const runtime = "edge";
export const alt = "GitPulse User Profile";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: { username: string };
}) {
  const { username } = params;

  // Attempt to fetch from DB for the OG image
  const [userData] = await db
    .select()
    .from(leaderboard)
    .where(eq(leaderboard.username, username));

  const score = userData?.totalScore || 0;
  const experience = deriveExperienceLevel(score);

  return new ImageResponse(
    (
      <div
        style={{
          background: "#030712",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          padding: "40px",
          border: "20px solid #111827",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "#10b981",
              borderRadius: "4px",
            }}
          />
          <span style={{ fontSize: "24px", fontWeight: "bold", color: "white", letterSpacing: "-1px" }}>GitPulse</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
          <img
            src={userData?.avatarUrl || `https://github.com/${username}.png`}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "12px",
              border: "4px solid #1f2937",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1 style={{ fontSize: "64px", fontWeight: "bold", color: "white", margin: 0 }}>{username}</h1>
            <span style={{ fontSize: "24px", color: "#9ca3af", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "4px" }}>
              {experience}
            </span>
          </div>
        </div>

        <div
          style={{
            marginTop: "60px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div style={{ fontSize: "20px", color: "#4b5563", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "2px" }}>
            Contribution Importance Score
          </div>
          <div style={{ fontSize: "96px", fontWeight: "bold", color: "#10b981", fontFamily: "monospace" }}>
            {score.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            color: "#06b6d4",
            fontSize: "18px",
            fontWeight: "bold",
          }}
        >
          gitpulse.vercel.app
        </div>
      </div>
    ),
    { ...size }
  );
}
