"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReAIToolKit = void 0;
const ws_1 = require("ws");
const Logger_1 = require("./utils/Logger");
const axios_1 = __importDefault(require("axios"));
class ReAIToolKit {
    toolId;
    appId;
    appSecret;
    apiHost;
    registrar;
    // private redisClient?: RedisClient
    messageHandler;
    wsClient;
    wssHost;
    accessToken;
    messageHandlerMethod = "subscribe";
    constructor(config) {
        this.toolId = config.toolId;
        this.appId = config.appId;
        this.appSecret = config.appSecret;
        this.apiHost = config.apiHost || process.env.REAI_API_HOST || 'https://api.ai.cloudos.com';
        this.wssHost = config.wssHost || process.env.REAI_WSS_HOST || 'wss://api.ai.cloudos.com';
        if (config.messageHandlerMethod)
            this.messageHandlerMethod = config.messageHandlerMethod;
    }
    async start(handler) {
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
                await this.getAccessToken();
            }
            catch (err) {
                throw new Error('获取accessToken失败');
            }
        }
        if (handler) {
            this.setMessageHandler(handler);
        }
        // 实际的启动逻辑
        // const channel = `server:${this.appId}:${this.toolId}`
        // await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
        const addr = `${this.wssHost}/app/${this.appId}/${this.toolId}?token=${this.accessToken}`;
        this.wsClient = new ws_1.WebSocket(addr);
        this.wsClient.on('message', (data) => {
            try {
                const json = JSON.parse(data.toString());
                if (json.method === this.messageHandlerMethod) {
                    const message = json.result;
                    this.handleMessage(message);
                }
            }
            catch (error) {
                Logger_1.Logger.error('解析消息出错:', error);
            }
        });
        this.wsClient.on('open', () => {
            Logger_1.Logger.info('WebSocket connection opened');
        });
        this.wsClient.on('close', () => {
            Logger_1.Logger.warn('WebSocket connection closed');
            this.wsClient = undefined; // 重连
            setTimeout(() => {
                this.start(this.messageHandler);
                Logger_1.Logger.info("WebSocket connection reconnected");
            }, 500);
        });
        this.wsClient.on('error', (err) => {
            Logger_1.Logger.error('WebSocket error:', err);
            this.wsClient?.close();
        });
    }
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
    async handleMessage(message) {
        Logger_1.Logger.debug(`Received message on channel ${message.channelKey}`);
        // 在这里根据 message 的内容进行处理
        let replyData = {
            code: 200,
            content: message.content
        };
        // 回复消息
        const replyChannel = message.channelKey; // 这个频道可以基于接收到的消息动态确定
        const receiceAction = message.action;
        if (this.messageHandler) {
            replyData = await this.messageHandler(message);
        }
        else {
            Logger_1.Logger.debug('No message handler set');
        }
        // 转换回复数据为 JSON 字符串
        this.replyMessageSend(replyData, receiceAction, replyChannel);
        return;
    }
    replyMessageSend(message, action, channelKey) {
        if (action === "before")
            message.hook = "start";
        if (action === "after")
            message.hook = "end";
        if (action === "on")
            message.hook = "replace";
        // this.redisClient?.publish(channelKey, JSON.stringify(message));
        const data = {
            jsonrpc: "2.0",
            id: channelKey,
            method: "redis.publish",
            params: message
        };
        this.wsClient?.send(JSON.stringify(data));
    }
    async getAccessToken() {
        try {
            const result = await axios_1.default.post(this.apiHost + '/oauth/client_credentials', {
                client_id: this.appId,
                client_secret: this.appSecret,
                grant_type: 'client_credentials',
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    // 请求返回 JSON 格式
                    'Accept': 'application/json',
                },
            });
            if (result.status !== 200) {
                throw new Error('获取 AccessToken 失败');
            }
            const data = result.data.data.token;
            Logger_1.Logger.debug('获取 AccessToken 成功', data);
            let { accessToken, expiresIn } = data;
            this.accessToken = accessToken;
            // 更新token
            if (expiresIn) {
                // let expires = parseInt((expiresIn / 1000).toString())
                if (expiresIn > 2147483647)
                    expiresIn = 2147483647;
                setTimeout(() => {
                    this.getAccessToken();
                }, expiresIn);
            }
        }
        catch (error) {
            return Promise.reject(error.message);
        }
    }
}
exports.ReAIToolKit = ReAIToolKit;
