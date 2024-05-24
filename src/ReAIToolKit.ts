
import { Registrar } from "./register";
import { WebSocket } from 'ws';

import { ReAITookKitMessageHandler, ReAIToolKitMessageAction, ReAIToolKitReplyMessage, ReAIToolkitConfig, ReAIToolkitReceiveMessage } from "./types";
import { Logger } from "./utils/Logger";


export class ReAIToolKit {

    private toolId: string;
    private appId: string;
    private appSecret: string;

    private apiHost: string;

    private registrar?: Registrar;

    // private redisClient?: RedisClient
    private messageHandler?: ReAITookKitMessageHandler
    private wsClient?: WebSocket

    constructor(config: ReAIToolkitConfig) {
        this.toolId = config.toolId

        this.appId = config.appId
        this.appSecret = config.appSecret

        this.apiHost = config.apiHost || process.env.REAI_API_HOST || 'https://api.ai.cloudos.com';

    }

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
        const channel = `server:${this.appId}:${this.toolId}`
        // await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
        this.wsClient = new WebSocket(this.apiHost + '/wss/?channel=' + channel);

        this.wsClient.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString()) as ReAIToolkitReceiveMessage;
                this.handleMessage(message);
            } catch (error) {
                Logger.error('解析消息出错:', error);
            }
            
        });

        this.wsClient.on('open', () => {
            Logger.info('WebSocket connection opened');
        });

        this.wsClient.on('close', () => {

            Logger.warn('WebSocket connection closed');
            this.wsClient = undefined // 重连
            setTimeout(() => {
                this.start(this.messageHandler)
                Logger.info("WebSocket connection reconnected")
            }, 500)
           
        });

        this.wsClient.on('error', (err) => {
            Logger.error('WebSocket error:', err);
            this.wsClient?.close()
        });
    }

    setMessageHandler(handler: ReAITookKitMessageHandler): void {
        this.messageHandler = handler;
    }

    private async handleMessage(message: ReAIToolkitReceiveMessage): Promise<void> {
        Logger.debug(`Received message on channel ${message.channelKey}`);

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
            Logger.debug('No message handler set');
        }

        // 转换回复数据为 JSON 字符串
        this.replyMessageSend(replyData, receiceAction, replyChannel)
        return

    }

    private replyMessageSend(message: ReAIToolKitReplyMessage, action: ReAIToolKitMessageAction, channelKey: string) {
        if (action === "before") message.hook = "start"
        if (action === "after") message.hook = "end"
        if (action === "on") message.hook = "replace"

        // this.redisClient?.publish(channelKey, JSON.stringify(message));
        this.wsClient?.send(JSON.stringify(message));
    }

}