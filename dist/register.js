"use strict";
// src/registrar.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registrar = void 0;
const api_1 = require("./client/api");
class Registrar {
    appId;
    appSecret;
    apiClient;
    toolId;
    constructor(baseURL, appId, appSecret) {
        this.appId = appId;
        this.appSecret = appSecret;
        this.apiClient = new api_1.ApiClient(baseURL);
    }
    async register() {
        try {
            this.toolId = await this.apiClient.registerTool(this.appId, this.appSecret);
            console.log(`Registered tool with ID: ${this.toolId}`);
            return this.toolId;
        }
        catch (error) {
            console.error('Registration failed:', error);
            throw error;
        }
    }
    getToolId() {
        return this.toolId;
    }
}
exports.Registrar = Registrar;
