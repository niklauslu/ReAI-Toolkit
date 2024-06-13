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
    // private wsClient?: WebSocket
    wssHost;
    ws;
    accessToken;
    messageHandlerMethod = "subscribe";
    heartbeatInterval;
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
        Logger_1.Logger.debug('连接地址:', addr);
        const client = new ws_1.WebSocket(addr);
        client.onopen = (e) => {
            Logger_1.Logger.info('WebSocket connection opened', e.type);
            this.ws = client;
            this.startHeartbeat();
        };
        client.onmessage = (e) => {
            const data = e.data;
            Logger_1.Logger.debug('收到消息:', data.toString().length);
            try {
                const message = data.toString();
                if (message.toLowerCase() === "pong") {
                    Logger_1.Logger.debug('收到心跳:', new Date().toLocaleString());
                    return;
                }
                else if (message.startsWith("Unauthorized")) {
                    Logger_1.Logger.error('认证失败:', message);
                    client.close();
                    return;
                }
                else if (!message.startsWith("{") || !message.endsWith("}")) {
                    Logger_1.Logger.debug('收到无效消息:', message);
                    return;
                }
                const json = JSON.parse(message);
                if (json.method === this.messageHandlerMethod) {
                    const message = json.params?.data;
                    this.handleMessage(message);
                }
            }
            catch (error) {
                Logger_1.Logger.error('解析消息出错:', error);
            }
        };
        client.onclose = (e) => {
            Logger_1.Logger.warn('WebSocket connection closed', e.code, e.reason);
            this.stopHeartbeat();
            this.ws = undefined; // 重连
            // if (e.code === 1006) {
            //     return
            // }
            setTimeout(() => {
                this.start(this.messageHandler);
                Logger_1.Logger.info("WebSocket connection reconnected");
            }, 500);
        };
        client.onerror = (e) => {
            Logger_1.Logger.error('WebSocket error:', e.message || e.error);
            client.close(1000);
        };
        // this.wsClient.on('message', (data) => {
        //     Logger.debug('收到消息:', data.toString().length);
        //     try {
        //         const message = data.toString();
        //         if (message.toLowerCase() === "pong") {
        //             Logger.debug('收到心跳:', new Date().toLocaleString());
        //             return
        //         } else if (!message.startsWith("{") || !message.endsWith("}")) {
        //             Logger.debug('收到无效消息:', message);
        //             return
        //         }
        //         const json = JSON.parse(message) as ReAIToolkitReceiveJson
        //         if (json.method === this.messageHandlerMethod) {
        //             const message = json.params?.data as ReAIToolkitReceiveMessage;
        //             this.handleMessage(message);
        //         }
        //     } catch (error) {
        //         Logger.error('解析消息出错:', error);
        //     }
        // });
        // this.wsClient.on('close', (code: number, reason: string) => {
        //     Logger.warn('WebSocket connection closed',  code, reason);
        //     this.stopHeartbeat();
        //     if (code === 401) {
        //         return
        //     }
        //     this.wsClient = undefined // 重连
        //     setTimeout(() => {
        //         this.start(this.messageHandler)
        //         Logger.info("WebSocket connection reconnected")
        //     }, 500)
        // });
        // this.wsClient.on('error', (err) => {
        //     Logger.error('WebSocket error:', err);
        //     this.wsClient?.close()
        // });
    }
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
    async handleMessage(message) {
        if (!message) {
            Logger_1.Logger.warn('Received empty message');
            return;
        }
        Logger_1.Logger.debug(`Received message on channel ${message.channelKey}}`);
        Logger_1.Logger.debug('Message action:', message.action);
        Logger_1.Logger.debug('Message hook', message.attrs?.hook);
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
        this.ws?.send(JSON.stringify(data));
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
    startHeartbeat() {
        const heartbeatIntervalMs = parseInt(process.env.REAI_TOOLKIT_HEARTBEAT_MS) || 45000; // 心跳间隔时间（毫秒）
        this.heartbeatInterval = setInterval(() => {
            Logger_1.Logger.info('Heartbeat: Server is alive');
            // 这里可以添加更多心跳检测逻辑，例如检查依赖服务的健康状态
            this.ws?.send('ping', (err) => {
                if (err) {
                    Logger_1.Logger.warn('Heartbeat: Ping failed');
                }
                else {
                    Logger_1.Logger.info('Heartbeat: Ping sent');
                }
            });
        }, heartbeatIntervalMs);
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = undefined;
        }
    }
}
exports.ReAIToolKit = ReAIToolKit;
