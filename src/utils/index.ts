// Development utilities and scripts
import { spawn } from "child_process";

interface ScriptOptions {
  cwd?: string;
  stdio?: "inherit" | "pipe";
}

export const runScript = (
  command: string,
  args: string[],
  options: ScriptOptions = {},
): Promise<number> => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd || process.cwd(),
      stdio: options.stdio || "inherit",
      shell: true,
    });

    child.on("close", (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with exit code ${code}`));
      }
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
};

export const logSuccess = (message: string): void => {
  console.log(`✅ ${message}`);
};

export const logError = (message: string): void => {
  console.error(`❌ ${message}`);
};

export const logInfo = (message: string): void => {
  console.log(`ℹ️  ${message}`);
};
