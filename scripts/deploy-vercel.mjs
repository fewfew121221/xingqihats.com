import { execFileSync } from "node:child_process";
import fs from "node:fs";

const configPath = "deployment.config.json";
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

function run(command, args) {
  console.log(`$ ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
}

if (!config.github_repository_url || config.github_repository_url.includes("你的账号")) {
  throw new Error("deployment.config.json 需要填写真实 GitHub 仓库 URL 后才能自动 push。");
}

run("npm", ["run", "build"]);
run("git", ["add", "content", "site", "scripts", "package.json", "vercel.json", "deployment.config.json", "README.md"]);
run("git", ["commit", "-m", "Update Xingqi Hats GEO website content"]);
run("git", ["push"]);

console.log(`Vercel project ${config.vercel_project} will redeploy ${config.target_site} after GitHub receives the push.`);
