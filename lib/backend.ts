const DEFAULT_BACKEND_BASE_URL = "https://judgingly-cicatrisant-milly.ngrok-free.dev"

export function getBackendBaseUrl() {
  const raw = process.env.BACKEND_BASE_URL?.trim() || DEFAULT_BACKEND_BASE_URL
  return raw.replace(/\/$/, "")
}

export function buildBackendUrl(pathname: string, searchParams?: URLSearchParams) {
  const base = getBackendBaseUrl()
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  const url = new URL(`${base}${normalizedPath}`)

  if (searchParams) {
    url.search = searchParams.toString()
  }

  return url
}
