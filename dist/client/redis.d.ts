import { ReAIToolkitRedisMessage } from '../types';
interface RedisConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    enableReadyCheck: boolean;
}
export declare class RedisClient {
    private client;
    constructor(config: RedisConfig);
    subscribe(channel: string, messageHandler: (message: ReAIToolkitRedisMessage) => void): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
}
export {};
