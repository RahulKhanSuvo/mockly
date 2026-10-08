import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query");

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "Search query is required" },
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

  const url = new URL("https://api.unsplash.com/search/photos");

  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "30");

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();

      return NextResponse.json(
        {
          error: "Unsplash API request failed",
          details: error,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to Unsplash" },
      { status: 500 }
    );
  }
}