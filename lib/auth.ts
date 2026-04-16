const ACCESS_TOKEN_KEY = "access_token"
const TOKEN_TYPE_KEY = "token_type"

export function saveAuthToken(accessToken: string, tokenType: string) {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
  localStorage.setItem(TOKEN_TYPE_KEY, tokenType)
}

export function getAccessToken() {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getTokenType() {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem(TOKEN_TYPE_KEY)
}

export function clearAuthToken() {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem(ACCESS_TOKEN_KEY)
  localStorage.removeItem(TOKEN_TYPE_KEY)
}

export function isAuthenticated() {
  return Boolean(getAccessToken())
}
