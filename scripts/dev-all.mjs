import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const isWindows = process.platform === "win32";
const npmCommand = isWindows ? "npm.cmd" : "npm";
const pythonPath = path.join(
  root,
  ".venv",
  isWindows ? "Scripts/python.exe" : "bin/python",
);

if (!existsSync(pythonPath)) {
  console.error("[통합 실행] Python 가상환경을 찾을 수 없습니다.");
  console.error("먼저 다음 명령을 실행하세요:");
  console.error("  python -m venv .venv");
  console.error(
    isWindows
      ? "  .venv\\Scripts\\python.exe -m pip install -r ai/requirements.txt"
      : "  .venv/bin/python -m pip install -r ai/requirements.txt",
  );
  process.exit(1);
}

const services = [
  {
    name: "AI",
    command: pythonPath,
    args: ["-m", "uvicorn", "ai.api:app", "--host", "127.0.0.1", "--port", "8001"],
    env: process.env,
  },
  {
    name: "백엔드",
    command: process.execPath,
    args: ["backend/src/server.mjs"],
    env: {
      ...process.env,
      PORT: process.env.PORT || "8080",
      AI_RECOMMENDATION_BASE_URL:
        process.env.AI_RECOMMENDATION_BASE_URL || "http://127.0.0.1:8001",
    },
  },
  {
    name: "프론트엔드",
    command: npmCommand,
    args: ["--prefix", "frontend", "run", "dev"],
    env: process.env,
    shell: isWindows,
  },
];

const children = [];
let stopping = false;

function stopAll(exitCode = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill("SIGTERM");
  }
  setTimeout(() => process.exit(exitCode), 300).unref();
}

console.log("[통합 실행] 프론트엔드(5173), 백엔드(8080), AI(8001)를 시작합니다.");

for (const service of services) {
  const child = spawn(service.command, service.args, {
    cwd: root,
    env: service.env,
    stdio: "inherit",
    shell: service.shell || false,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(`[${service.name}] 실행 실패: ${error.message}`);
    stopAll(1);
  });
  child.on("exit", (code, signal) => {
    if (stopping) return;
    console.error(
      `[${service.name}] 서버가 종료됐습니다 (${signal || `exit ${code ?? 1}`}).`,
    );
    stopAll(code || 1);
  });
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));
