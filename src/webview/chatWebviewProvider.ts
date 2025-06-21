import * as vscode from 'vscode';
import { AIAgentProvider } from '../ai/aiAgentProvider';
import { ChatConfigHandler } from '../utils/chatConfigHandler';

export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    model?: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
}

export class ChatWebviewProvider {
    private context: vscode.ExtensionContext;
    private aiAgent: AIAgentProvider;
    private panel?: vscode.WebviewPanel;
    private messages: ChatMessage[] = [];
    private configHandler: ChatConfigHandler;

    constructor(context: vscode.ExtensionContext, aiAgent: AIAgentProvider) {
        this.context = context;
        this.aiAgent = aiAgent;
        this.configHandler = new ChatConfigHandler(aiAgent);
    }

    public show(): void {
        if (this.panel) {
            this.panel.reveal();
            return;
        }

        this.panel = vscode.window.createWebviewPanel(
            'web3-ai-chat',
            'Web3 AI Agent Chat',
            vscode.ViewColumn.Beside,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [this.context.extensionUri]
            }
        );

        this.panel.webview.html = this.getWebviewContent();
        this.setupWebviewMessageHandling();

        this.panel.onDidDispose(() => {
            this.panel = undefined;
        });

        // Send welcome message
        this.addMessage({
            id: this.generateId(),
            role: 'assistant',
            content: `Hello! I'm Jordi 🤖, your AI development assistant. I can help you with:

🚀 **Next.js Development**
- Generate components and pages
- Optimize code and performance
- Debug and fix issues

⛓️ **Blockchain Development**
- Create Solana smart contracts (Rust/Anchor)
- Build Sui contracts (Move language)
- Deploy and test contracts

🔧 **Project Management**
- Analyze project structure
- Run automated tests
- Perform security audits
- Generate documentation

💡 **AI-Powered Assistance**
- Code reviews and suggestions
- Best practices recommendations
- Troubleshooting and debugging

⚙️ **Easy Configuration** (NEW!)
- "set openai api to sk-xxx" - Configure API keys
- "switch to deepseek" - Change AI models
- "use ollama model codellama:7b" - Local LLM setup
- "set solana to mainnet" - Network configuration
- "help with config" - Show all options

What would you like to work on today?`,
            timestamp: new Date()
        });
    }

    private setupWebviewMessageHandling(): void {
        if (!this.panel) return;

        this.panel.webview.onDidReceiveMessage(async (message) => {
            switch (message.type) {
                case 'sendMessage':
                    await this.handleUserMessage(message.content);
                    break;
                case 'clearChat':
                    this.clearChat();
                    break;
                case 'exportChat':
                    await this.exportChat();
                    break;
                case 'executeCommand':
                    await this.executeCommand(message.command, message.args);
                    break;
            }
        });
    }

    private async handleUserMessage(content: string): Promise<void> {
        // Add user message
        const userMessage: ChatMessage = {
            id: this.generateId(),
            role: 'user',
            content,
            timestamp: new Date()
        };
        this.addMessage(userMessage);

        try {
            // Show typing indicator
            this.sendToWebview({
                type: 'typing',
                isTyping: true
            });

            // Determine if this is a command or general chat
            const response = await this.processUserInput(content);

            // Hide typing indicator
            this.sendToWebview({
                type: 'typing',
                isTyping: false
            });

            // Add AI response
            const assistantMessage: ChatMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: response.content,
                timestamp: new Date(),
                model: response.model,
                usage: response.usage
            };
            this.addMessage(assistantMessage);

        } catch (error) {
            this.sendToWebview({
                type: 'typing',
                isTyping: false
            });

            const errorMessage: ChatMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: `I encountered an error: ${error}. Please try again or check your API configuration.`,
                timestamp: new Date()
            };
            this.addMessage(errorMessage);
        }
    }

    private async processUserInput(input: string): Promise<any> {
        const lowerInput = input.toLowerCase();

        // First, check if this is a configuration command
        if (this.configHandler.isConfigCommand(input)) {
            const configResponse = await this.configHandler.handleConfigCommand(input);
            if (configResponse) {
                return {
                    content: configResponse,
                    model: 'config-handler'
                };
            }
        }

        // Check for specific commands
        if (lowerInput.includes('generate component') || lowerInput.includes('create component')) {
            return await this.handleComponentGeneration(input);
        } else if (lowerInput.includes('generate contract') || lowerInput.includes('create contract')) {
            return await this.handleContractGeneration(input);
        } else if (lowerInput.includes('analyze project') || lowerInput.includes('analyze code')) {
            return await this.handleProjectAnalysis(input);
        } else if (lowerInput.includes('optimize') || lowerInput.includes('improve')) {
            return await this.handleCodeOptimization(input);
        } else if (lowerInput.includes('test') || lowerInput.includes('testing')) {
            return await this.handleTestingQuestions(input);
        } else if (lowerInput.includes('deploy') || lowerInput.includes('deployment')) {
            return await this.handleDeploymentQuestions(input);
        } else if (lowerInput.includes('security') || lowerInput.includes('audit')) {
            return await this.handleSecurityQuestions(input);
        } else {
            return await this.handleGeneralQuestion(input);
        }
    }

    private async handleComponentGeneration(input: string): Promise<any> {
        const systemPrompt = `You are an expert Next.js developer. Help the user generate React components.
        If they haven't specified a component name, ask for it. If they have, provide guidance on generating it.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Help them generate a Next.js component. If they've specified a name, explain what you'll create.
        If not, ask for the component name and requirements.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleContractGeneration(input: string): Promise<any> {
        const systemPrompt = `You are an expert blockchain developer for Solana and Sui.
        Help the user generate smart contracts. Guide them through the process.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Help them generate a smart contract. Ask about:
        1. Which blockchain (Solana or Sui)
        2. Contract name and purpose
        3. Key functionality needed
        
        Provide guidance on the next steps.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleProjectAnalysis(input: string): Promise<any> {
        const systemPrompt = `You are an expert code analyst and architect.
        Help analyze the project structure and provide insights.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Based on the current project context, provide analysis and recommendations.
        If you need to run a full project analysis, suggest using the "Analyze Project Structure" command.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleCodeOptimization(input: string): Promise<any> {
        const systemPrompt = `You are an expert code optimizer specializing in performance and best practices.
        Help optimize code for Web3 and Next.js applications.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Provide optimization suggestions. If they want to optimize specific code,
        ask them to select the code and use the "Optimize Code" command.
        Otherwise, provide general optimization strategies for their project type.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleTestingQuestions(input: string): Promise<any> {
        const systemPrompt = `You are an expert testing engineer for Web3 and Next.js applications.
        Help with testing strategies, frameworks, and implementation.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Provide testing guidance. If they want to run tests with AI analysis,
        suggest using the "Run Tests with AI Analysis" command.
        Otherwise, provide testing best practices and strategies.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleDeploymentQuestions(input: string): Promise<any> {
        const systemPrompt = `You are an expert DevOps engineer specializing in Web3 deployments.
        Help with deployment strategies for Next.js apps and smart contracts.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Provide deployment guidance. If they want to deploy a contract,
        suggest using the "Deploy Smart Contract" command.
        Otherwise, provide deployment best practices and strategies.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleSecurityQuestions(input: string): Promise<any> {
        const systemPrompt = `You are an expert security auditor for Web3 applications.
        Help with security best practices and vulnerability assessment.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User request: ${input}

        Provide security guidance. If they want a full security audit,
        suggest using the "Security Audit" command.
        Otherwise, provide security best practices and common vulnerability patterns.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async handleGeneralQuestion(input: string): Promise<any> {
        const systemPrompt = `You are a helpful Web3 AI Agent specializing in Next.js and blockchain development.
        Provide helpful, accurate, and actionable advice.
        Consider the project context: ${JSON.stringify(this.aiAgent.getProjectContext())}`;

        const prompt = `User question: ${input}

        Provide a helpful response. If this relates to a specific task that can be automated,
        suggest the appropriate command or action.`;

        return await this.aiAgent.generateResponse(prompt, systemPrompt);
    }

    private async executeCommand(command: string, args?: any): Promise<void> {
        try {
            await vscode.commands.executeCommand(command, args);
            
            const successMessage: ChatMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: `✅ Command executed: ${command}`,
                timestamp: new Date()
            };
            this.addMessage(successMessage);
        } catch (error) {
            const errorMessage: ChatMessage = {
                id: this.generateId(),
                role: 'assistant',
                content: `❌ Failed to execute command: ${error}`,
                timestamp: new Date()
            };
            this.addMessage(errorMessage);
        }
    }

    private addMessage(message: ChatMessage): void {
        this.messages.push(message);
        this.sendToWebview({
            type: 'newMessage',
            message
        });
    }

    private clearChat(): void {
        this.messages = [];
        this.sendToWebview({
            type: 'clearMessages'
        });
    }

    private async exportChat(): Promise<void> {
        const chatContent = this.messages.map(msg => 
            `**${msg.role.toUpperCase()}** (${msg.timestamp.toLocaleString()})\n${msg.content}\n`
        ).join('\n---\n\n');

        const doc = await vscode.workspace.openTextDocument({
            content: `# Web3 AI Agent Chat Export\n\n${chatContent}`,
            language: 'markdown'
        });
        
        await vscode.window.showTextDocument(doc);
    }

    private sendToWebview(message: any): void {
        if (this.panel) {
            this.panel.webview.postMessage(message);
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    private getWebviewContent(): string {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web3 AI Agent Chat</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: var(--vscode-editor-background);
            color: var(--vscode-editor-foreground);
            height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .header {
            padding: 16px;
            border-bottom: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-panel-background);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .header h1 {
            font-size: 18px;
            font-weight: 600;
        }

        .header-actions {
            display: flex;
            gap: 8px;
        }

        .btn {
            padding: 6px 12px;
            border: 1px solid var(--vscode-button-border);
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border-radius: 4px;
            cursor: pointer;
            font-size: 12px;
        }

        .btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .chat-container {
            flex: 1;
            overflow-y: auto;
            padding: 16px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .message {
            display: flex;
            flex-direction: column;
            gap: 8px;
        }

        .message-header {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 12px;
            opacity: 0.8;
        }

        .message-role {
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 3px;
        }

        .message-role.user {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
        }

        .message-role.assistant {
            background-color: var(--vscode-inputValidation-infoBackground);
            color: var(--vscode-inputValidation-infoForeground);
        }

        .message-content {
            padding: 12px;
            border-radius: 8px;
            line-height: 1.5;
            white-space: pre-wrap;
        }

        .message.user .message-content {
            background-color: var(--vscode-input-background);
            border: 1px solid var(--vscode-input-border);
            margin-left: 20px;
        }

        .message.assistant .message-content {
            background-color: var(--vscode-textBlockQuote-background);
            border-left: 4px solid var(--vscode-textBlockQuote-border);
            margin-right: 20px;
        }

        .message-usage {
            font-size: 11px;
            opacity: 0.6;
            margin-top: 4px;
        }

        .input-container {
            padding: 16px;
            border-top: 1px solid var(--vscode-panel-border);
            background-color: var(--vscode-panel-background);
        }

        .input-wrapper {
            display: flex;
            gap: 8px;
            align-items: flex-end;
        }

        .input-field {
            flex: 1;
            min-height: 40px;
            max-height: 120px;
            padding: 10px;
            border: 1px solid var(--vscode-input-border);
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border-radius: 4px;
            resize: vertical;
            font-family: inherit;
            font-size: 14px;
        }

        .input-field:focus {
            outline: none;
            border-color: var(--vscode-focusBorder);
        }

        .send-btn {
            padding: 10px 16px;
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: 600;
        }

        .send-btn:hover {
            background-color: var(--vscode-button-hoverBackground);
        }

        .send-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .typing-indicator {
            display: none;
            padding: 12px;
            font-style: italic;
            opacity: 0.7;
        }

        .typing-indicator.show {
            display: block;
        }

        .quick-actions {
            display: flex;
            gap: 8px;
            margin-bottom: 8px;
            flex-wrap: wrap;
        }

        .quick-action {
            padding: 4px 8px;
            background-color: var(--vscode-badge-background);
            color: var(--vscode-badge-foreground);
            border-radius: 12px;
            font-size: 11px;
            cursor: pointer;
            border: none;
        }

        .quick-action:hover {
            opacity: 0.8;
        }

        code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }

        pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            margin: 8px 0;
        }

        pre code {
            background: none;
            padding: 0;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>🤖 Web3 AI Agent</h1>
        <div class="header-actions">
            <button class="btn" onclick="clearChat()">Clear</button>
            <button class="btn" onclick="exportChat()">Export</button>
        </div>
    </div>

    <div class="chat-container" id="chatContainer">
        <!-- Messages will be added here -->
    </div>

    <div class="typing-indicator" id="typingIndicator">
        AI is thinking...
    </div>

    <div class="input-container">
        <div class="quick-actions">
            <button class="quick-action" onclick="sendQuickMessage('Analyze my project structure')">📊 Analyze Project</button>
            <button class="quick-action" onclick="sendQuickMessage('Generate a React component')">⚛️ Generate Component</button>
            <button class="quick-action" onclick="sendQuickMessage('Create a Solana smart contract')">⛓️ Solana Contract</button>
            <button class="quick-action" onclick="sendQuickMessage('Create a Sui smart contract')">🔗 Sui Contract</button>
            <button class="quick-action" onclick="sendQuickMessage('Run security audit')">🔒 Security Audit</button>
            <button class="quick-action" onclick="sendQuickMessage('Optimize my code')">⚡ Optimize Code</button>
        </div>
        <div class="input-wrapper">
            <textarea 
                id="messageInput" 
                class="input-field" 
                placeholder="Ask me anything about Web3 development..."
                rows="1"
            ></textarea>
            <button id="sendBtn" class="send-btn" onclick="sendMessage()">Send</button>
        </div>
    </div>

    <script>
        const vscode = acquireVsCodeApi();
        let messages = [];

        // Handle messages from extension
        window.addEventListener('message', event => {
            const message = event.data;
            
            switch (message.type) {
                case 'newMessage':
                    addMessage(message.message);
                    break;
                case 'clearMessages':
                    clearMessages();
                    break;
                case 'typing':
                    showTyping(message.isTyping);
                    break;
            }
        });

        function addMessage(message) {
            messages.push(message);
            renderMessage(message);
            scrollToBottom();
        }

        function renderMessage(message) {
            const container = document.getElementById('chatContainer');
            const messageDiv = document.createElement('div');
            messageDiv.className = \`message \${message.role}\`;
            
            const content = formatMessageContent(message.content);
            
            messageDiv.innerHTML = \`
                <div class="message-header">
                    <span class="message-role \${message.role}">\${message.role.toUpperCase()}</span>
                    <span>\${new Date(message.timestamp).toLocaleTimeString()}</span>
                    \${message.model ? \`<span>(\${message.model})</span>\` : ''}
                </div>
                <div class="message-content">\${content}</div>
                \${message.usage ? \`<div class="message-usage">Tokens: \${message.usage.totalTokens} (prompt: \${message.usage.promptTokens}, completion: \${message.usage.completionTokens})</div>\` : ''}
            \`;
            
            container.appendChild(messageDiv);
        }

        function formatMessageContent(content) {
            // Basic markdown-like formatting
            return content
                .replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>')
                .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
                .replace(/\\*\\*([^\\*]+)\\*\\*/g, '<strong>$1</strong>')
                .replace(/\\*([^\\*]+)\\*/g, '<em>$1</em>')
                .replace(/\\n/g, '<br>');
        }

        function sendMessage() {
            const input = document.getElementById('messageInput');
            const content = input.value.trim();
            
            if (!content) return;
            
            vscode.postMessage({
                type: 'sendMessage',
                content: content
            });
            
            input.value = '';
            input.style.height = 'auto';
        }

        function sendQuickMessage(content) {
            vscode.postMessage({
                type: 'sendMessage',
                content: content
            });
        }

        function clearChat() {
            vscode.postMessage({
                type: 'clearChat'
            });
        }

        function exportChat() {
            vscode.postMessage({
                type: 'exportChat'
            });
        }

        function clearMessages() {
            messages = [];
            document.getElementById('chatContainer').innerHTML = '';
        }

        function showTyping(isTyping) {
            const indicator = document.getElementById('typingIndicator');
            indicator.className = isTyping ? 'typing-indicator show' : 'typing-indicator';
            if (isTyping) {
                scrollToBottom();
            }
        }

        function scrollToBottom() {
            const container = document.getElementById('chatContainer');
            container.scrollTop = container.scrollHeight;
        }

        // Auto-resize textarea
        document.getElementById('messageInput').addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = Math.min(this.scrollHeight, 120) + 'px';
        });

        // Send on Enter (but allow Shift+Enter for new lines)
        document.getElementById('messageInput').addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    </script>
</body>
</html>`;
    }
}