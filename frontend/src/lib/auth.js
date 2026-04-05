const TOKEN_KEY = "token";
const COOKIE_MAX_AGE = 60 * 60 * 24; // 1 day in seconds

// ── Token storage ─────────────────────────────────────────────────────────────

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  // localStorage — used for API Authorization headers
  localStorage.setItem(TOKEN_KEY, token);
  // Cookie — readable by Next.js middleware for server-side route protection
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
  // Expire the cookie immediately
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

// ── JWT payload ───────────────────────────────────────────────────────────────

/** Decode the JWT payload without verifying the signature (client-side only). */
export function getUser() {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // Treat expired tokens as absent
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeToken();
      return null;
    }
    return payload; // { id, role, name, exp, iat }
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return getUser() !== null;
}

export function isStaff() {
  return getUser()?.role === "staff";
}

// ── Fetch helpers ─────────────────────────────────────────────────────────────

/** Returns Authorization header object, or empty object when not logged in. */
export function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** Logout: clear token and redirect to login. */
export function logout(router) {
  removeToken();
  router.push("/login");
}
