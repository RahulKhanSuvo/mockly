import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { downloadLocation } = await request.json();

  if (!downloadLocation) {
    return NextResponse.json(
      { error: "downloadLocation is required" },
      { status: 400 }
    );
  }

  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      { error: "Unsplash access key is not configured" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(downloadLocation);

    url.searchParams.set("client_id", accessKey);

    const response = await fetch(url.toString());

    if (!response.ok) {
      return NextResponse.json(
        { error: "Unsplash download tracking failed" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid download location" },
      { status: 400 }
    );
  }
}