import { AUTH_STORAGE_KEY } from '../constants/mesConfig'

export function loadStoredAuth() {
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY)
    return stored ? buildAuthSession(JSON.parse(stored)) : null
  } catch {
    return null
  }
}

export function buildAuthSession(source) {
  if (!source?.accessToken) {
    return source ?? null
  }

  const profile = extractAuthProfile(source.accessToken)
  const fallbackEmail = source.email?.trim().toLowerCase() ?? profile.email ?? ''

  return {
    ...source,
    email: fallbackEmail,
    name: source.name ?? profile.name ?? fallbackEmail,
    role: source.role ?? profile.role ?? '',
  }
}

export function extractAuthProfile(accessToken) {
  if (!accessToken) {
    return {}
  }

  try {
    const [, payloadSegment] = accessToken.split('.')
    if (!payloadSegment) {
      return {}
    }

    const decoded = decodeBase64Url(payloadSegment)
    const payload = JSON.parse(decoded)

    return {
      email: payload.sub ?? '',
      name: payload.name ?? '',
      role: payload.role ?? '',
    }
  } catch {
    return {}
  }
}

export function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)

  return decodeURIComponent(
    binary
      .split('')
      .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, '0')}`)
      .join(''),
  )
}
