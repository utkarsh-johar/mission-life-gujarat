import git from "isomorphic-git";
import http from "isomorphic-git/http/node";
import * as fs from "fs";

const dir = process.cwd();

async function pushToGitHub() {
  const token = process.env.GITHUB_TOKEN || process.argv[2];
  const repoName = process.env.GITHUB_REPO || process.argv[3] || "life-gujarat-mission";
  const username = process.env.GITHUB_USERNAME || process.argv[4];

  if (!token) {
    console.log(`
Usage:
  npx tsx scripts/push-to-github.ts <YOUR_GITHUB_TOKEN> [REPO_NAME] [USERNAME]

Or set environment variables:
  GITHUB_TOKEN=ghp_xxx
  GITHUB_REPO=life-gujarat
  GITHUB_USERNAME=your-username
    `);
    process.exit(1);
  }

  // 1. Create repo on GitHub if username is provided
  let remoteUrl = "";
  try {
    const res = await fetch("https://api.github.com/user/repos", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "User-Agent": "LiFE-Gujarat-App",
      },
      body: JSON.stringify({
        name: repoName,
        description: "Mission LiFE Gujarat & EcoVerse — GEDA Citizen Engagement Platform (HC26-GEDA01)",
        private: false,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`Created GitHub repository: ${data.html_url}`);
      remoteUrl = data.clone_url;
    } else if (data.errors && data.errors[0]?.message?.includes("already exists")) {
      console.log(`Repository ${repoName} already exists on your account. Pushing updates...`);
      remoteUrl = `https://github.com/${username || data.owner?.login}/${repoName}.git`;
    } else {
      console.warn("GitHub API response:", data.message || data);
      remoteUrl = `https://github.com/${username}/${repoName}.git`;
    }
  } catch (e) {
    console.warn("Could not auto-create repo via API, attempting direct push to target:", e);
    remoteUrl = `https://github.com/${username}/${repoName}.git`;
  }

  // 2. Add remote & push
  console.log(`Pushing to ${remoteUrl}...`);
  await git.addRemote({ fs, dir, remote: "origin", url: remoteUrl, force: true });

  await git.push({
    fs,
    http,
    dir,
    remote: "origin",
    ref: "main",
    onAuth: () => ({ username: token, password: "" }),
  });

  console.log("Successfully pushed to GitHub!");
}

pushToGitHub().catch((err) => {
  console.error("Push error:", err);
  process.exit(1);
});
