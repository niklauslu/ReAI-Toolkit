
import { Registrar } from "./register";
import { WebSocket } from 'ws';

import { ReAITookKitMessageHandler, ReAIToolKitMessageAction, ReAIToolKitReplyMessage, ReAIToolkitConfig, ReAIToolkitReceiveJson, ReAIToolkitReceiveMessage } from "./types";
import { Logger } from "./utils/Logger";
import axios from "axios";


export class ReAIToolKit {

    private toolId: string;
    private appId: string;
    private appSecret: string;

    private apiHost: string;

    private registrar?: Registrar;

    // private redisClient?: RedisClient
    private messageHandler?: ReAITookKitMessageHandler
    private wsClient?: WebSocket
    private wssHost: string;

    private accessToken?: string

    private messageHandlerMethod: string = "subscribe"

    private heartbeatInterval?: NodeJS.Timeout;

    constructor(config: ReAIToolkitConfig) {
        this.toolId = config.toolId

        this.appId = config.appId
        this.appSecret = config.appSecret

        this.apiHost = config.apiHost || process.env.REAI_API_HOST || 'https://api.ai.cloudos.com';
        this.wssHost = config.wssHost || process.env.REAI_WSS_HOST || 'wss://api.ai.cloudos.com';

        if (config.messageHandlerMethod) this.messageHandlerMethod = config.messageHandlerMethod

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

        if (!this.accessToken) {
            try {
                await this.getAccessToken()
            } catch (err) {
                throw new Error('获取accessToken失败')
            }

        }

        if (handler) {
            this.setMessageHandler(handler);
        }

        // 实际的启动逻辑
        // const channel = `server:${this.appId}:${this.toolId}`
        // await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
        const addr = `${this.wssHost}/app/${this.appId}/${this.toolId}?token=${this.accessToken}`
        Logger.debug('连接地址:', addr)
        this.wsClient = new WebSocket(addr);

        this.wsClient.on('message', (data) => {
            Logger.debug('收到消息:', data.toString().length);
            try {
                const json = JSON.parse(data.toString()) as ReAIToolkitReceiveJson
                if (json.method === this.messageHandlerMethod) {
                    const message = json.params?.data as ReAIToolkitReceiveMessage;
                    this.handleMessage(message);
                }

            } catch (error) {
                Logger.error('解析消息出错:', error);
            }

        });

        this.wsClient.on('open', () => {
            Logger.info('WebSocket connection opened');
            this.startHeartbeat();
        });

        this.wsClient.on('close', () => {

            Logger.warn('WebSocket connection closed');
            this.stopHeartbeat();

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
        if (!message) {
            Logger.warn('Received empty message');
            return;
        }

        Logger.debug(`Received message on channel ${message.channelKey}}`);
        Logger.debug('Message action:', message.action);
        Logger.debug('Message hook', message.attrs?.hook)

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
        const data = {
            jsonrpc: "2.0",
            id: channelKey,
            method: "redis.publish",
            params: message
        }
        this.wsClient?.send(JSON.stringify(data));
    }

    async getAccessToken(): Promise<void> {
        try {
            const result = await axios.post(this.apiHost + '/oauth/client_credentials', {
                client_id: this.appId,
                client_secret: this.appSecret,
                grant_type: 'client_credentials',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 请求返回 JSON 格式
                    'Accept': 'application/json',
                },
            })
            if (result.status !== 200) {
                throw new Error('获取 AccessToken 失败')
            }

            const data = result.data.data.token
            Logger.debug('获取 AccessToken 成功', data)
            let { accessToken, expiresIn } = data
            this.accessToken = accessToken
            // 更新token
            if (expiresIn) {
                // let expires = parseInt((expiresIn / 1000).toString())
                if (expiresIn > 2147483647) expiresIn = 2147483647
                setTimeout(() => {
                    this.getAccessToken()
                }, expiresIn)
            }


        } catch (error: any) {
            return Promise.reject(error.message)
        }
    }

    private startHeartbeat() {
        const heartbeatIntervalMs = 5000; // 心跳间隔时间（毫秒）

        this.heartbeatInterval = setInterval(() => {
            Logger.info('Heartbeat: Server is alive');
            // 这里可以添加更多心跳检测逻辑，例如检查依赖服务的健康状态
            this.wsClient?.send('ping', (err) => {
                if (err) {
                    Logger.warn('Heartbeat: Ping failed');
                } else {
                    Logger.info('Heartbeat: Ping sent');
                }
            });
        }, heartbeatIntervalMs);
    }

    private stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }

}