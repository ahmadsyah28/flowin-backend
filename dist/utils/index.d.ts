interface ScriptOptions {
    cwd?: string;
    stdio?: "inherit" | "pipe";
}
export declare const runScript: (command: string, args: string[], options?: ScriptOptions) => Promise<number>;
export declare const logSuccess: (message: string) => void;
export declare const logError: (message: string) => void;
export declare const logInfo: (message: string) => void;
export {};
//# sourceMappingURL=index.d.ts.map