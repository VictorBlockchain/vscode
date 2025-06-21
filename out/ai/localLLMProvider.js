"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalLLMProvider = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
class LocalLLMProvider {
    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Web3 AI Agent - Local LLM');
        this.config = this.loadConfig();
    }
    loadConfig() {
        const config = vscode.workspace.getConfiguration('web3-ai-agent.localLLM');
        return {
            endpoint: config.get('endpoint', 'http://localhost:11434'),
            model: config.get('model', 'codellama:7b'),
            apiFormat: config.get('apiFormat', 'ollama'),
            apiKey: config.get('apiKey', ''),
            temperature: config.get('temperature', 0.7),
            maxTokens: config.get('maxTokens', 2048),
            timeout: config.get('timeout', 30000),
            headers: config.get('headers', {})
        };
    }
    async testConnection() {
        try {
            this.log('Testing connection to local LLM...');
            switch (this.config.apiFormat) {
                case 'ollama':
                    return await this.testOllamaConnection();
                case 'openai':
                    return await this.testOpenAICompatibleConnection();
                case 'textgen':
                    return await this.testTextGenConnection();
                case 'vllm':
                    return await this.testVLLMConnection();
                default:
                    return await this.testCustomConnection();
            }
        }
        catch (error) {
            this.log(`Connection test failed: ${error}`);
            return false;
        }
    }
    async testOllamaConnection() {
        try {
            const response = await axios_1.default.get(`${this.config.endpoint}/api/tags`, {
                timeout: this.config.timeout
            });
            this.log(`Ollama connection successful. Available models: ${response.data.models?.map((m) => m.name).join(', ')}`);
            return true;
        }
        catch (error) {
            this.log(`Ollama connection failed: ${error}`);
            return false;
        }
    }
    async testOpenAICompatibleConnection() {
        try {
            const headers = {
                'Content-Type': 'application/json',
                ...this.config.headers
            };
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }
            const response = await axios_1.default.get(`${this.config.endpoint}/v1/models`, {
                headers,
                timeout: this.config.timeout
            });
            this.log(`OpenAI-compatible connection successful. Available models: ${response.data.data?.map((m) => m.id).join(', ')}`);
            return true;
        }
        catch (error) {
            this.log(`OpenAI-compatible connection failed: ${error}`);
            return false;
        }
    }
    async testTextGenConnection() {
        try {
            const response = await axios_1.default.get(`${this.config.endpoint}/api/v1/model`, {
                timeout: this.config.timeout
            });
            this.log(`Text Generation WebUI connection successful. Model: ${response.data.result}`);
            return true;
        }
        catch (error) {
            this.log(`Text Generation WebUI connection failed: ${error}`);
            return false;
        }
    }
    async testVLLMConnection() {
        try {
            const response = await axios_1.default.get(`${this.config.endpoint}/v1/models`, {
                timeout: this.config.timeout
            });
            this.log(`vLLM connection successful. Available models: ${response.data.data?.map((m) => m.id).join(', ')}`);
            return true;
        }
        catch (error) {
            this.log(`vLLM connection failed: ${error}`);
            return false;
        }
    }
    async testCustomConnection() {
        try {
            // For custom endpoints, try a simple health check
            const response = await axios_1.default.get(`${this.config.endpoint}/health`, {
                timeout: this.config.timeout
            });
            this.log(`Custom endpoint connection successful`);
            return true;
        }
        catch (error) {
            // If health endpoint doesn't exist, try the main endpoint
            try {
                await axios_1.default.get(this.config.endpoint, { timeout: 5000 });
                this.log(`Custom endpoint reachable`);
                return true;
            }
            catch (secondError) {
                this.log(`Custom endpoint connection failed: ${error}`);
                return false;
            }
        }
    }
    async generateResponse(prompt, systemPrompt) {
        this.log(`Generating response using ${this.config.apiFormat} format...`);
        switch (this.config.apiFormat) {
            case 'ollama':
                return await this.generateOllamaResponse(prompt, systemPrompt);
            case 'openai':
                return await this.generateOpenAICompatibleResponse(prompt, systemPrompt);
            case 'textgen':
                return await this.generateTextGenResponse(prompt, systemPrompt);
            case 'vllm':
                return await this.generateVLLMResponse(prompt, systemPrompt);
            default:
                return await this.generateCustomResponse(prompt, systemPrompt);
        }
    }
    async generateOllamaResponse(prompt, systemPrompt) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const requestBody = {
            model: this.config.model,
            messages: messages,
            stream: false,
            options: {
                temperature: this.config.temperature,
                num_predict: this.config.maxTokens
            }
        };
        try {
            const response = await axios_1.default.post(`${this.config.endpoint}/api/chat`, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: this.config.timeout
            });
            return {
                content: response.data.message.content,
                model: this.config.model,
                usage: {
                    promptTokens: response.data.prompt_eval_count || 0,
                    completionTokens: response.data.eval_count || 0,
                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                }
            };
        }
        catch (error) {
            this.log(`Ollama request failed: ${error}`);
            throw new Error(`Ollama request failed: ${error}`);
        }
    }
    async generateOpenAICompatibleResponse(prompt, systemPrompt) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const headers = {
            'Content-Type': 'application/json',
            ...this.config.headers
        };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        const requestBody = {
            model: this.config.model,
            messages: messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens
        };
        try {
            const response = await axios_1.default.post(`${this.config.endpoint}/v1/chat/completions`, requestBody, {
                headers,
                timeout: this.config.timeout
            });
            return {
                content: response.data.choices[0].message.content,
                model: this.config.model,
                usage: response.data.usage
            };
        }
        catch (error) {
            this.log(`OpenAI-compatible request failed: ${error}`);
            throw new Error(`OpenAI-compatible request failed: ${error}`);
        }
    }
    async generateTextGenResponse(prompt, systemPrompt) {
        const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
        const requestBody = {
            prompt: fullPrompt,
            max_new_tokens: this.config.maxTokens,
            temperature: this.config.temperature,
            do_sample: true,
            top_p: 0.9,
            typical_p: 1,
            repetition_penalty: 1.1,
            top_k: 40,
            min_length: 0,
            no_repeat_ngram_size: 0,
            num_beams: 1,
            penalty_alpha: 0,
            length_penalty: 1,
            early_stopping: false,
            seed: -1,
            add_bos_token: true,
            truncation_length: 2048,
            ban_eos_token: false,
            skip_special_tokens: true,
            stopping_strings: []
        };
        try {
            const response = await axios_1.default.post(`${this.config.endpoint}/api/v1/generate`, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: this.config.timeout
            });
            return {
                content: response.data.results[0].text,
                model: this.config.model
            };
        }
        catch (error) {
            this.log(`Text Generation WebUI request failed: ${error}`);
            throw new Error(`Text Generation WebUI request failed: ${error}`);
        }
    }
    async generateVLLMResponse(prompt, systemPrompt) {
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const requestBody = {
            model: this.config.model,
            messages: messages,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens
        };
        try {
            const response = await axios_1.default.post(`${this.config.endpoint}/v1/chat/completions`, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: this.config.timeout
            });
            return {
                content: response.data.choices[0].message.content,
                model: this.config.model,
                usage: response.data.usage
            };
        }
        catch (error) {
            this.log(`vLLM request failed: ${error}`);
            throw new Error(`vLLM request failed: ${error}`);
        }
    }
    async generateCustomResponse(prompt, systemPrompt) {
        // For custom endpoints, use a flexible approach
        const requestBody = {
            prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
            model: this.config.model,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            ...this.config.headers
        };
        try {
            const response = await axios_1.default.post(this.config.endpoint, requestBody, {
                headers: { 'Content-Type': 'application/json' },
                timeout: this.config.timeout
            });
            // Try to extract content from various possible response formats
            let content = '';
            if (response.data.content) {
                content = response.data.content;
            }
            else if (response.data.text) {
                content = response.data.text;
            }
            else if (response.data.response) {
                content = response.data.response;
            }
            else if (response.data.choices && response.data.choices[0]) {
                content = response.data.choices[0].text || response.data.choices[0].message?.content;
            }
            else {
                content = JSON.stringify(response.data);
            }
            return {
                content,
                model: this.config.model
            };
        }
        catch (error) {
            this.log(`Custom endpoint request failed: ${error}`);
            throw new Error(`Custom endpoint request failed: ${error}`);
        }
    }
    async getAvailableModels() {
        try {
            switch (this.config.apiFormat) {
                case 'ollama':
                    return await this.getOllamaModels();
                case 'openai':
                case 'vllm':
                    return await this.getOpenAICompatibleModels();
                case 'textgen':
                    return await this.getTextGenModels();
                default:
                    return [this.config.model];
            }
        }
        catch (error) {
            this.log(`Failed to get available models: ${error}`);
            return [this.config.model];
        }
    }
    async getOllamaModels() {
        const response = await axios_1.default.get(`${this.config.endpoint}/api/tags`);
        return response.data.models?.map((m) => m.name) || [];
    }
    async getOpenAICompatibleModels() {
        const headers = { 'Content-Type': 'application/json' };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }
        const response = await axios_1.default.get(`${this.config.endpoint}/v1/models`, { headers });
        return response.data.data?.map((m) => m.id) || [];
    }
    async getTextGenModels() {
        const response = await axios_1.default.get(`${this.config.endpoint}/api/v1/model`);
        return [response.data.result];
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        this.log('Configuration updated');
    }
    log(message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }
    dispose() {
        this.outputChannel.dispose();
    }
}
exports.LocalLLMProvider = LocalLLMProvider;
//# sourceMappingURL=localLLMProvider.js.map