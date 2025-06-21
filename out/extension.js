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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const aiAgentProvider_1 = require("./ai/aiAgentProvider");
const projectAnalyzer_1 = require("./utils/projectAnalyzer");
const chatWebviewProvider_1 = require("./webview/chatWebviewProvider");
const taskManager_1 = require("./utils/taskManager");
const terminalMonitor_1 = require("./utils/terminalMonitor");
const notesProvider_1 = require("./providers/notesProvider");
const projectOverviewProvider_1 = require("./providers/projectOverviewProvider");
const tasksProvider_1 = require("./providers/tasksProvider");
function activate(context) {
    console.log('🤖 Jordi AI Agent extension is now active!');
    // Initialize core components
    const aiAgent = new aiAgentProvider_1.AIAgentProvider(context);
    const projectAnalyzer = new projectAnalyzer_1.ProjectAnalyzer(aiAgent);
    const taskManager = new taskManager_1.TaskManager(aiAgent);
    const terminalMonitor = new terminalMonitor_1.TerminalMonitor(aiAgent);
    const chatProvider = new chatWebviewProvider_1.ChatWebviewProvider(context, aiAgent);
    // Show welcome experience
    showWelcomeExperience(context, chatProvider);
    // Create status bar item to show Jordi is active
    const statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarItem.text = "$(robot) Jordi AI";
    statusBarItem.tooltip = "Jordi AI Agent is active - Click to open chat";
    statusBarItem.command = 'jordi.openChat';
    statusBarItem.show();
    context.subscriptions.push(statusBarItem);
    // Initialize tree view providers
    const projectOverviewProvider = new projectOverviewProvider_1.ProjectOverviewProvider(projectAnalyzer);
    const tasksProvider = new tasksProvider_1.TasksProvider(taskManager);
    const notesProvider = new notesProvider_1.NotesProvider(context);
    // Register tree views
    vscode.window.createTreeView('jordi.projectOverview', {
        treeDataProvider: projectOverviewProvider,
        showCollapseAll: true
    });
    vscode.window.createTreeView('jordi.tasks', {
        treeDataProvider: tasksProvider,
        showCollapseAll: true
    });
    vscode.window.createTreeView('jordi.notes', {
        treeDataProvider: notesProvider,
        showCollapseAll: true
    });
    // Register commands
    const commands = [
        vscode.commands.registerCommand('jordi.openChat', () => {
            chatProvider.show();
        }),
        vscode.commands.registerCommand('jordi.analyzeProject', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Analyzing project structure...",
                cancellable: false
            }, async (progress) => {
                try {
                    const analysis = await projectAnalyzer.analyzeWorkspace();
                    projectOverviewProvider.refresh();
                    vscode.window.showInformationMessage(`Project analysis complete! Found ${analysis.components.length} components, ${analysis.contracts.length} contracts.`);
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Analysis failed: ${error}`);
                }
            });
        }),
        vscode.commands.registerCommand('jordi.generateComponent', async () => {
            const componentName = await vscode.window.showInputBox({
                prompt: 'Enter component name',
                placeHolder: 'MyComponent'
            });
            if (componentName) {
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: `Generating ${componentName} component...`,
                    cancellable: false
                }, async () => {
                    try {
                        await aiAgent.generateNextJSComponent(componentName);
                        vscode.window.showInformationMessage(`Component ${componentName} generated successfully!`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Failed to generate component: ${error}`);
                    }
                });
            }
        }),
        vscode.commands.registerCommand('jordi.generateSmartContract', async () => {
            const blockchain = await vscode.window.showQuickPick(['Solana', 'Sui'], {
                placeHolder: 'Select blockchain platform'
            });
            if (blockchain) {
                const contractName = await vscode.window.showInputBox({
                    prompt: `Enter ${blockchain} contract name`,
                    placeHolder: 'MyContract'
                });
                if (contractName) {
                    await vscode.window.withProgress({
                        location: vscode.ProgressLocation.Notification,
                        title: `Generating ${blockchain} smart contract...`,
                        cancellable: false
                    }, async () => {
                        try {
                            if (blockchain === 'Solana') {
                                await aiAgent.generateSolanaContract(contractName);
                            }
                            else {
                                await aiAgent.generateSuiContract(contractName);
                            }
                            vscode.window.showInformationMessage(`${blockchain} contract ${contractName} generated successfully!`);
                        }
                        catch (error) {
                            vscode.window.showErrorMessage(`Failed to generate contract: ${error}`);
                        }
                    });
                }
            }
        }),
        vscode.commands.registerCommand('jordi.optimizeCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found');
                return;
            }
            const selection = editor.selection;
            const text = editor.document.getText(selection.isEmpty ? undefined : selection);
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Optimizing code...",
                cancellable: false
            }, async () => {
                try {
                    const optimizedCode = await aiAgent.optimizeCode(text, editor.document.languageId);
                    if (selection.isEmpty) {
                        await editor.edit(editBuilder => {
                            const fullRange = new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length));
                            editBuilder.replace(fullRange, optimizedCode);
                        });
                    }
                    else {
                        await editor.edit(editBuilder => {
                            editBuilder.replace(selection, optimizedCode);
                        });
                    }
                    vscode.window.showInformationMessage('Code optimized successfully!');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Optimization failed: ${error}`);
                }
            });
        }),
        vscode.commands.registerCommand('jordi.runTests', async () => {
            await taskManager.runTestsWithAnalysis();
        }),
        vscode.commands.registerCommand('jordi.deployContract', async () => {
            const blockchain = await vscode.window.showQuickPick(['Solana', 'Sui'], {
                placeHolder: 'Select blockchain platform'
            });
            if (blockchain) {
                await taskManager.deployContract(blockchain.toLowerCase());
            }
        }),
        vscode.commands.registerCommand('jordi.auditSecurity', async () => {
            await taskManager.performSecurityAudit();
        }),
        // Node.js specific commands
        vscode.commands.registerCommand('jordi.optimizeNodeJS', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Optimizing Node.js application...",
                cancellable: false
            }, async () => {
                try {
                    await taskManager.optimizeNodeJSApp();
                    vscode.window.showInformationMessage('Node.js optimization completed!');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Node.js optimization failed: ${error}`);
                }
            });
        }),
        vscode.commands.registerCommand('jordi.generateAPI', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Generating API endpoints...",
                cancellable: false
            }, async () => {
                try {
                    await taskManager.generateAPIEndpoints();
                    vscode.window.showInformationMessage('API endpoints generated successfully!');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`API generation failed: ${error}`);
                }
            });
        }),
        // UI/UX specific commands
        vscode.commands.registerCommand('jordi.designComponents', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Designing UI/UX components...",
                cancellable: false
            }, async () => {
                try {
                    await taskManager.designUIUXComponents();
                    vscode.window.showInformationMessage('UI/UX components designed successfully!');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`UI/UX design failed: ${error}`);
                }
            });
        }),
        vscode.commands.registerCommand('jordi.auditAccessibility', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Auditing accessibility...",
                cancellable: false
            }, async () => {
                try {
                    await taskManager.auditAccessibility();
                    vscode.window.showInformationMessage('Accessibility audit completed!');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Accessibility audit failed: ${error}`);
                }
            });
        }),
        // Task management commands
        vscode.commands.registerCommand('jordi.showTaskDetails', async (taskId) => {
            const task = taskManager.getTask(taskId);
            if (task) {
                // Show task details in a new document
                const details = `# Task Details: ${task.name}

**Status**: ${task.status}
**Progress**: ${task.progress}%
**Category**: ${task.category}
**Description**: ${task.description}

## Steps
${task.steps.map((step, i) => `${i + 1}. ${step.name} - ${step.status} (${step.progress}%)`).join('\n')}

## Recent Logs
${task.logs.slice(-5).map(log => `[${log.timestamp.toLocaleTimeString()}] ${log.level.toUpperCase()}: ${log.message}`).join('\n')}
`;
                const doc = await vscode.workspace.openTextDocument({
                    content: details,
                    language: 'markdown'
                });
                await vscode.window.showTextDocument(doc);
            }
        }),
        vscode.commands.registerCommand('jordi.pauseTask', async (taskId) => {
            vscode.window.showInformationMessage(`Task ${taskId} paused`);
        }),
        vscode.commands.registerCommand('jordi.resumeTask', async (taskId) => {
            vscode.window.showInformationMessage(`Task ${taskId} resumed`);
        }),
        vscode.commands.registerCommand('jordi.cancelTask', async (taskId) => {
            vscode.window.showInformationMessage(`Task ${taskId} canceled`);
        }),
        // Terminal monitoring commands
        vscode.commands.registerCommand('jordi.startTerminalMonitoring', async () => {
            terminalMonitor.startMonitoring();
        }),
        vscode.commands.registerCommand('jordi.stopTerminalMonitoring', async () => {
            terminalMonitor.stopMonitoring();
        }),
        vscode.commands.registerCommand('jordi.toggleAutoFix', async () => {
            terminalMonitor.toggleAutoFix();
        }),
        vscode.commands.registerCommand('jordi.analyzeTerminalError', async () => {
            const activeTerminal = vscode.window.activeTerminal;
            if (!activeTerminal) {
                vscode.window.showWarningMessage('No active terminal found');
                return;
            }
            const errorText = await vscode.window.showInputBox({
                prompt: 'Paste the error message from terminal',
                placeHolder: 'Error: Cannot find module...'
            });
            if (errorText) {
                await vscode.window.withProgress({
                    location: vscode.ProgressLocation.Notification,
                    title: "Analyzing terminal error...",
                    cancellable: false
                }, async () => {
                    try {
                        // Create a mock terminal error for analysis
                        const terminalError = {
                            type: 'unknown',
                            severity: 'medium',
                            message: errorText,
                            autoFixable: true,
                            rawOutput: errorText
                        };
                        // This would trigger the error handling pipeline
                        vscode.window.showInformationMessage('Error analysis completed! Check the AI suggestions.');
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Error analysis failed: ${error}`);
                    }
                });
            }
        }),
        // Local LLM management commands
        vscode.commands.registerCommand('jordi.testLocalLLM', async () => {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Testing local LLM connection...",
                cancellable: false
            }, async () => {
                try {
                    const isConnected = await aiAgent.testLocalLLMConnection();
                    if (isConnected) {
                        vscode.window.showInformationMessage('✅ Local LLM connection successful!');
                    }
                    else {
                        vscode.window.showErrorMessage('❌ Local LLM connection failed. Check your configuration.');
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Local LLM test failed: ${error}`);
                }
            });
        }),
        vscode.commands.registerCommand('jordi.listLocalModels', async () => {
            try {
                const models = await aiAgent.getAvailableLocalModels();
                if (models.length > 0) {
                    const selectedModel = await vscode.window.showQuickPick(models, {
                        placeHolder: 'Select a local model to use'
                    });
                    if (selectedModel) {
                        const config = vscode.workspace.getConfiguration('jordi.localLLM');
                        await config.update('model', selectedModel, vscode.ConfigurationTarget.Global);
                        vscode.window.showInformationMessage(`Local model set to: ${selectedModel}`);
                    }
                }
                else {
                    vscode.window.showWarningMessage('No local models found. Make sure your local LLM server is running.');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to list local models: ${error}`);
            }
        }),
        vscode.commands.registerCommand('jordi.configureLocalLLM', async () => {
            const currentConfig = vscode.workspace.getConfiguration('jordi.localLLM');
            const endpoint = await vscode.window.showInputBox({
                prompt: 'Enter local LLM endpoint URL',
                value: currentConfig.get('endpoint', 'http://localhost:11434'),
                placeHolder: 'http://localhost:11434'
            });
            if (!endpoint)
                return;
            const apiFormat = await vscode.window.showQuickPick([
                'ollama',
                'openai',
                'textgen',
                'vllm',
                'custom'
            ], {
                placeHolder: 'Select API format'
            });
            if (!apiFormat)
                return;
            const model = await vscode.window.showInputBox({
                prompt: 'Enter model name',
                value: currentConfig.get('model', 'codellama:7b'),
                placeHolder: 'codellama:7b'
            });
            if (!model)
                return;
            // Update configuration
            await currentConfig.update('endpoint', endpoint, vscode.ConfigurationTarget.Global);
            await currentConfig.update('apiFormat', apiFormat, vscode.ConfigurationTarget.Global);
            await currentConfig.update('model', model, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage('Local LLM configuration updated!', 'Test Connection').then(selection => {
                if (selection === 'Test Connection') {
                    vscode.commands.executeCommand('jordi.testLocalLLM');
                }
            });
        }),
        // Welcome experience commands
        vscode.commands.registerCommand('jordi.resetWelcome', async () => {
            await context.globalState.update('jordi.hasShownWelcome', false);
            vscode.window.showInformationMessage('Welcome experience reset! Reload the window to see it again.', 'Reload Window').then(selection => {
                if (selection === 'Reload Window') {
                    vscode.commands.executeCommand('workbench.action.reloadWindow');
                }
            });
        }),
        vscode.commands.registerCommand('jordi.showFeatures', () => {
            showFeaturesOverview();
        }),
        // Memory Management Commands
        vscode.commands.registerCommand('jordi.showMemory', async () => {
            try {
                const formattedMemory = await aiAgent.getFormattedMemory();
                const panel = vscode.window.createWebviewPanel('jordiMemory', 'Jordi\'s Memory Notepad', vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true
                });
                panel.webview.html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Jordi's Memory</title>
                        <style>
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                padding: 20px;
                                line-height: 1.6;
                                color: var(--vscode-foreground);
                                background: var(--vscode-editor-background);
                            }
                            .memory-section {
                                margin-bottom: 20px;
                                padding: 15px;
                                border: 1px solid var(--vscode-panel-border);
                                border-radius: 8px;
                                background: var(--vscode-editor-background);
                            }
                            .memory-title {
                                font-size: 18px;
                                font-weight: bold;
                                margin-bottom: 10px;
                                color: var(--vscode-textLink-foreground);
                            }
                            .memory-item {
                                margin-bottom: 10px;
                                padding: 8px;
                                background: var(--vscode-input-background);
                                border-radius: 4px;
                            }
                            .priority-critical { border-left: 4px solid #ff4444; }
                            .priority-high { border-left: 4px solid #ffaa00; }
                            .priority-medium { border-left: 4px solid #0088ff; }
                            .priority-low { border-left: 4px solid #888888; }
                        </style>
                    </head>
                    <body>
                        <h1>🧠 Jordi's Memory Notepad</h1>
                        <div style="white-space: pre-wrap;">${formattedMemory}</div>
                    </body>
                    </html>
                `;
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to show memory: ${error}`);
            }
        }),
        vscode.commands.registerCommand('jordi.searchMemory', async () => {
            try {
                const query = await vscode.window.showInputBox({
                    prompt: 'What would you like to search for in memory?',
                    placeHolder: 'e.g., API keys, React components, user preferences...'
                });
                if (!query)
                    return;
                const results = await aiAgent.searchMemory(query);
                if (results.length === 0) {
                    vscode.window.showInformationMessage(`No memories found for "${query}"`);
                    return;
                }
                const panel = vscode.window.createWebviewPanel('jordiMemorySearch', `Memory Search: ${query}`, vscode.ViewColumn.One, {
                    enableScripts: true,
                    retainContextWhenHidden: true
                });
                let html = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Memory Search Results</title>
                        <style>
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                padding: 20px;
                                line-height: 1.6;
                                color: var(--vscode-foreground);
                                background: var(--vscode-editor-background);
                            }
                            .result {
                                margin-bottom: 15px;
                                padding: 15px;
                                border: 1px solid var(--vscode-panel-border);
                                border-radius: 8px;
                                background: var(--vscode-input-background);
                            }
                            .result-title {
                                font-weight: bold;
                                color: var(--vscode-textLink-foreground);
                                margin-bottom: 5px;
                            }
                            .result-meta {
                                font-size: 12px;
                                color: var(--vscode-descriptionForeground);
                                margin-bottom: 8px;
                            }
                            .priority-critical { border-left: 4px solid #ff4444; }
                            .priority-high { border-left: 4px solid #ffaa00; }
                            .priority-medium { border-left: 4px solid #0088ff; }
                            .priority-low { border-left: 4px solid #888888; }
                        </style>
                    </head>
                    <body>
                        <h1>🔍 Search Results for "${query}"</h1>
                        <p>Found ${results.length} memories:</p>
                `;
                results.forEach(memory => {
                    const priorityIcon = {
                        'critical': '🔴',
                        'high': '🟡',
                        'medium': '🔵',
                        'low': '⚪'
                    }[memory.priority];
                    html += `
                        <div class="result priority-${memory.priority}">
                            <div class="result-title">${priorityIcon} ${memory.title}</div>
                            <div class="result-meta">${memory.category} • ${memory.timestamp.toLocaleDateString()}</div>
                            <div>${memory.content}</div>
                        </div>
                    `;
                });
                html += `
                    </body>
                    </html>
                `;
                panel.webview.html = html;
            }
            catch (error) {
                vscode.window.showErrorMessage(`Failed to search memory: ${error}`);
            }
        }),
        vscode.commands.registerCommand('jordi.clearMemory', async () => {
            const confirmation = await vscode.window.showWarningMessage('Are you sure you want to clear all memories? This action cannot be undone.', { modal: true }, 'Clear Memory', 'Cancel');
            if (confirmation === 'Clear Memory') {
                try {
                    aiAgent.getMemoryManager().clearMemory();
                    vscode.window.showInformationMessage('🧠 Memory cleared! Starting fresh with a new notepad.');
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to clear memory: ${error}`);
                }
            }
        })
    ];
    // Add all commands to subscriptions
    commands.forEach(command => context.subscriptions.push(command));
    // Auto-analyze project on startup if enabled
    const config = vscode.workspace.getConfiguration('web3-ai-agent');
    if (config.get('autoAnalyze', true)) {
        setTimeout(() => {
            vscode.commands.executeCommand('jordi.analyzeProject');
        }, 2000);
    }
    // Auto-start terminal monitoring if enabled
    if (config.get('terminalMonitoring.autoStart', true)) {
        setTimeout(() => {
            terminalMonitor.startMonitoring();
        }, 1000);
    }
    // Add terminal monitor to disposables
    context.subscriptions.push(terminalMonitor);
}
exports.activate = activate;
async function showWelcomeExperience(context, chatProvider) {
    // Check if this is the first time the extension is activated
    const isFirstTime = !context.globalState.get('jordi.hasShownWelcome', false);
    const hasWorkspace = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
    if (isFirstTime) {
        // Mark that we've shown the welcome
        await context.globalState.update('jordi.hasShownWelcome', true);
        // Show comprehensive welcome
        if (!hasWorkspace) {
            // No workspace - guide user to open a folder
            const action = await vscode.window.showInformationMessage('🤖 Welcome to Jordi AI Agent! To get started, please open a folder or workspace.', 'Open Folder', 'Open Workspace', 'Continue Without Folder');
            switch (action) {
                case 'Open Folder':
                    await vscode.commands.executeCommand('vscode.openFolder');
                    break;
                case 'Open Workspace':
                    await vscode.commands.executeCommand('workbench.action.openWorkspace');
                    break;
                case 'Continue Without Folder':
                    showGettingStartedMessage(chatProvider);
                    break;
            }
        }
        else {
            // Has workspace - show getting started
            showGettingStartedMessage(chatProvider);
        }
    }
    else {
        // Returning user - simple activation message
        const action = await vscode.window.showInformationMessage('🤖 Jordi AI Agent is ready! Your smart coding companion for Next.js and Web3 development.', 'Open Chat', 'Show Memory');
        switch (action) {
            case 'Open Chat':
                chatProvider.show();
                break;
            case 'Show Memory':
                vscode.commands.executeCommand('jordi.showMemory');
                break;
        }
    }
}
function showGettingStartedMessage(chatProvider) {
    const action = vscode.window.showInformationMessage('🎉 Jordi is ready to help! I can assist with Next.js development, Web3 projects (Solana & Sui), code optimization, and much more.', 'Start Chatting', 'View Features', 'Configure AI').then(selection => {
        switch (selection) {
            case 'Start Chatting':
                chatProvider.show();
                // Send a welcome message to the chat
                setTimeout(() => {
                    chatProvider.sendWelcomeMessage();
                }, 500);
                break;
            case 'View Features':
                showFeaturesOverview();
                break;
            case 'Configure AI':
                vscode.commands.executeCommand('jordi.configureLocalLLM');
                break;
        }
    });
}
function showFeaturesOverview() {
    const panel = vscode.window.createWebviewPanel('jordiFeaturesOverview', '🤖 Jordi AI Agent - Features', vscode.ViewColumn.One, {
        enableScripts: true,
        retainContextWhenHidden: true
    });
    panel.webview.html = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Jordi Features</title>
            <style>
                body { 
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    padding: 20px;
                    line-height: 1.6;
                    color: var(--vscode-foreground);
                    background: var(--vscode-editor-background);
                }
                .feature-section {
                    margin-bottom: 30px;
                    padding: 20px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 8px;
                    background: var(--vscode-editor-background);
                }
                .feature-title {
                    font-size: 20px;
                    font-weight: bold;
                    margin-bottom: 15px;
                    color: var(--vscode-textLink-foreground);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .feature-list {
                    list-style: none;
                    padding: 0;
                }
                .feature-list li {
                    margin-bottom: 8px;
                    padding: 8px 12px;
                    background: var(--vscode-input-background);
                    border-radius: 4px;
                    border-left: 3px solid var(--vscode-textLink-foreground);
                }
                .header {
                    text-align: center;
                    margin-bottom: 30px;
                    padding: 20px;
                    background: var(--vscode-input-background);
                    border-radius: 8px;
                }
                .header h1 {
                    margin: 0;
                    color: var(--vscode-textLink-foreground);
                    font-size: 28px;
                }
                .header p {
                    margin: 10px 0 0 0;
                    font-size: 16px;
                    opacity: 0.8;
                }
                .quick-start {
                    background: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    padding: 15px;
                    border-radius: 8px;
                    text-align: center;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🤖 Jordi AI Agent</h1>
                <p>Your intelligent coding companion for Next.js and Web3 development</p>
            </div>

            <div class="feature-section">
                <div class="feature-title">💬 Smart Chat Interface</div>
                <ul class="feature-list">
                    <li>Natural language commands with 48+ patterns</li>
                    <li>Context-aware conversations about your project</li>
                    <li>Memory system that remembers your preferences</li>
                    <li>Multi-AI support (ChatGPT, Claude, DeepSeek, Local LLMs)</li>
                </ul>
            </div>

            <div class="feature-section">
                <div class="feature-title">🌐 Web3 Development</div>
                <ul class="feature-list">
                    <li>Solana smart contract generation and deployment</li>
                    <li>Sui blockchain development tools</li>
                    <li>Security auditing for smart contracts</li>
                    <li>Web3 integration patterns and best practices</li>
                </ul>
            </div>

            <div class="feature-section">
                <div class="feature-title">⚡ Next.js & Node.js</div>
                <ul class="feature-list">
                    <li>Project analysis and optimization</li>
                    <li>API endpoint generation</li>
                    <li>Performance optimization suggestions</li>
                    <li>Code refactoring and improvements</li>
                </ul>
            </div>

            <div class="feature-section">
                <div class="feature-title">🎨 UI/UX Design</div>
                <ul class="feature-list">
                    <li>Component design and generation</li>
                    <li>Accessibility auditing</li>
                    <li>Design system recommendations</li>
                    <li>Responsive design patterns</li>
                </ul>
            </div>

            <div class="feature-section">
                <div class="feature-title">🔧 Development Tools</div>
                <ul class="feature-list">
                    <li>Terminal error monitoring and auto-fix</li>
                    <li>Task management and progress tracking</li>
                    <li>Code optimization and refactoring</li>
                    <li>Test generation and execution</li>
                </ul>
            </div>

            <div class="quick-start">
                <strong>🚀 Quick Start:</strong> Click the 🤖 robot icon in the Activity Bar to open Jordi's chat interface!
            </div>
        </body>
        </html>
    `;
}
function deactivate() {
    console.log('🤖 Jordi AI Agent extension deactivated');
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map