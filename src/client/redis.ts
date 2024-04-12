// src/redisClient.ts
import Redis from 'ioredis';
import Debug from 'debug';
import { ReAIToolkitReceiveMessage } from '../types';

const debug = Debug('reai-toolkit:RedisClient');

interface RedisConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    enableReadyCheck: boolean;
}

export class RedisClient {
    private publishClient: Redis; // 用于发布消息的客户端
    private subscribeClient: Redis; // 用于订阅消息的客户端

    constructor(config: RedisConfig) {
        // 初始化用于发布和订阅的不同 Redis 客户端
        this.publishClient = new Redis({ 
            host: config.host || 'localhost', // 替换为实际的 Redis 服务器地址
            port: config.port || 6379,        // 替换为实际的 Redis 端口
            username: config.username,
            password: config.password,
            enableReadyCheck: config.enableReadyCheck,
        });

        this.subscribeClient = new Redis({ 
            host: config.host || 'localhost', // 替换为实际的 Redis 服务器地址
            port: config.port || 6379,        // 替换为实际的 Redis 端口
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
    async subscribe(channel: string, messageHandler: (message: ReAIToolkitReceiveMessage) => void): Promise<void> {
        await this.subscribeClient.subscribe(channel);
        this.subscribeClient.on('message', (channel, message) => {
            debug(`接收到 ${channel} 的消息: ${message}`);

            try {
                const parsedMessage: ReAIToolkitReceiveMessage = JSON.parse(message);
                messageHandler(parsedMessage);
            } catch (error) {
                console.error('从 Redis 解析消息时出错:', error);
                debug('解析消息出错: %O', error);
            }
        });
    }

    // 使用发布客户端向特定的 Redis 频道发布消息
    async publish(channel: string, message: string): Promise<void> {
        await this.publishClient.publish(channel, message);
        debug(`已向 ${channel} 发布消息`);
    }
}

