/// <reference types="node" />
export interface ReAIToolkitConfig {
    appId: string;
    appKey: string;
    toolId: string;
    apiHost?: string;
    redisHost?: string;
    redisPort?: number;
}
export interface ReAIToolkitRedisMessage {
    channelKey: string;
    role: ReAIToolKitRedisMessageRole;
    content: string;
    msgId: string;
    action: ReAIToolKitRedisMessageAction;
    attrs?: Record<string, any>;
}
export interface ReAIToolKitReplyMessage {
    code: 200 | 202;
    content?: string;
    attrs?: Record<string, any>;
    hook?: ReAIToolKitRedisMessageHook;
    file?: {
        exit: string;
        type: string | "base64" | "buffer";
        data: string | Buffer;
    };
}
export type ReAIToolKitRedisMessageHook = "start" | "replace" | "end";
export type ReAIToolKitRedisMessageRole = "assistant" | "user" | "function";
export type ReAIToolKitRedisMessageAction = "before" | "on" | 'after';
export type ReAITookKitMessageHandler = (message: ReAIToolkitRedisMessage) => Promise<ReAIToolKitReplyMessage>;
