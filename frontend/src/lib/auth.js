const TOKEN_KEY = "token";
const USER_KEY = "user";
const AUTH_EVENT = "auth-session-updated";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession({ token, user }) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  }

  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getStoredUser() {
  const rawUser = localStorage.getItem(USER_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser);
  } catch {
    clearAuthSession();
    return null;
  }
}

export function updateStoredUser(updates) {
  const currentUser = getStoredUser();

  if (!currentUser) {
    return null;
  }

  const nextUser = { ...currentUser, ...updates };
  localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return nextUser;
}

export function getUserInitials(name) {
  if (!name) {
    return "CT";
  }

  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");

  return initials || "CT";
}

export function subscribeToAuthSession(listener) {
  window.addEventListener(AUTH_EVENT, listener);
  window.addEventListener("storage", listener);

  return () => {
    window.removeEventListener(AUTH_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
