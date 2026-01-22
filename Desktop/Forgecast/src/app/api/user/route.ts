import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { NextResponse } from "next/server";

const client = new NeynarAPIClient({ apiKey: process.env.NEYNAR_API_KEY! });

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get("fid");

  if (!fid) {
    return NextResponse.json({ error: "FID is required" }, { status: 400 });
  }

  try {
    const user = await client.fetchBulkUsers({ fids: [Number(fid)] });
    return NextResponse.json(user.users[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
