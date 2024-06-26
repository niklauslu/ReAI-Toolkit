import { ReAITookKitMessageHandler, ReAIToolkitConfig } from "./types";
export declare class ReAIToolKit {
    private toolId;
    private appId;
    private appSecret;
    private apiHost;
    private redisHost;
    private redisPort;
    private redisUsername;
    private redisPassword;
    private redisEnableReadyCheck;
    private registrar?;
    private redisClient?;
    private messageHandler?;
    constructor(config: ReAIToolkitConfig);
    register(params: {
        appId: string;
        appSecret: string;
    }): Promise<string>;
    start(handler?: ReAITookKitMessageHandler): Promise<void>;
    setMessageHandler(handler: ReAITookKitMessageHandler): void;
    private handleMessage;
    private replyMessageSend;
}
