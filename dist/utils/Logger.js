"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = exports.LogLevel = void 0;
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["OFF"] = 0] = "OFF";
    LogLevel[LogLevel["ERROR"] = 1] = "ERROR";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["INFO"] = 3] = "INFO";
    LogLevel[LogLevel["DEBUG"] = 4] = "DEBUG";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
const LOGGER_PREFIX = process.env.LOGGER_PREFIX || "[ReAI-TOOLKIT]";
class Logger {
    static logLevel = LogLevel.INFO; // 默认日志级别
    static initialized = false;
    static initialize() {
        if (!this.initialized) {
            const logLevelEnv = process.env.LOGGER_LEVEL_REAI_TOOLKIT;
            if (logLevelEnv) {
                this.logLevel = LogLevel[logLevelEnv] || LogLevel.INFO;
            }
            this.initialized = true;
        }
    }
    static getCurrentTime() {
        return new Date().toLocaleString();
    }
    static logMessage(level, ...args) {
        const currentTime = this.getCurrentTime();
        console.log(`${LOGGER_PREFIX}[${level}] [${currentTime}]`, ...args);
    }
    static error(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.ERROR) {
            this.logMessage("ERROR", ...args);
        }
    }
    static warn(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.WARN) {
            this.logMessage("WARN", ...args);
        }
    }
    static info(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.INFO) {
            this.logMessage("INFO", ...args);
        }
    }
    static debug(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.DEBUG) {
            this.logMessage("DEBUG", ...args);
        }
    }
    static log(type, ...args) {
        this.initialize();
        if (this.logLevel >= type) {
            this.logMessage(LogLevel[type], ...args);
        }
    }
}
exports.Logger = Logger;
