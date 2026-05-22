import { getStoredUser } from "./auth";

export const INTEGRATIONS_KEY = "dashboard-integrations";
export const GITHUB_USERNAME_KEY = "dashboard-github-username";
export const LEETCODE_USERNAME_KEY = "dashboard-leetcode-username";
export const DEVPOST_USERNAME_KEY = "dashboard-devpost-username";

export function getSavedIntegrations() {
  const user = getStoredUser();
  if (user?.integrations) {
    return user.integrations;
  }

  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(INTEGRATIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveIntegrations(nextState) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(INTEGRATIONS_KEY, JSON.stringify(nextState));
}

export function countConnectedIntegrations(integrations) {
  const validKeys = ["github", "leetcode", "devpost"];
  return validKeys.filter(key => integrations[key]).length;
}

export function getSavedGithubUsername() {
  const user = getStoredUser();
  if (user?.githubUsername) {
    return user.githubUsername;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(GITHUB_USERNAME_KEY)?.trim() || "";
}

export function saveGithubUsername(username) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUsername = String(username || "").trim();

  if (normalizedUsername) {
    window.localStorage.setItem(GITHUB_USERNAME_KEY, normalizedUsername);
    return;
  }

  window.localStorage.removeItem(GITHUB_USERNAME_KEY);
}

export function getSavedLeetcodeUsername() {
  const user = getStoredUser();
  if (user?.leetcodeUsername) {
    return user.leetcodeUsername;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(LEETCODE_USERNAME_KEY)?.trim() || "";
}

export function saveLeetcodeUsername(username) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUsername = String(username || "").trim();

  if (normalizedUsername) {
    window.localStorage.setItem(LEETCODE_USERNAME_KEY, normalizedUsername);
    return;
  }

  window.localStorage.removeItem(LEETCODE_USERNAME_KEY);
}

export function getSavedDevpostUsername() {
  const user = getStoredUser();
  if (user?.devpostUsername) {
    return user.devpostUsername;
  }

  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(DEVPOST_USERNAME_KEY)?.trim() || "";
}

export function saveDevpostUsername(username) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedUsername = String(username || "").trim();

  if (normalizedUsername) {
    window.localStorage.setItem(DEVPOST_USERNAME_KEY, normalizedUsername);
    return;
  }

  window.localStorage.removeItem(DEVPOST_USERNAME_KEY);
}
