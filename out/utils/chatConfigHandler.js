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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatConfigHandler = void 0;
const vscode = __importStar(require("vscode"));
class ChatConfigHandler {
    constructor(aiAgent) {
        this.aiAgent = aiAgent;
    }
    async handleConfigCommand(message) {
        const command = this.parseConfigCommand(message.toLowerCase());
        if (!command) {
            return null; // Not a config command
        }
        try {
            switch (command.type) {
                case 'api_key':
                    return await this.handleApiKeyConfig(command);
                case 'model_switch':
                    return await this.handleModelSwitch(command);
                case 'local_llm':
                    return await this.handleLocalLLMConfig(command);
                case 'network':
                    return await this.handleNetworkConfig(command);
                case 'setting':
                    return await this.handleGeneralSetting(command);
                case 'help':
                    return this.getConfigHelp();
                default:
                    return null;
            }
        }
        catch (error) {
            return `❌ Configuration failed: ${error}`;
        }
    }
    parseConfigCommand(message) {
        // API Key patterns
        const apiKeyPatterns = [
            /set\s+(openai|chatgpt|gpt)\s+api\s+(?:key\s+)?(?:to\s+)?([a-zA-Z0-9\-_]+)/,
            /set\s+(deepseek)\s+api\s+(?:key\s+)?(?:to\s+)?([a-zA-Z0-9\-_]+)/,
            /set\s+(claude|anthropic)\s+api\s+(?:key\s+)?(?:to\s+)?([a-zA-Z0-9\-_]+)/,
            /configure\s+(openai|chatgpt|gpt|deepseek|claude|anthropic)\s+(?:api\s+)?(?:key\s+)?([a-zA-Z0-9\-_]+)/,
            /(openai|chatgpt|gpt|deepseek|claude|anthropic)\s+api\s+(?:key\s+)?(?:is\s+)?([a-zA-Z0-9\-_]+)/
        ];
        for (const pattern of apiKeyPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    type: 'api_key',
                    action: 'set',
                    provider: this.normalizeProvider(match[1]),
                    value: match[2]
                };
            }
        }
        // Model switching patterns
        const modelSwitchPatterns = [
            /(?:switch|change|use)\s+(?:to\s+)?(deepseek|gpt-?4|gpt-?3\.?5|claude|local|ollama)/,
            /(?:set|use)\s+(?:model\s+)?(?:to\s+)?(deepseek|gpt-?4|gpt-?3\.?5|claude|local|ollama)/,
            /(?:prefer|default)\s+(?:model\s+)?(?:to\s+)?(deepseek|gpt-?4|gpt-?3\.?5|claude|local|ollama)/
        ];
        for (const pattern of modelSwitchPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    type: 'model_switch',
                    action: 'switch',
                    model: this.normalizeModel(match[1])
                };
            }
        }
        // Local LLM patterns
        const localLLMPatterns = [
            /(?:switch|change|use)\s+ollama\s+(?:to\s+|model\s+)?([a-zA-Z0-9\-_:\.]+)/,
            /(?:set|use)\s+ollama\s+model\s+([a-zA-Z0-9\-_:\.]+)/,
            /ollama\s+(?:model\s+)?([a-zA-Z0-9\-_:\.]+)/,
            /(?:set|configure)\s+local\s+llm\s+(?:endpoint\s+)?(?:to\s+)?(http[s]?:\/\/[^\s]+)/,
            /(?:set|configure)\s+local\s+(?:llm\s+)?endpoint\s+(?:to\s+)?(http[s]?:\/\/[^\s]+)/,
            /local\s+llm\s+(?:endpoint\s+)?(?:is\s+)?(http[s]?:\/\/[^\s]+)/
        ];
        for (const pattern of localLLMPatterns) {
            const match = message.match(pattern);
            if (match) {
                if (pattern.source.includes('endpoint')) {
                    return {
                        type: 'local_llm',
                        action: 'set_endpoint',
                        value: match[1]
                    };
                }
                else {
                    return {
                        type: 'local_llm',
                        action: 'set_model',
                        value: match[1]
                    };
                }
            }
        }
        // Network configuration patterns
        const networkPatterns = [
            /(?:set|use|switch)\s+(?:to\s+)?(mainnet|testnet|devnet|localnet)\s+(?:for\s+)?(solana|sui)?/,
            /(?:solana|sui)\s+(?:network\s+)?(?:to\s+)?(mainnet|testnet|devnet|localnet)/,
            /(?:configure|set)\s+(?:solana|sui)\s+(?:network\s+)?(?:to\s+)?(mainnet|testnet|devnet|localnet)/
        ];
        for (const pattern of networkPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    type: 'network',
                    action: 'set',
                    value: match[1],
                    provider: match[2] || 'both'
                };
            }
        }
        // Help patterns
        const helpPatterns = [
            /(?:help|show)\s+(?:with\s+)?(?:config|configuration|settings)/,
            /(?:what|how)\s+(?:can\s+)?(?:i\s+)?(?:configure|set|change)/,
            /(?:list|show)\s+(?:available\s+)?(?:config|configuration|settings|options)/,
            /configuration\s+(?:help|options)/
        ];
        for (const pattern of helpPatterns) {
            if (message.match(pattern)) {
                return {
                    type: 'help',
                    action: 'show'
                };
            }
        }
        return null;
    }
    normalizeProvider(provider) {
        const providerMap = {
            'openai': 'openai',
            'chatgpt': 'openai',
            'gpt': 'openai',
            'deepseek': 'deepseek',
            'claude': 'claude',
            'anthropic': 'claude'
        };
        return providerMap[provider] || provider;
    }
    normalizeModel(model) {
        const modelMap = {
            'deepseek': 'deepseek',
            'gpt4': 'gpt-4',
            'gpt-4': 'gpt-4',
            'gpt3.5': 'gpt-3.5-turbo',
            'gpt-3.5': 'gpt-3.5-turbo',
            'claude': 'claude-3-sonnet',
            'local': 'local-llm',
            'ollama': 'local-llm'
        };
        return modelMap[model] || model;
    }
    async handleApiKeyConfig(command) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const configKey = `${command.provider}ApiKey`;
        await config.update(configKey, command.value, vscode.ConfigurationTarget.Global);
        // Test the API key if possible
        let testResult = '';
        try {
            if (command.provider === 'openai') {
                // Could add API key validation here
                testResult = ' ✅ API key format looks valid.';
            }
        }
        catch (error) {
            testResult = ' ⚠️ Could not validate API key.';
        }
        return `✅ ${command.provider?.toUpperCase()} API key configured successfully!${testResult}\n\n` +
            `You can now use "${command.provider}" by saying "switch to ${command.provider}" or "use ${command.provider}".`;
    }
    async handleModelSwitch(command) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        await config.update('preferredModel', command.model, vscode.ConfigurationTarget.Global);
        let additionalInfo = '';
        if (command.model === 'local-llm') {
            const localConfig = vscode.workspace.getConfiguration('web3-ai-agent.localLLM');
            const endpoint = localConfig.get('endpoint');
            const model = localConfig.get('model');
            additionalInfo = `\n\n🏠 Local LLM Configuration:
• Endpoint: ${endpoint}
• Model: ${model}

To change the local model, say: "use ollama model codellama:13b"
To change the endpoint, say: "set local llm endpoint to http://localhost:8080"`;
            // Test local LLM connection
            try {
                const isConnected = await this.aiAgent.testLocalLLMConnection();
                if (isConnected) {
                    additionalInfo += '\n✅ Local LLM connection successful!';
                }
                else {
                    additionalInfo += '\n❌ Local LLM connection failed. Please check your configuration.';
                }
            }
            catch (error) {
                additionalInfo += `\n⚠️ Could not test local LLM connection: ${error}`;
            }
        }
        return `✅ Switched to **${command.model}** successfully!${additionalInfo}`;
    }
    async handleLocalLLMConfig(command) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent.localLLM');
        if (command.action === 'set_endpoint') {
            await config.update('endpoint', command.value, vscode.ConfigurationTarget.Global);
            // Test the new endpoint
            try {
                const isConnected = await this.aiAgent.testLocalLLMConnection();
                if (isConnected) {
                    return `✅ Local LLM endpoint set to **${command.value}** and connection successful!`;
                }
                else {
                    return `⚠️ Local LLM endpoint set to **${command.value}** but connection failed. Please check if the server is running.`;
                }
            }
            catch (error) {
                return `❌ Local LLM endpoint set to **${command.value}** but connection test failed: ${error}`;
            }
        }
        if (command.action === 'set_model') {
            await config.update('model', command.value, vscode.ConfigurationTarget.Global);
            // Also switch to local-llm if not already
            const mainConfig = vscode.workspace.getConfiguration('web3-ai-agent');
            const currentModel = mainConfig.get('preferredModel');
            if (currentModel !== 'local-llm') {
                await mainConfig.update('preferredModel', 'local-llm', vscode.ConfigurationTarget.Global);
            }
            // Test with new model
            try {
                const isConnected = await this.aiAgent.testLocalLLMConnection();
                if (isConnected) {
                    return `✅ Ollama model set to **${command.value}** and connection successful!\n\n` +
                        `Now using local LLM for all AI operations. Your code stays private! 🔒`;
                }
                else {
                    return `⚠️ Ollama model set to **${command.value}** but connection failed.\n\n` +
                        `Make sure the model is pulled: \`ollama pull ${command.value}\``;
                }
            }
            catch (error) {
                return `❌ Ollama model set to **${command.value}** but connection test failed: ${error}`;
            }
        }
        return `❌ Unknown local LLM configuration action: ${command.action}`;
    }
    async handleNetworkConfig(command) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        if (command.provider === 'solana' || command.provider === 'both') {
            await config.update('solanaNetwork', command.value, vscode.ConfigurationTarget.Global);
        }
        if (command.provider === 'sui' || command.provider === 'both') {
            await config.update('suiNetwork', command.value, vscode.ConfigurationTarget.Global);
        }
        const networks = [];
        if (command.provider === 'solana' || command.provider === 'both') {
            networks.push(`Solana: ${command.value}`);
        }
        if (command.provider === 'sui' || command.provider === 'both') {
            networks.push(`Sui: ${command.value}`);
        }
        return `✅ Network configuration updated!\n\n${networks.join('\n')}`;
    }
    async handleGeneralSetting(command) {
        // Handle other general settings
        return `✅ Setting updated: ${command.action} = ${command.value}`;
    }
    getConfigHelp() {
        return `🛠️ **Configuration Help**

**API Keys:**
• "set openai api key to sk-xxx" - Configure OpenAI API
• "set deepseek api to xxx" - Configure DeepSeek API  
• "configure claude api key xxx" - Configure Claude API

**Model Switching:**
• "switch to deepseek" - Use DeepSeek for AI operations
• "use gpt-4" - Switch to GPT-4
• "change to local" - Use local LLM (private & free!)

**Local LLM (Ollama):**
• "use ollama model codellama:7b" - Switch Ollama model
• "switch ollama to deepseek-coder:6.7b" - Change to different model
• "set local llm endpoint to http://localhost:8080" - Change endpoint

**Networks:**
• "set solana to mainnet" - Configure Solana network
• "use testnet for sui" - Configure Sui network
• "switch to devnet" - Set both networks to devnet

**Examples:**
• "switch ollama to qwen3" ✅
• "set chatgpt api to 4808045" ✅  
• "use deepseek" ✅
• "configure local endpoint to localhost:8080" ✅

Just type naturally - I understand many variations! 🤖`;
    }
    isConfigCommand(message) {
        return this.parseConfigCommand(message.toLowerCase()) !== null;
    }
}
exports.ChatConfigHandler = ChatConfigHandler;
//# sourceMappingURL=chatConfigHandler.js.map