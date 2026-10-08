import { NextResponse } from "next/server";

export async function GET() {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  if (!accessKey) {
    return NextResponse.json(
      {
        error: "Unsplash access key is not configured",
      },
      {
        status: 500,
      }
    );
  }

  try {
    const response = await fetch(
      "https://api.unsplash.com/photos?per_page=24",
      {
        headers: {
          Authorization: `Client-ID ${accessKey}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.text();

      console.error("Unsplash API error:", error);

      return NextResponse.json(
        {
          error: "Unsplash API request failed",
          details: error,
        },
        {
          status: response.status,
        }
      );
    }

    const photos = await response.json();

    return NextResponse.json(photos);
  } catch (error) {
    console.error("Unsplash request failed:", error);

    return NextResponse.json(
      {
        error: "Failed to connect to Unsplash",
      },
      {
        status: 500,
      }
    );
  }
}