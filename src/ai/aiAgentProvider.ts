import * as vscode from 'vscode';
import axios from 'axios';
import { LocalLLMProvider, LocalLLMResponse } from './localLLMProvider';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export interface AIResponse {
    content: string;
    model: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export interface ProjectContext {
    framework: string;
    blockchain: string[];
    dependencies: string[];
    structure: any;
    files: string[];
}

export class AIAgentProvider {
    private context: vscode.ExtensionContext;
    private openai?: OpenAI;
    private anthropic?: Anthropic;
    private localLLM: LocalLLMProvider;
    private projectContext?: ProjectContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.localLLM = new LocalLLMProvider();
        this.initializeClients();
    }

    private initializeClients() {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        
        const openaiKey = config.get<string>('openaiApiKey');
        if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey });
        }

        const claudeKey = config.get<string>('claudeApiKey');
        if (claudeKey) {
            this.anthropic = new Anthropic({ apiKey: claudeKey });
        }
    }

    async generateResponse(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const preferredModel = config.get<string>('preferredModel', 'deepseek');

        try {
            switch (preferredModel) {
                case 'deepseek':
                    return await this.callDeepSeek(prompt, systemPrompt);
                case 'gpt-4':
                case 'gpt-3.5-turbo':
                    return await this.callOpenAI(prompt, systemPrompt, preferredModel);
                case 'claude-3-opus':
                case 'claude-3-sonnet':
                    return await this.callClaude(prompt, systemPrompt, preferredModel);
                case 'local-llm':
                    return await this.callLocalLLM(prompt, systemPrompt);
                case 'custom':
                    return await this.callCustomAPI(prompt, systemPrompt);
                default:
                    return await this.callDeepSeek(prompt, systemPrompt);
            }
        } catch (error) {
            throw new Error(`AI API call failed: ${error}`);
        }
    }

    private async callDeepSeek(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const apiKey = config.get<string>('deepseekApiKey');
        
        if (!apiKey) {
            throw new Error('DeepSeek API key not configured');
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const response = await axios.post('https://api.deepseek.com/v1/chat/completions', {
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

    private async callOpenAI(prompt: string, systemPrompt?: string, model: string = 'gpt-4'): Promise<AIResponse> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized');
        }

        const messages: any[] = [];
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

    private async callClaude(prompt: string, systemPrompt?: string, model: string = 'claude-3-sonnet-20240229'): Promise<AIResponse> {
        if (!this.anthropic) {
            throw new Error('Anthropic client not initialized');
        }

        try {
            const response = await (this.anthropic as any).messages.create({
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
        } catch (error) {
            throw new Error(`Claude API call failed: ${error}`);
        }
    }

    private async callCustomAPI(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        const endpoint = config.get<string>('customApiEndpoint');
        const apiKey = config.get<string>('customApiKey');

        if (!endpoint) {
            throw new Error('Custom API endpoint not configured');
        }

        const messages = [];
        if (systemPrompt) {
            messages.push({ role: 'system', content: systemPrompt });
        }
        messages.push({ role: 'user', content: prompt });

        const headers: any = { 'Content-Type': 'application/json' };
        if (apiKey) {
            headers['Authorization'] = `Bearer ${apiKey}`;
        }

        const response = await axios.post(endpoint, {
            messages,
            temperature: 0.1,
            max_tokens: 4000
        }, { headers });

        return {
            content: response.data.choices?.[0]?.message?.content || response.data.content || '',
            model: 'custom'
        };
    }

    private async callLocalLLM(prompt: string, systemPrompt?: string): Promise<AIResponse> {
        try {
            const response: LocalLLMResponse = await this.localLLM.generateResponse(prompt, systemPrompt);
            
            return {
                content: response.content,
                model: response.model,
                usage: response.usage
            };
        } catch (error) {
            throw new Error(`Local LLM call failed: ${error}`);
        }
    }

    async generateNextJSComponent(componentName: string): Promise<void> {
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

    async generateSolanaContract(contractName: string): Promise<void> {
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

    async generateSuiContract(contractName: string): Promise<void> {
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

    async optimizeCode(code: string, language: string): Promise<string> {
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

    async analyzeCodeForIssues(code: string, language: string): Promise<string> {
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

    async generateTests(code: string, language: string): Promise<string> {
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

    private async createComponentFile(componentName: string, content: string): Promise<void> {
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

    private async createContractFile(contractName: string, content: string, blockchain: 'solana' | 'sui'): Promise<void> {
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

    private async determineComponentPath(componentName: string): Promise<string> {
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
            } catch {
                // Directory doesn't exist, continue
            }
        }

        // Default to first option
        return possiblePaths[0];
    }

    setProjectContext(context: ProjectContext) {
        this.projectContext = context;
    }

    getProjectContext(): ProjectContext | undefined {
        return this.projectContext;
    }

    // Local LLM management methods
    async testLocalLLMConnection(): Promise<boolean> {
        return await this.localLLM.testConnection();
    }

    async getAvailableLocalModels(): Promise<string[]> {
        return await this.localLLM.getAvailableModels();
    }

    updateLocalLLMConfig(config: any): void {
        this.localLLM.updateConfig(config);
    }

    dispose(): void {
        this.localLLM.dispose();
    }
}