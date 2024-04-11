"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiClient = void 0;
// src/client/api.ts
const axios_1 = __importDefault(require("axios"));
const debug_1 = __importDefault(require("debug"));
const debug = (0, debug_1.default)('reai-toolkit:ApiClient');
class ApiClient {
    axiosInstance;
    constructor(baseURL) {
        this.axiosInstance = axios_1.default.create({
            baseURL,
            // 可以添加更多配置项，如 headers, timeout 等
        });
    }
    async registerTool(appId, appSecret) {
        try {
            const response = await this.axiosInstance.post('/register', {
                appId,
                appSecret,
            });
            return response.data.toolId;
        }
        catch (error) {
            console.error('Error registering tool:', error);
            throw error;
        }
    }
}
exports.ApiClient = ApiClient;
