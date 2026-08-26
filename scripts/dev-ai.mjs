import { spawn } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const pythonPath = path.join(
  process.cwd(),
  ".venv",
  process.platform === "win32" ? "Scripts/python.exe" : "bin/python",
);

if (!existsSync(pythonPath)) {
  console.error("Python 가상환경을 찾을 수 없습니다. 먼저 python -m venv .venv를 실행하세요.");
  process.exit(1);
}

const child = spawn(
  pythonPath,
  ["-m", "uvicorn", "ai.api:app", "--host", "127.0.0.1", "--port", "8001"],
  { cwd: process.cwd(), env: process.env, stdio: "inherit" },
);

child.on("error", (error) => {
  console.error(`AI 서버 실행 실패: ${error.message}`);
  process.exit(1);
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  else process.exit(code ?? 1);
});
