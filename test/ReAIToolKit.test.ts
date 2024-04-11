import { ReAIToolKit } from '../src/ReAIToolKit';
import * as assert from 'assert';

describe('AiToolKit', function() {
    it('should register and return a toolId', function() {
        const tool = new ReAIToolKit({
            appId: 'test',
            appKey: 'test',
            toolId: 'test'
        });
        const toolId = tool.start()
        assert.ok(toolId, 'toolId should be defined');
    });
});