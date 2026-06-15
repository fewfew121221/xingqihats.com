import { execFileSync } from "node:child_process";
import fs from "node:fs";

const repoUrl = process.env.GITHUB_REPO || "https://github.com/xingqi-hats/xingqi-hats-site.git";
const branch = process.env.DEPLOY_BRANCH || "main";

function run(command, args, options = {}) {
  console.log(`EXEC: ${command} ${args.join(" ")}`);
  execFileSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options
  });
}

function output(command, args) {
  return execFileSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
    stdio: ["ignore", "pipe", "pipe"]
  }).trim();
}

function hasChanges() {
  return output("git", ["status", "--porcelain"]).length > 0;
}

function ensureGit() {
  if (!fs.existsSync(".git")) run("git", ["init"]);
  run("git", ["config", "user.name", "Codex Automation"]);
  run("git", ["config", "user.email", "codex-automation@example.local"]);
  run("git", ["branch", "-M", branch]);
}

function bindRemote() {
  const remotes = output("git", ["remote"]).split(/\r?\n/).filter(Boolean);
  if (remotes.includes("origin")) run("git", ["remote", "remove", "origin"]);
  run("git", ["remote", "add", "origin", repoUrl]);
}

function pushWithRetry() {
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    console.log(`PUSH_ATTEMPT: ${attempt}`);
    try {
      bindRemote();
      run("git", ["push", "-u", "origin", branch, "--force"]);
      console.log("SUCCESS: github push finished");
      return true;
    } catch (error) {
      console.error(`FAILED: github push attempt ${attempt}`);
    }
  }
  return false;
}

run("npm", ["run", "build"]);
ensureGit();

run("git", ["add", "."]);
if (hasChanges()) {
  run("git", ["commit", "-m", process.env.COMMIT_MESSAGE || "auto deploy update"]);
} else {
  console.log("SUCCESS: no local changes to commit");
}

if (!pushWithRetry()) {
  console.error(`FAILED: github push failed after 3 attempts: ${repoUrl}`);
  process.exit(1);
}

if (process.env.ALIYUN_HOST || process.env.ALIYUN_USER || process.env.ALIYUN_APP_DIR) {
  run("npm", ["run", "deploy:aliyun"]);
} else {
  console.log("NEXT: set ALIYUN_HOST, ALIYUN_USER, ALIYUN_APP_DIR to rebuild on Aliyun server");
}
