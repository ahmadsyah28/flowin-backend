"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logInfo = exports.logError = exports.logSuccess = exports.runScript = void 0;
const child_process_1 = require("child_process");
const runScript = (command, args, options = {}) => {
    return new Promise((resolve, reject) => {
        const child = (0, child_process_1.spawn)(command, args, {
            cwd: options.cwd || process.cwd(),
            stdio: options.stdio || "inherit",
            shell: true,
        });
        child.on("close", (code) => {
            if (code === 0) {
                resolve(code);
            }
            else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });
        child.on("error", (error) => {
            reject(error);
        });
    });
};
exports.runScript = runScript;
const logSuccess = (message) => {
    console.log(`✅ ${message}`);
};
exports.logSuccess = logSuccess;
const logError = (message) => {
    console.error(`❌ ${message}`);
};
exports.logError = logError;
const logInfo = (message) => {
    console.log(`ℹ️  ${message}`);
};
exports.logInfo = logInfo;
//# sourceMappingURL=index.js.map