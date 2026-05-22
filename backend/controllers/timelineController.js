import StatSnapshot from "../models/StatSnapshot.js";

const DAY_IN_MS = 24 * 60 * 60 * 1000;

function toDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function buildDateKeys(days) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  return Array.from({ length: days }, (_, index) => {
    const date = new Date(today.getTime() - (days - index - 1) * DAY_IN_MS);
    return toDateKey(date);
  });
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeGithubStats(stats = {}) {
  return {
    username: String(stats.username || "").trim(),
    repositories: toNumber(stats.repositories),
    pullRequests: toNumber(stats.pullRequests),
    commits: toNumber(stats.commits),
    contributions: toNumber(stats.contributions),
    followers: toNumber(stats.followers),
    following: toNumber(stats.following),
    profileScore: toNumber(stats.profileScore),
  };
}

function normalizeLeetcodeStats(stats = {}) {
  return {
    username: String(stats.username || "").trim(),
    totalSolved: toNumber(stats.totalSolved),
    easySolved: toNumber(stats.easySolved),
    mediumSolved: toNumber(stats.mediumSolved),
    hardSolved: toNumber(stats.hardSolved),
    contestRating: toNumber(stats.contestRating),
    acceptanceRate: toNumber(stats.acceptanceRate),
    streak: toNumber(stats.streak),
    totalSubmissions: toNumber(stats.totalSubmissions),
    profileScore: toNumber(stats.profileScore),
    submissionDaysLast30: toNumber(stats.submissionCalendarSummary?.last30Days),
  };
}

function calculateDevpostScore(stats = {}) {
  return Math.min(
    100,
    Math.round(
      toNumber(stats.projects) * 25 +
        toNumber(stats.hackathons) * 10
    )
  );
}

function normalizeDevpostStats(stats = {}) {
  return {
    projects: toNumber(stats.projects),
    hackathons: toNumber(stats.hackathons),
    followers: toNumber(stats.followers),
    profileScore: calculateDevpostScore(stats),
  };
}

function normalizeStats(stats = {}) {
  const normalized = {};

  if (stats.github) {
    normalized.github = normalizeGithubStats(stats.github);
  }

  if (stats.leetcode) {
    normalized.leetcode = normalizeLeetcodeStats(stats.leetcode);
  }

  if (stats.devpost) {
    normalized.devpost = normalizeDevpostStats(stats.devpost);
  }

  return normalized;
}

export const saveDailySnapshot = async (req, res) => {
  try {
    const stats = normalizeStats(req.body?.stats);

    if (!Object.keys(stats).length) {
      return res.status(400).json({ message: "At least one platform stat block is required." });
    }

    const dateKey = toDateKey();
    const update = Object.entries(stats).reduce(
      (nextUpdate, [platform, platformStats]) => ({
        ...nextUpdate,
        [`stats.${platform}`]: platformStats,
      }),
      {}
    );

    const snapshot = await StatSnapshot.findOneAndUpdate(
      { user: req.user._id, dateKey },
      { $set: update },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.json({
      message: "Daily stats snapshot saved.",
      snapshot,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to save stats snapshot." });
  }
};

export const getTimeline = async (req, res) => {
  try {
    const requestedDays = Number(req.query.days || 30);
    const days = Math.min(Math.max(Number.isFinite(requestedDays) ? requestedDays : 30, 1), 90);
    const dateKeys = buildDateKeys(days);
    const snapshots = await StatSnapshot.find({
      user: req.user._id,
      dateKey: { $in: dateKeys },
    })
      .sort({ dateKey: 1 })
      .lean();

    const snapshotsByDate = new Map(snapshots.map((snapshot) => [snapshot.dateKey, snapshot]));

    res.json({
      days,
      timeline: dateKeys.map((dateKey) => ({
        date: dateKey,
        stats: snapshotsByDate.get(dateKey)?.stats || {},
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message || "Unable to load stats timeline." });
  }
};
