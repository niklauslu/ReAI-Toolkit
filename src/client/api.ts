// src/client/api.ts
import axios, { AxiosInstance } from 'axios';
import Debug from 'debug';

const debug = Debug('reai-toolkit:ApiClient');

export class ApiClient {
    private axiosInstance: AxiosInstance;

    constructor(baseURL: string) {
        this.axiosInstance = axios.create({
            baseURL,
            // 可以添加更多配置项，如 headers, timeout 等
        });
    }

    async registerTool(appId: string, appSecret: string): Promise<string> {
        try {
            const response = await this.axiosInstance.post('/register', {
                appId,
                appSecret,
            });
            return response.data.toolId;
        } catch (error) {
            console.error('Error registering tool:', error);
            throw error;
        }
    }

    // 可以添加更多与 API 交互的方法
}
