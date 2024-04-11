export declare class ApiClient {
    private axiosInstance;
    constructor(baseURL: string);
    registerTool(appId: string, appSecret: string): Promise<string>;
}
