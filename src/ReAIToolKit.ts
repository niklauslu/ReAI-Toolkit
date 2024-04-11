import { RedisClient } from "./client/redis";
import { Registrar } from "./register";

import Debug from 'debug';
import { ReAITookKitMessageHandler, ReAIToolKitMessageAction, ReAIToolKitReplyMessage, ReAIToolkitConfig, ReAIToolkitReceiveMessage } from "./types";

const debug = Debug('reai-toolkit:ReAIToolKit');

export class ReAIToolKit {

    private toolId: string;
    private appId: string;
    private appSecret: string;

    private apiHost: string;
    private redisHost: string;
    private redisPort: number;

    private registrar?: Registrar;

    private redisClient?: RedisClient
    private messageHandler?: ReAITookKitMessageHandler

    constructor(config: ReAIToolkitConfig) {
        this.toolId = config.toolId

        this.appId = config.appId
        this.appSecret = config.appSecret

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
    async start(
        handler?: ReAITookKitMessageHandler,
    ): Promise<void> {
        if (!this.toolId) {
            console.error('Tool not registered');
            throw new Error('Tool not registered');
        }

        if (!this.appId || !this.appSecret) {
            console.error('AppId or AppSecret not provided');
            throw new Error('AppId or AppSecret not provided');
        }

        if (handler) {
            this.setMessageHandler(handler);
        }

        // 实际的启动逻辑
        this.redisClient = new RedisClient({
            host: this.redisHost,
            port: this.redisPort,
            username: `app:${this.appId}`,
            password: this.appSecret,
            enableReadyCheck: false
        })

        const channel = `server:${this.appId}:${this.toolId}`
        await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
    }

    setMessageHandler(handler: ReAITookKitMessageHandler): void {
        this.messageHandler = handler;
    }

    private async handleMessage(message: ReAIToolkitReceiveMessage): Promise<void> {
        debug(`Received message on channel ${message.channelKey}`);

        // 在这里根据 message 的内容进行处理
        let replyData: ReAIToolKitReplyMessage = {
            code: 200,
            content: message.content
        }
        // 回复消息
        const replyChannel = message.channelKey; // 这个频道可以基于接收到的消息动态确定
        const receiceAction = message.action;

        if (this.messageHandler) {
            replyData = await this.messageHandler(message);
        } else {
            debug('No message handler set');
        }

        // 转换回复数据为 JSON 字符串
        this.replyMessageSend(replyData, receiceAction, replyChannel)
        return

    }

    private replyMessageSend(message: ReAIToolKitReplyMessage, action: ReAIToolKitMessageAction, channelKey: string) {
        if (action === "before") message.hook = "start"
        if (action === "after") message.hook = "end"
        if (action === "on") message.hook = "replace"

        this.redisClient?.publish(channelKey, JSON.stringify(message));
    }

}