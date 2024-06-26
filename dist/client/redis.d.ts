import { ReAIToolkitReceiveMessage } from '../types';
interface RedisConfig {
    host: string;
    port: number;
    username?: string;
    password?: string;
    enableReadyCheck: boolean;
}
export declare class RedisClient {
    private publishClient;
    private subscribeClient;
    constructor(config: RedisConfig);
    subscribe(channel: string, messageHandler: (message: ReAIToolkitReceiveMessage) => void): Promise<void>;
    publish(channel: string, message: string): Promise<void>;
}
export {};
