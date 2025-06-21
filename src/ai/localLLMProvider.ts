import * as vscode from 'vscode';
import axios, { AxiosResponse } from 'axios';

export interface LocalLLMConfig {
    endpoint: string;
    model: string;
    apiFormat: 'openai' | 'ollama' | 'textgen' | 'vllm' | 'custom';
    apiKey?: string;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    headers?: { [key: string]: string };
}

export interface LocalLLMResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class LocalLLMProvider {
    private config: LocalLLMConfig;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Web3 AI Agent - Local LLM');
        this.config = this.loadConfig();
    }

    private loadConfig(): LocalLLMConfig {
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

    public async testConnection(): Promise<boolean> {
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
        } catch (error) {
            this.log(`Connection test failed: ${error}`);
            return false;
        }
    }

    private async testOllamaConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.config.endpoint}/api/tags`, {
                timeout: this.config.timeout
            });
            
            this.log(`Ollama connection successful. Available models: ${response.data.models?.map((m: any) => m.name).join(', ')}`);
            return true;
        } catch (error) {
            this.log(`Ollama connection failed: ${error}`);
            return false;
        }
    }

    private async testOpenAICompatibleConnection(): Promise<boolean> {
        try {
            const headers: any = {
                'Content-Type': 'application/json',
                ...this.config.headers
            };
            
            if (this.config.apiKey) {
                headers['Authorization'] = `Bearer ${this.config.apiKey}`;
            }

            const response = await axios.get(`${this.config.endpoint}/v1/models`, {
                headers,
                timeout: this.config.timeout
            });
            
            this.log(`OpenAI-compatible connection successful. Available models: ${response.data.data?.map((m: any) => m.id).join(', ')}`);
            return true;
        } catch (error) {
            this.log(`OpenAI-compatible connection failed: ${error}`);
            return false;
        }
    }

    private async testTextGenConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.config.endpoint}/api/v1/model`, {
                timeout: this.config.timeout
            });
            
            this.log(`Text Generation WebUI connection successful. Model: ${response.data.result}`);
            return true;
        } catch (error) {
            this.log(`Text Generation WebUI connection failed: ${error}`);
            return false;
        }
    }

    private async testVLLMConnection(): Promise<boolean> {
        try {
            const response = await axios.get(`${this.config.endpoint}/v1/models`, {
                timeout: this.config.timeout
            });
            
            this.log(`vLLM connection successful. Available models: ${response.data.data?.map((m: any) => m.id).join(', ')}`);
            return true;
        } catch (error) {
            this.log(`vLLM connection failed: ${error}`);
            return false;
        }
    }

    private async testCustomConnection(): Promise<boolean> {
        try {
            // For custom endpoints, try a simple health check
            const response = await axios.get(`${this.config.endpoint}/health`, {
                timeout: this.config.timeout
            });
            
            this.log(`Custom endpoint connection successful`);
            return true;
        } catch (error) {
            // If health endpoint doesn't exist, try the main endpoint
            try {
                await axios.get(this.config.endpoint, { timeout: 5000 });
                this.log(`Custom endpoint reachable`);
                return true;
            } catch (secondError) {
                this.log(`Custom endpoint connection failed: ${error}`);
                return false;
            }
        }
    }

    public async generateResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
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

    private async generateOllamaResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
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
            const response: AxiosResponse = await axios.post(
                `${this.config.endpoint}/api/chat`,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: this.config.timeout
                }
            );

            return {
                content: response.data.message.content,
                model: this.config.model,
                usage: {
                    promptTokens: response.data.prompt_eval_count || 0,
                    completionTokens: response.data.eval_count || 0,
                    totalTokens: (response.data.prompt_eval_count || 0) + (response.data.eval_count || 0)
                }
            };
        } catch (error) {
            this.log(`Ollama request failed: ${error}`);
            throw new Error(`Ollama request failed: ${error}`);
        }
    }

    private async generateOpenAICompatibleResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
        const messages = [];
        
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const headers: any = {
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
            const response: AxiosResponse = await axios.post(
                `${this.config.endpoint}/v1/chat/completions`,
                requestBody,
                {
                    headers,
                    timeout: this.config.timeout
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: this.config.model,
                usage: response.data.usage
            };
        } catch (error) {
            this.log(`OpenAI-compatible request failed: ${error}`);
            throw new Error(`OpenAI-compatible request failed: ${error}`);
        }
    }

    private async generateTextGenResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
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
            const response: AxiosResponse = await axios.post(
                `${this.config.endpoint}/api/v1/generate`,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: this.config.timeout
                }
            );

            return {
                content: response.data.results[0].text,
                model: this.config.model
            };
        } catch (error) {
            this.log(`Text Generation WebUI request failed: ${error}`);
            throw new Error(`Text Generation WebUI request failed: ${error}`);
        }
    }

    private async generateVLLMResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
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
            const response: AxiosResponse = await axios.post(
                `${this.config.endpoint}/v1/chat/completions`,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: this.config.timeout
                }
            );

            return {
                content: response.data.choices[0].message.content,
                model: this.config.model,
                usage: response.data.usage
            };
        } catch (error) {
            this.log(`vLLM request failed: ${error}`);
            throw new Error(`vLLM request failed: ${error}`);
        }
    }

    private async generateCustomResponse(prompt: string, systemPrompt?: string): Promise<LocalLLMResponse> {
        // For custom endpoints, use a flexible approach
        const requestBody = {
            prompt: systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt,
            model: this.config.model,
            temperature: this.config.temperature,
            max_tokens: this.config.maxTokens,
            ...this.config.headers
        };

        try {
            const response: AxiosResponse = await axios.post(
                this.config.endpoint,
                requestBody,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: this.config.timeout
                }
            );

            // Try to extract content from various possible response formats
            let content = '';
            if (response.data.content) {
                content = response.data.content;
            } else if (response.data.text) {
                content = response.data.text;
            } else if (response.data.response) {
                content = response.data.response;
            } else if (response.data.choices && response.data.choices[0]) {
                content = response.data.choices[0].text || response.data.choices[0].message?.content;
            } else {
                content = JSON.stringify(response.data);
            }

            return {
                content,
                model: this.config.model
            };
        } catch (error) {
            this.log(`Custom endpoint request failed: ${error}`);
            throw new Error(`Custom endpoint request failed: ${error}`);
        }
    }

    public async getAvailableModels(): Promise<string[]> {
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
        } catch (error) {
            this.log(`Failed to get available models: ${error}`);
            return [this.config.model];
        }
    }

    private async getOllamaModels(): Promise<string[]> {
        const response = await axios.get(`${this.config.endpoint}/api/tags`);
        return response.data.models?.map((m: any) => m.name) || [];
    }

    private async getOpenAICompatibleModels(): Promise<string[]> {
        const headers: any = { 'Content-Type': 'application/json' };
        if (this.config.apiKey) {
            headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        }

        const response = await axios.get(`${this.config.endpoint}/v1/models`, { headers });
        return response.data.data?.map((m: any) => m.id) || [];
    }

    private async getTextGenModels(): Promise<string[]> {
        const response = await axios.get(`${this.config.endpoint}/api/v1/model`);
        return [response.data.result];
    }

    public updateConfig(newConfig: Partial<LocalLLMConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.log('Configuration updated');
    }

    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}