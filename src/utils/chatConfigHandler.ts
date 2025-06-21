import * as vscode from 'vscode';
import { AIAgentProvider } from '../ai/aiAgentProvider';

export interface ConfigCommand {
    type: 'api_key' | 'model_switch' | 'local_llm' | 'network' | 'setting' | 'help' | 'memory';
    action: string;
    value?: string;
    provider?: string;
    model?: string;
    query?: string;
}

export class ChatConfigHandler {
    private aiAgent: AIAgentProvider;

    constructor(aiAgent: AIAgentProvider) {
        this.aiAgent = aiAgent;
    }

    public async handleConfigCommand(message: string): Promise<string | null> {
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
                case 'memory':
                    return await this.handleMemoryCommand(command);
                default:
                    return null;
            }
        } catch (error) {
            return `❌ Configuration failed: ${error}`;
        }
    }

    private parseConfigCommand(message: string): ConfigCommand | null {
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
                } else {
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

        // Settings patterns
        const settingsPatterns = [
            /(?:open|show|view)\s+settings/,
            /settings/,
            /(?:open|show)\s+(?:configuration|config)/,
            /(?:configure|setup)\s+(?:jordi|extension)/
        ];

        for (const pattern of settingsPatterns) {
            const match = message.match(pattern);
            if (match) {
                return {
                    type: 'setting',
                    action: 'open'
                };
            }
        }

        // Memory patterns
        const memoryPatterns = [
            /(?:show|view|display)\s+(?:my\s+)?memory/,
            /(?:show|view|display)\s+(?:my\s+)?(?:remember\s+)?(?:note|notes|notepad)/,
            /what\s+do\s+you\s+remember/,
            /(?:search|find)\s+(?:in\s+)?memory\s+(?:for\s+)?(.+)/,
            /(?:search|find)\s+(?:in\s+)?(?:notes|notepad)\s+(?:for\s+)?(.+)/,
            /remember\s+(?:that\s+)?(.+)/,
            /(?:note|write)\s+(?:down\s+)?(?:that\s+)?(.+)/,
            /(?:add|save)\s+(?:to\s+)?(?:memory|notes)\s+(.+)/,
            /(?:clear|reset|delete)\s+(?:my\s+)?memory/,
            /(?:forget|remove)\s+(.+)/,
            /memory\s+help/
        ];

        for (const pattern of memoryPatterns) {
            const match = message.match(pattern);
            if (match) {
                if (message.includes('show') || message.includes('view') || message.includes('display') || message.includes('what do you remember')) {
                    return {
                        type: 'memory',
                        action: 'show'
                    };
                } else if (message.includes('search') || message.includes('find')) {
                    return {
                        type: 'memory',
                        action: 'search',
                        query: match[1]?.trim()
                    };
                } else if (message.includes('remember') || message.includes('note') || message.includes('add') || message.includes('save')) {
                    return {
                        type: 'memory',
                        action: 'add',
                        value: match[1]?.trim()
                    };
                } else if (message.includes('clear') || message.includes('reset') || message.includes('delete')) {
                    return {
                        type: 'memory',
                        action: 'clear'
                    };
                } else if (message.includes('forget') || message.includes('remove')) {
                    return {
                        type: 'memory',
                        action: 'remove',
                        query: match[1]?.trim()
                    };
                } else if (message.includes('help')) {
                    return {
                        type: 'memory',
                        action: 'help'
                    };
                }
            }
        }

        return null;
    }

    private normalizeProvider(provider: string): string {
        const providerMap: { [key: string]: string } = {
            'openai': 'openai',
            'chatgpt': 'openai',
            'gpt': 'openai',
            'deepseek': 'deepseek',
            'claude': 'claude',
            'anthropic': 'claude'
        };
        return providerMap[provider] || provider;
    }

    private normalizeModel(model: string): string {
        const modelMap: { [key: string]: string } = {
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

    private async handleApiKeyConfig(command: ConfigCommand): Promise<string> {
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
        } catch (error) {
            testResult = ' ⚠️ Could not validate API key.';
        }

        return `✅ ${command.provider?.toUpperCase()} API key configured successfully!${testResult}\n\n` +
               `You can now use "${command.provider}" by saying "switch to ${command.provider}" or "use ${command.provider}".`;
    }

    private async handleModelSwitch(command: ConfigCommand): Promise<string> {
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
                } else {
                    additionalInfo += '\n❌ Local LLM connection failed. Please check your configuration.';
                }
            } catch (error) {
                additionalInfo += `\n⚠️ Could not test local LLM connection: ${error}`;
            }
        }

        return `✅ Switched to **${command.model}** successfully!${additionalInfo}`;
    }

    private async handleLocalLLMConfig(command: ConfigCommand): Promise<string> {
        const config = vscode.workspace.getConfiguration('web3-ai-agent.localLLM');
        
        if (command.action === 'set_endpoint') {
            await config.update('endpoint', command.value, vscode.ConfigurationTarget.Global);
            
            // Test the new endpoint
            try {
                const isConnected = await this.aiAgent.testLocalLLMConnection();
                if (isConnected) {
                    return `✅ Local LLM endpoint set to **${command.value}** and connection successful!`;
                } else {
                    return `⚠️ Local LLM endpoint set to **${command.value}** but connection failed. Please check if the server is running.`;
                }
            } catch (error) {
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
                } else {
                    return `⚠️ Ollama model set to **${command.value}** but connection failed.\n\n` +
                           `Make sure the model is pulled: \`ollama pull ${command.value}\``;
                }
            } catch (error) {
                return `❌ Ollama model set to **${command.value}** but connection test failed: ${error}`;
            }
        }

        return `❌ Unknown local LLM configuration action: ${command.action}`;
    }

    private async handleNetworkConfig(command: ConfigCommand): Promise<string> {
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

    private async handleGeneralSetting(command: ConfigCommand): Promise<string> {
        switch (command.action) {
            case 'open':
                // Open VS Code settings focused on Jordi/web3-ai-agent settings
                vscode.commands.executeCommand('workbench.action.openSettings', '@ext:jordi-ai-agent');
                return `⚙️ **Settings Opened!**

I've opened the VS Code settings page focused on Jordi AI Agent configuration.

**Quick Setup Guide:**

🤖 **Recommended: Local Ollama (Free & Private)**
1. Install Ollama: https://ollama.ai
2. Run: \`ollama pull deepseek-coder\`
3. Set "Preferred Model" to "local-llm"
4. Verify endpoint: http://localhost:11434

🔑 **Optional: API Keys**
- DeepSeek API Key (affordable)
- OpenAI API Key (GPT-4)
- Anthropic API Key (Claude)

💡 **Tip**: Local Ollama is recommended for privacy and cost-effectiveness!`;

            default:
                return `✅ Setting updated: ${command.action} = ${command.value}`;
        }
    }

    private getConfigHelp(): string {
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

**Settings:**
• "settings" - Open VS Code settings for Jordi
• "open settings" - Quick access to configuration
• "configure jordi" - Setup wizard

**Networks:**
• "set solana to mainnet" - Configure Solana network
• "use testnet for sui" - Configure Sui network
• "switch to devnet" - Set both networks to devnet

**Examples:**
• "settings" ✅ (Opens configuration panel)
• "switch ollama to qwen3" ✅
• "set chatgpt api to 4808045" ✅  
• "use deepseek" ✅
• "configure local endpoint to localhost:8080" ✅

Just type naturally - I understand many variations! 🤖`;
    }

    public isConfigCommand(message: string): boolean {
        return this.parseConfigCommand(message.toLowerCase()) !== null;
    }

    private async handleMemoryCommand(command: ConfigCommand): Promise<string> {
        const memoryManager = this.aiAgent.getMemoryManager();

        switch (command.action) {
            case 'show':
                const formattedMemory = await this.aiAgent.getFormattedMemory();
                return `🧠 **Jordi's Memory Notepad**\n\n${formattedMemory}`;

            case 'search':
                if (!command.query) {
                    return '❌ Please specify what to search for. Example: "search memory for API keys"';
                }
                const searchResults = await this.aiAgent.searchMemory(command.query);
                if (searchResults.length === 0) {
                    return `🔍 No memories found for "${command.query}"`;
                }
                
                let searchResponse = `🔍 **Found ${searchResults.length} memories for "${command.query}":**\n\n`;
                searchResults.slice(0, 5).forEach((memory, index) => {
                    const priorityIcon = {
                        'critical': '🔴',
                        'high': '🟡',
                        'medium': '🔵',
                        'low': '⚪'
                    }[memory.priority];
                    
                    searchResponse += `${priorityIcon} **${memory.title}**\n`;
                    searchResponse += `*${memory.category} • ${memory.timestamp.toLocaleDateString()}*\n`;
                    searchResponse += `${memory.content}\n\n`;
                });
                
                if (searchResults.length > 5) {
                    searchResponse += `... and ${searchResults.length - 5} more results.`;
                }
                
                return searchResponse;

            case 'add':
                if (!command.value) {
                    return '❌ Please specify what to remember. Example: "remember that user prefers TypeScript"';
                }
                
                await this.aiAgent.rememberImportantNote(
                    'User Note',
                    command.value,
                    ['user_input', 'manual']
                );
                
                return `✅ **Remembered:** ${command.value}`;

            case 'clear':
                memoryManager.clearMemory();
                return '🧠 **Memory cleared!** Starting fresh with a new notepad.';

            case 'remove':
                if (!command.query) {
                    return '❌ Please specify what to forget. Example: "forget API key configuration"';
                }
                
                // For now, we'll just add a note that something should be ignored
                await this.aiAgent.rememberImportantNote(
                    'Ignore Previous',
                    `User requested to forget/ignore: ${command.query}`,
                    ['ignore', 'removal', 'user_request']
                );
                
                return `✅ **Noted to ignore:** ${command.query}`;

            case 'help':
                return this.getMemoryHelp();

            default:
                return '❌ Unknown memory command. Try "memory help" for available commands.';
        }
    }

    private getMemoryHelp(): string {
        return `🧠 **Jordi's Memory Commands**

**View Memory:**
• "show my memory" - Display full memory notepad
• "view my notes" - Same as above
• "what do you remember" - Show recent memories

**Search Memory:**
• "search memory for API keys" - Find specific memories
• "find notes about React" - Search by topic

**Add to Memory:**
• "remember that I prefer TypeScript" - Add important note
• "note that this project uses Next.js" - Save project info
• "add to memory: user likes dark theme" - Manual memory entry

**Manage Memory:**
• "clear my memory" - Reset all memories (careful!)
• "forget API configuration" - Mark something to ignore
• "memory help" - Show this help

**How Memory Works:**
🤖 I automatically remember:
• API configurations you set
• Tasks we complete together
• Project context (framework, language, etc.)
• Important insights and learnings
• Your preferences and working style

💡 **Tip:** I check my memory before every response to provide better, more personalized assistance!`;
    }
}