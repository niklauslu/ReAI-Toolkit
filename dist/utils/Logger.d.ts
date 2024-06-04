export declare enum LogLevel {
    OFF = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}
export declare class Logger {
    private static logLevel;
    private static initialized;
    static initialize(): void;
    private static getCurrentTime;
    private static logMessage;
    static error(...args: any): void;
    static warn(...args: any): void;
    static info(...args: any): void;
    static debug(...args: any): void;
    static log(type: LogLevel, ...args: any): void;
}
