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

    static initialize() {
        const logLevelEnv = process.env.LOGGER_LEVEL_REAI_TOOLKIT;
        if (logLevelEnv) {
            this.logLevel = LogLevel[logLevelEnv as keyof typeof LogLevel] || LogLevel.INFO;
        }
    }

    static error(...args: any) {
        this.initialize()
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(LOGGER_PREFIX, ...args);
        }
    }

    static warn(...args: any) {
        this.initialize()
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(LOGGER_PREFIX, ...args);
        }
    }

    static info(...args: any) {
        this.initialize()
        if (this.logLevel >= LogLevel.INFO) {
            console.log(LOGGER_PREFIX, ...args);
        }
    }

    static debug(...args: any) {
        this.initialize()
        if (this.logLevel >= LogLevel.DEBUG) {
            console.debug(LOGGER_PREFIX, ...args);
        }
    }
}
