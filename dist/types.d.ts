/// <reference types="node" />
export interface ReAIToolkitConfig {
    appId: string;
    appSecret: string;
    toolId: string;
    apiHost?: string;
    wssHost?: string;
    messageHandlerMethod?: string;
}
export interface ReAIToolkitReceiveJson {
    jsonrpc: string;
    id: string;
    result?: any;
    method?: string;
    params?: ReAIToolkitParamsSubscribe;
}
export interface ReAIToolkitParamsSubscribe {
    data: ReAIToolkitReceiveMessage;
    _channel: string;
}
export interface ReAIToolkitReceiveMessage {
    channelKey: string;
    role: ReAIToolKitMessageRole;
    content: string;
    msgId: string;
    action: ReAIToolKitMessageAction;
    attrs?: Record<string, any>;
    file?: Record<string, any>;
}
export interface ReAIToolKitReplyMessage {
    code: 200 | 202;
    content?: string;
    attrs?: Record<string, any>;
    hook?: ReAIToolKitMessageHook;
    file?: {
        ext: string;
        type: string | "base64" | "buffer";
        data: string | Buffer;
    };
}
export type ReAIToolKitMessageHook = "start" | "replace" | "end";
export type ReAIToolKitMessageRole = "assistant" | "user" | "function";
export type ReAIToolKitMessageAction = "before" | "on" | 'after';
export type ReAITookKitMessageHandler = (message: ReAIToolkitReceiveMessage) => Promise<ReAIToolKitReplyMessage>;
