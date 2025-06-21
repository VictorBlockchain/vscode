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
exports.AIAgentProvider = void 0;
const vscode = __importStar(require("vscode"));
const axios_1 = __importDefault(require("axios"));
const localLLMProvider_1 = require("./localLLMProvider");
const memoryManager_1 = require("../memory/memoryManager");
const openai_1 = __importDefault(require("openai"));
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
class AIAgentProvider {
    constructor(context) {
        this.context = context;
        this.localLLM = new localLLMProvider_1.LocalLLMProvider();
        this.memoryManager = new memoryManager_1.MemoryManager(context);
        this.initializeClients();
    }
    initializeClients() {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const openaiKey = config.get('openaiApiKey');
        if (openaiKey) {
            this.openai = new openai_1.default({ apiKey: openaiKey });
        }
        const claudeKey = config.get('claudeApiKey');
        if (claudeKey) {
            this.anthropic = new sdk_1.default({ apiKey: claudeKey });
        }
    }
    async generateResponse(prompt, systemPrompt) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const preferredModel = config.get('preferredModel', 'deepseek');
        // 🧠 Check memory before generating response
        const memoryContext = this.memoryManager.getMemoryContext();
        const enhancedSystemPrompt = this.buildSystemPromptWithMemory(systemPrompt, memoryContext);
        try {
            switch (preferredModel) {
                case 'deepseek':
                    return await this.callDeepSeek(prompt, enhancedSystemPrompt);
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    return await this.callOpenAI(prompt, enhancedSystemPrompt, preferredModel);
                case 'claude-3-opus':
                case 'claude-3-sonnet':
                    return await this.callClaude(prompt, enhancedSystemPrompt, preferredModel);
                case 'local-llm':
                    return await this.callLocalLLM(prompt, enhancedSystemPrompt);
                case 'custom':
                    return await this.callCustomAPI(prompt, enhancedSystemPrompt);
                default:
                    return await this.callDeepSeek(prompt, enhancedSystemPrompt);
            }
        }
        catch (error) {
            throw new Error(`AI API call failed: ${error}`);
        }
    }
    async callDeepSeek(prompt, systemPrompt) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const apiKey = config.get('deepseekApiKey');
        if (!apiKey) {
            throw new Error('DeepSeek API key not configured');
        }
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const response = await axios_1.default.post('https://api.deepseek.com/v1/chat/completions', {
            model: 'deepseek-coder',
            messages,
            temperature: 0.1,
            max_tokens: 4000
        }, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
        return {
            content: response.data.choices[0].message.content,
            model: 'deepseek-coder',
            usage: {
                promptTokens: response.data.usage.prompt_tokens,
                completionTokens: response.data.usage.completion_tokens,
                totalTokens: response.data.usage.total_tokens
            }
        };
    }
    async callOpenAI(prompt, systemPrompt, model = 'gpt-4') {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized');
        }
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const response = await this.openai.chat.completions.create({
            model,
            messages,
            temperature: 0.1,
            max_tokens: 4000
        });
        return {
            content: response.choices[0].message.content || '',
            model,
            usage: {
                promptTokens: response.usage?.prompt_tokens || 0,
                completionTokens: response.usage?.completion_tokens || 0,
                totalTokens: response.usage?.total_tokens || 0
            }
        };
    }
    async callClaude(prompt, systemPrompt, model = 'claude-3-sonnet-20240229') {
        if (!this.anthropic) {
            throw new Error('Anthropic client not initialized');
        }
        try {
            const response = await this.anthropic.messages.create({
                model,
                max_tokens: 4000,
                system: systemPrompt,
                messages: [{ role: 'user', content: prompt }]
            });
            const content = response.content[0];
            return {
                content: content.type === 'text' ? content.text : '',
                model,
                usage: {
                    promptTokens: response.usage?.input_tokens || 0,
                    completionTokens: response.usage?.output_tokens || 0,
                    totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
                }
            };
        }
        catch (error) {
            throw new Error(`Claude API call failed: ${error}`);
        }
    }
    async callCustomAPI(prompt, systemPrompt) {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const endpoint = config.get('customApiEndpoint');
        const apiKey = config.get('customApiKey');
        if (!endpoint) {
            throw new Error('Custom API endpoint not configured');
        }
        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });
        const headers = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }
        const response = await axios_1.default.post(endpoint, {
            messages,
            temperature: 0.1,
            max_tokens: 4000
        }, { headers });
        return {
            content: response.data.choices?.[0]?.message?.content || response.data.content || '',
            model: 'custom'
        };
    }
    async callLocalLLM(prompt, systemPrompt) {
        try {
            const response = await this.localLLM.generateResponse(prompt, systemPrompt);
            return {
                content: response.content,
                model: response.model,
                usage: response.usage
            };
        }
        catch (error) {
            throw new Error(`Local LLM call failed: ${error}`);
        }
    }
    async generateNextJSComponent(componentName) {
        const systemPrompt = `You are an expert Next.js and React developer specializing in Web3 applications. 
        Generate a modern, TypeScript-based React component following Next.js 14+ best practices.
        Include proper TypeScript types, modern React patterns, and Web3 integration where appropriate.
        Consider the project context: ${JSON.stringify(this.projectContext)}`;
        const prompt = `Generate a Next.js component named "${componentName}". 
        The component should:
        1. Use TypeScript with proper type definitions
        2. Follow modern React patterns (hooks, functional components)
        3. Include proper error handling
        4. Be responsive and accessible
        5. Include basic styling (Tailwind CSS if available)
        6. Include Web3 integration if relevant to the component name
        7. Include proper JSDoc comments
        
        Provide the complete component code and suggest where to place it in the project structure.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        await this.createComponentFile(componentName, response.content);
    }
    async generateSolanaContract(contractName) {
        const systemPrompt = `You are an expert Solana blockchain developer specializing in Rust and Anchor framework.
        Generate secure, efficient smart contracts following Solana best practices.
        Consider the project context: ${JSON.stringify(this.projectContext)}`;
        const prompt = `Generate a Solana smart contract named "${contractName}" using the Anchor framework.
        The contract should:
        1. Use proper Rust syntax and Anchor macros
        2. Include comprehensive error handling
        3. Follow security best practices
        4. Include proper documentation
        5. Include basic tests
        6. Consider common DeFi/NFT patterns if relevant
        
        Provide the complete contract code, deployment instructions, and client integration examples.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        await this.createContractFile(contractName, response.content, 'solana');
    }
    async generateSuiContract(contractName) {
        const systemPrompt = `You are an expert Sui blockchain developer specializing in Move programming language.
        Generate secure, efficient smart contracts following Sui Move best practices.
        Consider the project context: ${JSON.stringify(this.projectContext)}`;
        const prompt = `Generate a Sui smart contract named "${contractName}" using Move language.
        The contract should:
        1. Use proper Move syntax and Sui framework
        2. Include comprehensive error handling
        3. Follow security best practices
        4. Include proper documentation
        5. Include basic tests
        6. Consider Sui's object model and capabilities
        
        Provide the complete contract code, deployment instructions, and client integration examples.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        await this.createContractFile(contractName, response.content, 'sui');
    }
    async optimizeCode(code, language) {
        const systemPrompt = `You are an expert code optimizer specializing in ${language} and Web3 development.
        Optimize code for performance, readability, security, and best practices.
        Consider the project context: ${JSON.stringify(this.projectContext)}`;
        const prompt = `Optimize the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Focus on:
1. Performance improvements
2. Security enhancements
3. Code readability and maintainability
4. Best practices for ${language}
5. Web3-specific optimizations if applicable
6. Gas optimization for smart contracts
7. Bundle size optimization for frontend code

Provide the optimized code with explanations of the changes made.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        // Extract code from response (assuming it's wrapped in code blocks)
        const codeMatch = response.content.match(/```[\w]*\n([\s\S]*?)\n```/);
        return codeMatch ? codeMatch[1] : response.content;
    }
    async analyzeCodeForIssues(code, language) {
        const systemPrompt = `You are an expert code auditor specializing in ${language} and Web3 security.
        Analyze code for bugs, security vulnerabilities, and improvement opportunities.`;
        const prompt = `Analyze the following ${language} code for issues:

\`\`\`${language}
${code}
\`\`\`

Look for:
1. Security vulnerabilities
2. Performance issues
3. Logic errors
4. Best practice violations
5. Web3-specific issues (reentrancy, overflow, etc.)
6. Gas optimization opportunities
7. Accessibility issues (for frontend code)

Provide a detailed analysis with severity levels and fix suggestions.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        return response.content;
    }
    async generateTests(code, language) {
        const systemPrompt = `You are an expert test engineer specializing in ${language} and Web3 testing.
        Generate comprehensive test suites with edge cases and security considerations.`;
        const prompt = `Generate comprehensive tests for the following ${language} code:

\`\`\`${language}
${code}
\`\`\`

Include:
1. Unit tests for all functions
2. Integration tests where applicable
3. Edge case testing
4. Security test cases
5. Performance benchmarks
6. Mock data and fixtures
7. Test documentation

Use appropriate testing frameworks for ${language}.`;
        const response = await this.generateResponse(prompt, systemPrompt);
        return response.content;
    }
    async createComponentFile(componentName, content) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }
        // Determine the best location for the component
        const componentPath = await this.determineComponentPath(componentName);
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, componentPath);
        // Ensure directory exists
        const dirUri = vscode.Uri.joinPath(uri, '..');
        await vscode.workspace.fs.createDirectory(dirUri);
        // Write the file
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        // Open the file
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
    }
    async createContractFile(contractName, content, blockchain) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }
        const extension = blockchain === 'solana' ? 'rs' : 'move';
        const contractPath = `contracts/${blockchain}/${contractName}.${extension}`;
        const uri = vscode.Uri.joinPath(workspaceFolder.uri, contractPath);
        // Ensure directory exists
        const dirUri = vscode.Uri.joinPath(uri, '..');
        await vscode.workspace.fs.createDirectory(dirUri);
        // Write the file
        await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
        // Open the file
        const document = await vscode.workspace.openTextDocument(uri);
        await vscode.window.showTextDocument(document);
    }
    async determineComponentPath(componentName) {
        // Check for common Next.js component directories
        const possiblePaths = [
            `components/${componentName}.tsx`,
            `src/components/${componentName}.tsx`,
            `app/components/${componentName}.tsx`,
            `components/${componentName}/${componentName}.tsx`,
            `src/components/${componentName}/${componentName}.tsx`
        ];
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return possiblePaths[0];
        }
        // Check which directories exist
        for (const path of possiblePaths) {
            try {
                const dirPath = path.substring(0, path.lastIndexOf('/'));
                const dirUri = vscode.Uri.joinPath(workspaceFolder.uri, dirPath);
                await vscode.workspace.fs.stat(dirUri);
                return path;
            }
            catch {
                // Directory doesn't exist, continue
            }
        }
        // Default to first option
        return possiblePaths[0];
    }
    setProjectContext(context) {
        this.projectContext = context;
    }
    getProjectContext() {
        return this.projectContext;
    }
    // Local LLM management methods
    async testLocalLLMConnection() {
        return await this.localLLM.testConnection();
    }
    async getAvailableLocalModels() {
        return await this.localLLM.getAvailableModels();
    }
    updateLocalLLMConfig(config) {
        this.localLLM.updateConfig(config);
    }
    dispose() {
        this.localLLM.dispose();
    }
    // 🧠 Memory Management Methods
    buildSystemPromptWithMemory(originalPrompt, memoryContext) {
        const basePrompt = originalPrompt || `You are Jordi, an AI development assistant specialized in Next.js and Web3 development for Sui and Solana blockchains. You are helpful, knowledgeable, and focused on providing practical solutions.`;
        if (!memoryContext) {
            return basePrompt;
        }
        return `${basePrompt}

🧠 MEMORY CONTEXT (Check this before responding):
${memoryContext}

IMPORTANT: Before responding to any request:
1. Check the memory context above for relevant information
2. Consider user preferences and past configurations
3. Remember any important project context
4. Use this information to provide more personalized and contextual responses
5. Update your memory with any new important information learned during this conversation

Remember to be consistent with past preferences and build upon previous work.`;
    }
    // Memory access methods for external use
    getMemoryManager() {
        return this.memoryManager;
    }
    async rememberApiConfiguration(provider) {
        this.memoryManager.rememberApiKey(provider);
        this.memoryManager.updateUserPreference('preferredAI', provider);
    }
    async rememberTaskCompletion(taskType, details) {
        this.memoryManager.rememberTask(taskType, details);
    }
    async rememberImportantNote(title, content, tags = []) {
        this.memoryManager.rememberImportantNote(title, content, tags);
    }
    async getFormattedMemory() {
        return this.memoryManager.getFormattedMemory();
    }
    async searchMemory(query) {
        return this.memoryManager.searchMemory(query);
    }
    async updateProjectContext(framework, language, dependencies) {
        if (framework) {
            this.memoryManager.updateProjectContext('framework', framework);
        }
        if (language) {
            this.memoryManager.updateProjectContext('language', language);
        }
        if (dependencies) {
            this.memoryManager.updateProjectContext('dependencies', dependencies);
        }
    }
}
exports.AIAgentProvider = AIAgentProvider;
//# sourceMappingURL=aiAgentProvider.js.map