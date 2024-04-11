"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReAIToolKit = void 0;
const redis_1 = require("./client/redis");
const register_1 = require("./register");
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('reai-toolkit:ReAIToolKit');
class ReAIToolKit {
    toolId;
    appId;
    appKey;
    apiHost;
    redisHost;
    redisPort;
    registrar;
    redisClient;
    messageHandler;
    constructor(config) {
        this.appId = config.appId;
        this.toolId = config.toolId;
        this.appKey = config.appKey;
        this.apiHost = config.apiHost || process.env.REAI_API_HOST || 'https://api.ai.cloudos.com';
        this.redisHost = config.redisHost || process.env.REAI_REDIS_HOST || 'api.cloudos.com';
        this.redisPort = config.redisPort || parseInt(process.env.REAI_REDIS_PORT) || 6379;
    }
    // 注册获取toolId
    async register(params) {
        this.registrar = new register_1.Registrar(this.apiHost, params.appId, params.appSecret);
        this.toolId = await this.registrar.register();
        return this.toolId;
    }
    // 启动
    async start(handler) {
        if (!this.toolId) {
            console.error('Tool not registered');
            throw new Error('Tool not registered');
        }
        if (handler) {
            this.setMessageHandler(handler);
        }
        // 实际的启动逻辑
        this.redisClient = new redis_1.RedisClient({
            host: this.redisHost,
            port: this.redisPort,
            username: `app:${this.appId}`,
            password: this.appKey,
            enableReadyCheck: true
        });
        const channel = `server:${this.appId}:${this.toolId}`;
        await this.redisClient.subscribe(channel, this.handleMessage.bind(this));
    }
    setMessageHandler(handler) {
        this.messageHandler = handler;
    }
    async handleMessage(message) {
        debug(`Received message on channel ${message.channelKey}`);
        // 在这里根据 message 的内容进行处理
        if (this.messageHandler) {
            let replyData = await this.messageHandler(message);
            replyData.hook = "end";
            if (message.action === "before")
                replyData.hook = "start";
            if (message.action === "on")
                replyData.hook = "replace";
            // 转换回复数据为 JSON 字符串
            const replyMessage = JSON.stringify(replyData);
            // 回复消息
            const replyChannel = message.channelKey; // 这个频道可以基于接收到的消息动态确定
            await this.redisClient?.publish(replyChannel, replyMessage);
        }
        else {
            debug('No message handler set');
        }
    }
}
exports.ReAIToolKit = ReAIToolKit;
