import { ReAITookKitMessageHandler, ReAIToolkitConfig } from "./types";
export declare class ReAIToolKit {
    private toolId;
    private appId;
    private appSecret;
    private apiHost;
    private registrar?;
    private messageHandler?;
    private wsClient?;
    private wssHost;
    private accessToken?;
    private messageHandlerMethod;
    private heartbeatInterval?;
    constructor(config: ReAIToolkitConfig);
    start(handler?: ReAITookKitMessageHandler): Promise<void>;
    setMessageHandler(handler: ReAITookKitMessageHandler): void;
    private handleMessage;
    private replyMessageSend;
    getAccessToken(): Promise<void>;
    private startHeartbeat;
    private stopHeartbeat;
}
