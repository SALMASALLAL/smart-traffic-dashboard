import { NextResponse } from "next/server"
import { buildBackendUrl } from "@/lib/backend"

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "application/x-www-form-urlencoded"
    const body = await request.text()
    const targetUrl = buildBackendUrl("/login")

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "ngrok-skip-browser-warning": "true",
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    })

    const responseBody = await response.text()
    const responseContentType = response.headers.get("content-type") || "application/json"

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        "Content-Type": responseContentType,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to reach login API",
        detail: error instanceof Error ? error.message : "Unknown upstream error",
      },
      { status: 502 },
    )
  }
}
