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
    static initialize() {
        const logLevelEnv = process.env.LOGGER_LEVEL_REAI_TOOLKIT;
        if (logLevelEnv) {
            this.logLevel = LogLevel[logLevelEnv] || LogLevel.INFO;
        }
    }
    static error(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.ERROR) {
            console.error(LOGGER_PREFIX, ...args);
        }
    }
    static warn(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.WARN) {
            console.warn(LOGGER_PREFIX, ...args);
        }
    }
    static info(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.INFO) {
            console.log(LOGGER_PREFIX, ...args);
        }
    }
    static debug(...args) {
        this.initialize();
        if (this.logLevel >= LogLevel.DEBUG) {
            console.debug(LOGGER_PREFIX, ...args);
        }
    }
}
exports.Logger = Logger;
