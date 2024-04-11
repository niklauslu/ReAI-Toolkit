// src/redisClient.ts
import Redis from 'ioredis';
import Debug from 'debug';
import { ReAIToolkitRedisMessage } from '../types';

const debug = Debug('reai-toolkit:RedisClient');

interface RedisConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    enableReadyCheck: boolean;
}

export class RedisClient {
    private client: Redis;

    constructor(config: RedisConfig) {
        // 初始化 Redis 客户端，并连接到 Redis 服务器
        this.client = new Redis({ 
            host: config.host || 'localhost', // 应替换为实际的 Redis 服务器地址
            port: config.port || 6379,        // 应替换为实际的 Redis 端口
            username: config.username,
            password: config.password,
            enableReadyCheck: config.enableReadyCheck,
        })

        this.client.on('error', (err) => {
            console.error('Redis Client Error', err);
            debug('Redis Client Error: %O', err);
        });

        debug('Redis client initialized');
    }

    // 订阅指定的 Redis 频道
    async subscribe(channel: string, messageHandler: (message: ReAIToolkitRedisMessage) => void): Promise<void> {
        await this.client.subscribe(channel);
        this.client.on('message', (channel, message) => {
            debug(`Received message on ${channel}: ${message}`);

            try {
                const parsedMessage: ReAIToolkitRedisMessage = JSON.parse(message);
                messageHandler(parsedMessage);
            } catch (error) {
                console.error('Error parsing message from Redis:', error);
                debug('Error parsing message: %O', error);
            }
        });
    }
    // 其他方法...

    async publish(channel: string, message: string): Promise<void> {
        await this.client.publish(channel, message);
        debug(`Published message to ${channel}`);
    }
}
