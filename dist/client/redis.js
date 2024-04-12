"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RedisClient = void 0;
// src/redisClient.ts
const ioredis_1 = __importDefault(require("ioredis"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('reai-toolkit:RedisClient');
class RedisClient {
    publishClient; // 用于发布消息的客户端
    subscribeClient; // 用于订阅消息的客户端
    constructor(config) {
        // 初始化用于发布和订阅的不同 Redis 客户端
        this.publishClient = new ioredis_1.default({
            host: config.host || 'localhost', // 替换为实际的 Redis 服务器地址
            port: config.port || 6379, // 替换为实际的 Redis 端口
            username: config.username,
            password: config.password,
            enableReadyCheck: config.enableReadyCheck,
        });
        this.subscribeClient = new ioredis_1.default({
            host: config.host || 'localhost', // 替换为实际的 Redis 服务器地址
            port: config.port || 6379, // 替换为实际的 Redis 端口
            username: config.username,
            password: config.password,
            enableReadyCheck: config.enableReadyCheck,
        });
        // 对两个客户端进行错误处理
        this.publishClient.on('error', (err) => {
            console.error('Redis 发布客户端错误', err);
            debug('Redis 发布客户端错误: %O', err);
        });
        this.subscribeClient.on('error', (err) => {
            console.error('Redis 订阅客户端错误', err);
            debug('Redis 订阅客户端错误: %O', err);
        });
        console.info('Redis 客户端已初始化');
    }
    // 使用订阅客户端订阅特定的 Redis 频道
    async subscribe(channel, messageHandler) {
        await this.subscribeClient.subscribe(channel);
        this.subscribeClient.on('message', (channel, message) => {
            debug(`接收到 ${channel} 的消息: ${message}`);
            try {
                const parsedMessage = JSON.parse(message);
                messageHandler(parsedMessage);
            }
            catch (error) {
                console.error('从 Redis 解析消息时出错:', error);
                debug('解析消息出错: %O', error);
            }
        });
    }
    // 使用发布客户端向特定的 Redis 频道发布消息
    async publish(channel, message) {
        await this.publishClient.publish(channel, message);
        debug(`已向 ${channel} 发布消息`);
    }
}
exports.RedisClient = RedisClient;
