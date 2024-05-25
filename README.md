
## ReAI Toolkit (AI tool 接口处理)

```bash
npm i @re-ai/toolkit
```

### 环境变量
```
REAI_API_HOST=ai请求地址    
REAI_WSS_HOST=wss请求地址

```

### 示例

```typescript
import { ReAIToolKit, ReAIToolKitMessageHook, ReAIToolKitMessageRole, ReAIToolkitConfig } from "@re-ai/toolkit"

const config: ReAIToolkitConfig = {
        appId: process.env.REAI_APP_ID || "",
        appSecret: process.env.REAI_APP_SECRET || "",
        toolId: process.env.SPEECH_TOOL_ID || "",
        apiHost: "",
        wssHost: "",
        messageHandlerMethod: ""
    }
    const speechTool = new ReAIToolKit(config)

    speechTool.start(speechToolMessageHandler)
```

