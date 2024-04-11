export declare class Registrar {
    private appId;
    private appSecret;
    private apiClient;
    private toolId?;
    constructor(baseURL: string, appId: string, appSecret: string);
    register(): Promise<string>;
    getToolId(): string | undefined;
}
