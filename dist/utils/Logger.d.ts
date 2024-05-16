export declare enum LogLevel {
    OFF = 0,
    ERROR = 1,
    WARN = 2,
    INFO = 3,
    DEBUG = 4
}
export declare class Logger {
    private static logLevel;
    static initialize(): void;
    static error(...args: any): void;
    static warn(...args: any): void;
    static info(...args: any): void;
    static debug(...args: any): void;
}
