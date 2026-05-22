export const getDevpostAnalytics = async (req, res) => {
  let { username } = req.params;
  username = String(username || "").trim();

  if (!username) {
    return res.status(400).json({ message: "Devpost username is required." });
  }

  // Extract username if URL is provided
  if (username.includes("devpost.com/")) {
    const urlParts = username.split("devpost.com/");
    if (urlParts.length > 1) {
      username = urlParts[1].split("/")[0].split("?")[0];
    }
  }

  try {
    const response = await fetch(`https://devpost.com/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      }
    });

    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 500).json({
        message: response.status === 404 ? "Devpost user not found." : "Unable to fetch Devpost info right now."
      });
    }

    const html = await response.text();

    const projectsMatch = html.match(/<div class="totals">\s*<span>([\d,]+)<\/span>\s*<\/div>\s*Projects/i);
    const hackathonsMatch = html.match(/<div class="totals">\s*<span>([\d,]+)<\/span>\s*<\/div>\s*Hackathons/i);
    const followersMatch = html.match(/<div class="totals">\s*<span>([\d,]+)<\/span>\s*<\/div>\s*Followers/i);

    const projects = projectsMatch ? parseInt(projectsMatch[1].replace(/,/g, ''), 10) : 0;
    const hackathons = hackathonsMatch ? parseInt(hackathonsMatch[1].replace(/,/g, ''), 10) : 0;
    const followers = followersMatch ? parseInt(followersMatch[1].replace(/,/g, ''), 10) : 0;

    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    let name = username;
    if (titleMatch) {
        name = titleMatch[1].split(/&#39;s/i)[0].split(/'s/i)[0].trim();
        name = name.replace(/&#39;/g, "'").replace(/&amp;/g, "&").replace(/&quot;/g, '"');
    }

    res.json({
      username,
      name,
      projects,
      hackathons,
      followers
    });
  } catch (error) {
    res.status(500).json({
      message: "Unable to fetch Devpost analytics right now.",
    });
  }
};
