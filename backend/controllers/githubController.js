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
      const headers = { "User-Agent": "Career-Tracker-App" };
      const [fallbackResponse, commitsRes, prsRes, contribsRes] = await Promise.allSettled([
        fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { headers }),
        fetch(`https://api.github.com/search/commits?q=author:${encodeURIComponent(username)}`, { headers: { ...headers, 'Accept': 'application/vnd.github.cloak-preview' } }),
        fetch(`https://api.github.com/search/issues?q=author:${encodeURIComponent(username)}+type:pr`, { headers }),
        fetch(`https://github-contributions-api.deno.dev/${encodeURIComponent(username)}.json`)
      ]);
      
      let data = {};
      let isRateLimited = false;
      
      if (fallbackResponse.status !== "fulfilled" || !fallbackResponse.value.ok) {
        const status = fallbackResponse.status === "fulfilled" ? fallbackResponse.value.status : 500;
        if (status === 404) {
          return res.status(404).json({ message: "GitHub user not found." });
        }
        isRateLimited = true;
      } else {
        data = await fallbackResponse.value.json();
      }
      
      const { from, to } = buildGithubDateRange();

      let commits = "N/A";
      let pullRequests = "N/A";
      let contributions = "N/A";

      if (!isRateLimited && commitsRes.status === "fulfilled" && commitsRes.value.ok) {
        const cData = await commitsRes.value.json();
        commits = cData.total_count ?? "N/A";
      }
      
      if (!isRateLimited && prsRes.status === "fulfilled" && prsRes.value.ok) {
        const pData = await prsRes.value.json();
        pullRequests = pData.total_count ?? "N/A";
      }
      
      if (contribsRes.status === "fulfilled" && contribsRes.value.ok) {
        const ctData = await contribsRes.value.json();
        contributions = ctData.totalContributions ?? "N/A";
      }
      
      // If rate limited by API, scrape the HTML page as a fallback to get real basic stats
      if (isRateLimited) {
         try {
             const htmlRes = await fetch(`https://github.com/${username}`);
             if (htmlRes.ok) {
                 const html = await htmlRes.text();
                 
                 const followersMatch = html.match(/<span class="text-bold color-fg-default">([\d.,kmK]+)<\/span>\s*followers/i);
                 const followingMatch = html.match(/<span class="text-bold color-fg-default">([\d.,kmK]+)<\/span>\s*following/i);
                 
                 // Try to find the repository counter
                 const reposMatch = html.match(/Repositories[^<]*<span[^>]*title="([^"]+)"[^>]*>/i) || 
                                    html.match(/Repositories[^<]*<span[^>]*class="Counter"[^>]*>([\d.,kmK]+)<\/span>/i) ||
                                    html.match(/Counter js-profile-repository-count"[^>]*>([\d.,kmK]+)<\/span>/i);
                 
                 const parseNum = (str) => {
                     if (!str) return 0;
                     str = str.toLowerCase().replace(/,/g, '');
                     if (str.includes('k')) return parseFloat(str) * 1000;
                     if (str.includes('m')) return parseFloat(str) * 1000000;
                     return parseInt(str) || 0;
                 };

                 const followers = followersMatch ? parseNum(followersMatch[1]) : 0;
                 const following = followingMatch ? parseNum(followingMatch[1]) : 0;
                 const repos = reposMatch ? parseNum(reposMatch[1]) : 0;

                 return res.json({
                    username: username,
                    name: username,
                    repositories: repos,
                    pullRequests: "N/A",
                    commits: "N/A",
                    contributions: contributions !== "N/A" ? contributions : 0,
                    followers: followers,
                    following: following,
                    contributedRepositories: 0,
                    reviews: 0,
                    starredRepositories: 0,
                    repositoryContributions: 0,
                    pullRequestContributions: 0,
                    profileScore: Math.min(repos * 2 + (contributions !== "N/A" ? 10 : 0), 40),
                    dateRange: { from, to }
                 });
             }
         } catch (e) {
             console.error("HTML scrape fallback failed:", e);
         }
         
         // If everything fails, gracefully degrade instead of crashing the UI or showing fake data
         return res.json({
            username: username,
            name: username,
            repositories: 0,
            pullRequests: "N/A",
            commits: "N/A",
            contributions: contributions !== "N/A" ? contributions : 0,
            followers: 0,
            following: 0,
            contributedRepositories: 0,
            reviews: 0,
            starredRepositories: 0,
            repositoryContributions: 0,
            pullRequestContributions: 0,
            profileScore: 0,
            dateRange: { from, to }
         });
      }
      
      return res.json({
        username: data.login,
        name: data.name || "",
        repositories: data.public_repos || 0,
        pullRequests,
        commits,
        contributions,
        followers: data.followers || 0,
        following: data.following || 0,
        contributedRepositories: 0,
        reviews: 0,
        starredRepositories: 0,
        repositoryContributions: 0,
        pullRequestContributions: 0,
        profileScore: Math.min((data.public_repos || 0) * 2 + (typeof commits === 'number' ? commits/2 : 0), 40),
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
