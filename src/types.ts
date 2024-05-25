export interface ReAIToolkitConfig {
    appId: string;
    appSecret: string;
    toolId: string;

    apiHost?: string,
    wssHost?: string,
    
    messageHandlerMethod?: string
    // redisHost?: string,
    // redisPort?: number,
    // redisUsername?: string,
    // redisPassword?: string,
    // redisEnableReadyCheck?: boolean,

}

export interface ReAIToolkitReceiveJson {
    jsonrpc: string;
    id: string,
    result: ReAIToolkitReceiveMessage | any,
    method?: string,
    params?: any
}
export interface ReAIToolkitReceiveMessage {
    channelKey: string;
    role: ReAIToolKitMessageRole;
    content: string;
    msgId: string,
    action: ReAIToolKitMessageAction;
    attrs?: Record<string, any>;
}

export interface ReAIToolKitReplyMessage {
    code: 200 | 202;
    content?: string;
    attrs?: Record<string, any>;
    hook?: ReAIToolKitMessageHook;
    file?: {
        ext: string,
        type: string | "base64" | "buffer",
        data: string | Buffer
    };
}

export type ReAIToolKitMessageHook = "start" | "replace" | "end"
export type ReAIToolKitMessageRole = "assistant" | "user" | "function";
export type ReAIToolKitMessageAction = "before" | "on" | 'after';

export type ReAITookKitMessageHandler = (message: ReAIToolkitReceiveMessage) => Promise<ReAIToolKitReplyMessage>;