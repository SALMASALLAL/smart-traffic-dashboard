import { NextResponse } from "next/server"
import { buildBackendUrl } from "@/lib/backend"

export async function GET(request: Request) {
  try {
    const incomingUrl = new URL(request.url)
    // The backend exposes detection records at /cognition-records/ (e.g. /cognition-records/?limit=100).
    // Default to limit=100 when the client did not supply one.
    const searchParams = new URLSearchParams(incomingUrl.searchParams)
    if (!searchParams.has("limit")) {
      searchParams.set("limit", "100")
    }
    const targetUrl = buildBackendUrl("/cognition-records/", searchParams)
    const authorization = request.headers.get("authorization")

    const headers: HeadersInit = {
      Accept: "application/json",
      "ngrok-skip-browser-warning": "true",
      ...(authorization ? { Authorization: authorization } : {}),
    }

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })

    const bodyText = await response.text()
    const contentType = response.headers.get("content-type") || "application/json"

    return new NextResponse(bodyText, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach detection records API",
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      },
      { status: 502 },
    )
  }
}
