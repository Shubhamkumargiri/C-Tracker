import { getStoredUser } from "./auth";

export const INTEGRATIONS_KEY = "dashboard-integrations";
export const GITHUB_USERNAME_KEY = "dashboard-github-username";
export const LEETCODE_USERNAME_KEY = "dashboard-leetcode-username";
export const LINKEDIN_METRICS_KEY = "dashboard-linkedin-metrics";

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
  return Object.values(integrations).filter(Boolean).length;
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

export function getSavedLinkedinMetrics() {
  const user = getStoredUser();
  if (user?.linkedinMetrics) {
    return {
      connections: String(user.linkedinMetrics.connections ?? "").trim(),
      profileViewers: String(user.linkedinMetrics.profileViewers ?? "").trim(),
      postImpressions: String(user.linkedinMetrics.postImpressions ?? "").trim(),
    };
  }

  if (typeof window === "undefined") {
    return {
      connections: "",
      profileViewers: "",
      postImpressions: "",
    };
  }

  try {
    const raw = window.localStorage.getItem(LINKEDIN_METRICS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      connections: String(parsed.connections ?? "").trim(),
      profileViewers: String(parsed.profileViewers ?? "").trim(),
      postImpressions: String(parsed.postImpressions ?? "").trim(),
    };
  } catch {
    return {
      connections: "",
      profileViewers: "",
      postImpressions: "",
    };
  }
}

export function saveLinkedinMetrics(metrics) {
  if (typeof window === "undefined") {
    return;
  }

  const normalizedMetrics = {
    connections: String(metrics?.connections ?? "").trim(),
    profileViewers: String(metrics?.profileViewers ?? "").trim(),
    postImpressions: String(metrics?.postImpressions ?? "").trim(),
  };

  const hasValues = Object.values(normalizedMetrics).some(Boolean);

  if (hasValues) {
    window.localStorage.setItem(LINKEDIN_METRICS_KEY, JSON.stringify(normalizedMetrics));
    return;
  }

  window.localStorage.removeItem(LINKEDIN_METRICS_KEY);
}
