export enum LogLevel {
    OFF = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}

const LOGGER_PREFIX = process.env.LOGGER_PREFIX || "[ReAI-TOOLKIT]";

export class Logger {
    private static logLevel: LogLevel = LogLevel.INFO; // 默认日志级别
    private static initialized: boolean = false;

    static initialize() {
        if (!this.initialized) {
            const logLevelEnv = process.env.LOGGER_LEVEL_REAI_TOOLKIT;
            if (logLevelEnv) {
                this.logLevel = LogLevel[logLevelEnv as keyof typeof LogLevel] || LogLevel.INFO;
            }
            this.initialized = true;
        }
    }

    private static getCurrentTime(): string {
        return new Date().toLocaleString();
    }

    private static logMessage(level: string, ...args: any) {
        const currentTime = this.getCurrentTime();
        console.log(`${LOGGER_PREFIX}[${level}] [${currentTime}]`, ...args);
    }

    static error(...args: any) {
        this.initialize();
        if (this.logLevel >= LogLevel.ERROR) {
            this.logMessage("ERROR", ...args);
        }
    }

    static warn(...args: any) {
        this.initialize();
        if (this.logLevel >= LogLevel.WARN) {
            this.logMessage("WARN", ...args);
        }
    }

    static info(...args: any) {
        this.initialize();
        if (this.logLevel >= LogLevel.INFO) {
            this.logMessage("INFO", ...args);
        }
    }

    static debug(...args: any) {
        this.initialize();
        if (this.logLevel >= LogLevel.DEBUG) {
            this.logMessage("DEBUG", ...args);
        }
    }

    static log(type: LogLevel, ...args: any) {
        this.initialize();
        if (this.logLevel >= type) {
            this.logMessage(LogLevel[type], ...args);
        }
    }
}