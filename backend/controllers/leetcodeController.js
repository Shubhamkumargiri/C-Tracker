const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

const LEETCODE_ANALYTICS_QUERY = `
  query getLeetcodeAnalytics($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
        realName
        userAvatar
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
        totalSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
    userContestRanking(username: $username) {
      attendedContestsCount
      rating
      globalRanking
      totalParticipants
      topPercentage
    }
  }
`;

const LEETCODE_CALENDAR_QUERY = `
  query userProfileCalendar($username: String!, $year: Int) {
    matchedUser(username: $username) {
      userCalendar(year: $year) {
        activeYears
        streak
        totalActiveDays
        submissionCalendar
      }
    }
  }
`;

function getDifficultyCount(entries = [], difficulty) {
  return entries.find((entry) => entry.difficulty === difficulty)?.count || 0;
}

function getDifficultySubmissions(entries = [], difficulty) {
  return entries.find((entry) => entry.difficulty === difficulty)?.submissions || 0;
}

function calculateAcceptanceRate(totalSolved, totalSubmissions) {
  if (!totalSubmissions) {
    return 0;
  }

  return Number(((totalSolved / totalSubmissions) * 100).toFixed(1));
}

function parseSubmissionCalendar(rawCalendar) {
  if (!rawCalendar) {
    return { activeDays: 0, last30Days: 0 };
  }

  try {
    const calendar = JSON.parse(rawCalendar);
    const entries = Object.entries(calendar);
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const activeDays = entries.filter(([, count]) => Number(count) > 0).length;
    const last30Days = entries.filter(([timestamp, count]) => {
      const millis = Number(timestamp) * 1000;
      return Number(count) > 0 && millis >= thirtyDaysAgo && millis <= now;
    }).length;

    return { activeDays, last30Days };
  } catch {
    return { activeDays: 0, last30Days: 0 };
  }
}

function calculateProfileScore({ totalSolved, contestRating, acceptanceRate, streak }) {
  const solvedScore = Math.min(totalSolved / 6, 40);
  const ratingScore = Math.min(contestRating / 100, 25);
  const acceptanceScore = Math.min(acceptanceRate / 2.5, 20);
  const streakScore = Math.min(streak, 15);

  return Math.round(Math.min(solvedScore + ratingScore + acceptanceScore + streakScore, 100));
}

export const getLeetcodeAnalytics = async (req, res) => {
  const username = String(req.params.username || "").trim();

  if (!username) {
    return res.status(400).json({ message: "LeetCode username is required." });
  }

  try {
    const response = await fetch(LEETCODE_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Referer: `https://leetcode.com/${username}/`,
      },
      body: JSON.stringify({
        query: LEETCODE_ANALYTICS_QUERY,
        variables: { username },
      }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors?.length) {
      return res.status(response.status || 500).json({
        message: payload.errors?.[0]?.message || "Unable to fetch LeetCode analytics right now.",
      });
    }

    const user = payload.data?.matchedUser;

    if (!user) {
      return res.status(404).json({ message: "LeetCode user not found." });
    }

    const acceptedStats = user.submitStatsGlobal?.acSubmissionNum || [];
    const totalStats = user.submitStatsGlobal?.totalSubmissionNum || [];
    const totalSolved = getDifficultyCount(acceptedStats, "All");
    const easySolved = getDifficultyCount(acceptedStats, "Easy");
    const mediumSolved = getDifficultyCount(acceptedStats, "Medium");
    const hardSolved = getDifficultyCount(acceptedStats, "Hard");
    const totalSubmissions = getDifficultySubmissions(totalStats, "All");
    const acceptanceRate = calculateAcceptanceRate(totalSolved, totalSubmissions);
    const contestRating = Number(payload.data?.userContestRanking?.rating || 0).toFixed(1);
    let calendar = null;
    let calendarUnavailable = false;

    try {
      const calendarResponse = await fetch(LEETCODE_GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Referer: `https://leetcode.com/${username}/`,
        },
        body: JSON.stringify({
          query: LEETCODE_CALENDAR_QUERY,
          variables: {
            username,
            year: new Date().getFullYear(),
          },
          operationName: "userProfileCalendar",
        }),
      });

      const calendarPayload = await calendarResponse.json();

      if (calendarResponse.ok && !calendarPayload.errors?.length) {
        calendar = calendarPayload.data?.matchedUser?.userCalendar || null;
      } else {
        calendarUnavailable = true;
      }
    } catch {
      calendarUnavailable = true;
    }

    const calendarSummary = parseSubmissionCalendar(calendar?.submissionCalendar);
    const streak = calendar?.streak || 0;

    res.json({
      username: user.username,
      name: user.profile?.realName || "",
      avatar: user.profile?.userAvatar || "",
      ranking: user.profile?.ranking || 0,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      contestRating: Number(contestRating),
      attendedContests: payload.data?.userContestRanking?.attendedContestsCount || 0,
      contestGlobalRanking: payload.data?.userContestRanking?.globalRanking || 0,
      contestTopPercentage: payload.data?.userContestRanking?.topPercentage || 0,
      acceptanceRate,
      streak,
      activeYears: calendar?.activeYears || [],
      totalActiveDays: calendar?.totalActiveDays || 0,
      submissionCalendar: calendar?.submissionCalendar || "",
      calendarUnavailable,
      submissionCalendarSummary: calendarSummary,
      totalSubmissions,
      profileScore: calculateProfileScore({
        totalSolved,
        contestRating: Number(contestRating),
        acceptanceRate,
        streak,
      }),
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Unable to fetch LeetCode analytics right now.",
    });
  }
};
