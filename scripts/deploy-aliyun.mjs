import { execFileSync } from "node:child_process";

const required = ["ALIYUN_HOST", "ALIYUN_USER", "ALIYUN_APP_DIR"];
const missing = required.filter((name) => !process.env[name]);

if (missing.length) {
  console.error(`FAILED: missing ${missing.join(", ")}`);
  console.error("NEXT: set ALIYUN_HOST, ALIYUN_USER, ALIYUN_APP_DIR, then rerun npm.cmd run deploy:aliyun");
  process.exit(1);
}

const host = process.env.ALIYUN_HOST;
const user = process.env.ALIYUN_USER;
const appDir = process.env.ALIYUN_APP_DIR;
const branch = process.env.DEPLOY_BRANCH || "main";
const key = process.env.ALIYUN_KEY ? ["-i", process.env.ALIYUN_KEY] : [];
const restart = process.env.ALIYUN_RESTART_CMD || "";

const remoteCommand = [
  `cd ${quote(appDir)}`,
  `git fetch origin ${quote(branch)}`,
  `git reset --hard origin/${quote(branch)}`,
  "if [ -f package-lock.json ]; then npm ci; else npm install; fi",
  "npm run build",
  restart
].filter(Boolean).join(" && ");

function quote(value) {
  return `'${String(value).replaceAll("'", "'\\''")}'`;
}

function run(command, args) {
  console.log(`EXEC: ${command} ${args.join(" ")}`);
  execFileSync(command, args, { stdio: "inherit", shell: process.platform === "win32" });
}

run("ssh", [
  "-o", "BatchMode=yes",
  "-o", "StrictHostKeyChecking=accept-new",
  ...key,
  `${user}@${host}`,
  remoteCommand
]);

console.log("SUCCESS: aliyun rebuild finished");
