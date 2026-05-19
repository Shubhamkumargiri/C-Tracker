const GITHUB_GRAPHQL_URL = "https://api.github.com/graphql";

const GITHUB_ANALYTICS_QUERY = `
  query GetGithubAnalytics($username: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $username) {
      login
      name
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(ownerAffiliations: OWNER, isFork: false) {
        totalCount
      }
      pullRequests {
        totalCount
      }
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          totalContributions
        }
        totalCommitContributions
        totalPullRequestContributions
        totalPullRequestReviewContributions
        totalRepositoryContributions
      }
      repositoriesContributedTo(
        contributionTypes: [COMMIT, PULL_REQUEST, REPOSITORY, PULL_REQUEST_REVIEW]
      ) {
        totalCount
      }
      starredRepositories {
        totalCount
      }
    }
  }
`;

function buildGithubDateRange() {
  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 365);

  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

function calculateProfileScore(user) {
  const commitScore = Math.min(user.contributionsCollection.totalCommitContributions / 2, 35);
  const contributionScore = Math.min(
    user.contributionsCollection.contributionCalendar.totalContributions / 10,
    25
  );
  const repoScore = Math.min(user.repositories.totalCount * 2, 20);
  const pullRequestScore = Math.min(user.pullRequests.totalCount * 1.5, 20);

  return Math.round(Math.min(commitScore + contributionScore + repoScore + pullRequestScore, 100));
}

export const getGithubAnalytics = async (req, res) => {
  const token = process.env.GITHUB_TOKEN;
  const username = String(req.params.username || "").trim();

  if (!username) {
    return res.status(400).json({ message: "GitHub username is required." });
  }

  if (!token) {
    try {
      const fallbackResponse = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { "User-Agent": "Career-Tracker-App" }
      });
      
      if (!fallbackResponse.ok) {
        return res.status(fallbackResponse.status === 404 ? 404 : 500).json({ 
          message: fallbackResponse.status === 404 ? "GitHub user not found." : "GitHub API rate limit exceeded. Please add GITHUB_TOKEN." 
        });
      }
      
      const data = await fallbackResponse.json();
      const { from, to } = buildGithubDateRange();
      
      return res.json({
        username: data.login,
        name: data.name || "",
        repositories: data.public_repos || 0,
        pullRequests: "N/A",
        commits: "N/A",
        contributions: "N/A",
        followers: data.followers || 0,
        following: data.following || 0,
        contributedRepositories: 0,
        reviews: 0,
        starredRepositories: 0,
        repositoryContributions: 0,
        pullRequestContributions: 0,
        profileScore: Math.min((data.public_repos || 0) * 2, 20),
        dateRange: { from, to },
      });
    } catch (error) {
      return res.status(500).json({ message: "Unable to fetch GitHub info." });
    }
  }

  try {
    const { from, to } = buildGithubDateRange();
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        query: GITHUB_ANALYTICS_QUERY,
        variables: {
          username,
          from,
          to,
        },
      }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors?.length) {
      const notFound = payload.errors?.some((error) =>
        String(error?.type || "").toUpperCase().includes("NOT_FOUND")
      );

      return res.status(notFound ? 404 : response.status || 500).json({
        message:
          payload.errors?.[0]?.message || "Unable to fetch GitHub analytics right now.",
      });
    }

    const user = payload.data?.user;

    if (!user) {
      return res.status(404).json({ message: "GitHub user not found." });
    }

    res.json({
      username: user.login,
      name: user.name || "",
      repositories: user.repositories.totalCount,
      pullRequests: user.pullRequests.totalCount,
      commits: user.contributionsCollection.totalCommitContributions,
      contributions: user.contributionsCollection.contributionCalendar.totalContributions,
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      contributedRepositories: user.repositoriesContributedTo.totalCount,
      reviews: user.contributionsCollection.totalPullRequestReviewContributions,
      starredRepositories: user.starredRepositories.totalCount,
      repositoryContributions: user.contributionsCollection.totalRepositoryContributions,
      pullRequestContributions: user.contributionsCollection.totalPullRequestContributions,
      profileScore: calculateProfileScore(user),
      dateRange: {
        from,
        to,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: error.message || "Unable to fetch GitHub analytics right now.",
    });
  }
};
