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
    client;
    constructor(config) {
        // 初始化 Redis 客户端，并连接到 Redis 服务器
        this.client = new ioredis_1.default({
            host: config.host || 'localhost', // 应替换为实际的 Redis 服务器地址
            port: config.port || 6379, // 应替换为实际的 Redis 端口
            username: config.username,
            password: config.password,
            enableReadyCheck: config.enableReadyCheck,
        });
        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
            debug('Redis Client Error: %O', err);
        });
        console.info('Redis client initialized');
    }
    // 订阅指定的 Redis 频道
    async subscribe(channel, messageHandler) {
        await this.client.subscribe(channel);
        this.client.on('message', (channel, message) => {
            debug(`Received message on ${channel}: ${message}`);
            try {
                const parsedMessage = JSON.parse(message);
                messageHandler(parsedMessage);
            }
            catch (error) {
                console.error('Error parsing message from Redis:', error);
                debug('Error parsing message: %O', error);
            }
        });
    }
    // 其他方法...
    async publish(channel, message) {
        await this.client.publish(channel, message);
        debug(`Published message to ${channel}`);
    }
}
exports.RedisClient = RedisClient;
