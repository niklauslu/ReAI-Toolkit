// src/registrar.ts

import { ApiClient } from "./client/api";


export class Registrar {
    private apiClient: ApiClient;
    private toolId?: string;

    constructor(baseURL: string, private appId: string, private appSecret: string) {
        this.apiClient = new ApiClient(baseURL);
    }

    async register(): Promise<string> {
        try {
            this.toolId = await this.apiClient.registerTool(this.appId, this.appSecret);
            console.log(`Registered tool with ID: ${this.toolId}`);
            return this.toolId;
        } catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }

    getToolId(): string | undefined {
        return this.toolId;
    }
}
