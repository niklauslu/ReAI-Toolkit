import { RedisClient } from "./client/redis";
import { Registrar } from "./register";

import Debug from 'debug';
import { ReAITookKitMessageHandler, ReAIToolkitConfig, ReAIToolkitRedisMessage } from "./types";

const debug = Debug('reai-toolkit:ReAIToolKit');

export class ReAIToolKit {

    private toolId: string;
    private appId: string;
    private appKey: string;
    
    private apiHost: string;
    private redisHost: string;
    private redisPort: number;

    private registrar?: Registrar;

    private redisClient?: RedisClient
    private messageHandler?: ReAITookKitMessageHandler

    constructor(config: ReAIToolkitConfig) {
        this.appId = config.appId
        this.toolId = config.toolId
        this.appKey = config.appKey

        this.apiHost = config.apiHost || process.env.REAI_API_HOST || 'https://api.ai.cloudos.com';
        this.redisHost = config.redisHost || process.env.REAI_REDIS_HOST || 'api.cloudos.com';
        this.redisPort = config.redisPort || parseInt(process.env.REAI_REDIS_PORT as string) || 6379;
    }

    // 注册获取toolId
    async register(params: { appId: string, appSecret: string }): Promise<string> {

        this.registrar = new Registrar(this.apiHost, params.appId, params.appSecret);
        this.toolId = await this.registrar.register();
        return this.toolId;
    }

    // 启动
    async start(handler?: ReAITookKitMessageHandler): Promise<void> {
        if (!this.toolId) {
            console.error('Tool not registered');
            throw new Error('Tool not registered');
        }

        if (handler) {
            this.setMessageHandler(handler);
        }
        
        // 实际的启动逻辑
        this.redisClient = new RedisClient({
            host: this.redisHost,
            port: this.redisPort,
            username: `app:${this.appId}`,
            password: this.appKey,
            enableReadyCheck: true
        })

        const channel = `server:${this.appId}:${this.toolId}`
        await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
    }

    setMessageHandler(handler: ReAITookKitMessageHandler): void {
        this.messageHandler = handler;
    }

    private async handleMessage(message: ReAIToolkitRedisMessage): Promise<void> {
        debug(`Received message on channel ${message.channelKey}`);
        // 在这里根据 message 的内容进行处理
        if (this.messageHandler) {
            let replyData = await this.messageHandler(message);
            replyData.hook = "end"
            if (message.action === "before") replyData.hook = "start"
            if (message.action === "on") replyData.hook = "replace"

            // 转换回复数据为 JSON 字符串
            const replyMessage = JSON.stringify(replyData);

            // 回复消息
            const replyChannel = message.channelKey; // 这个频道可以基于接收到的消息动态确定

            await this.redisClient?.publish(replyChannel, replyMessage);
        } else {
            debug('No message handler set');
        }

    }

}