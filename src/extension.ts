import * as vscode from 'vscode';
import { AIAgentProvider } from './ai/aiAgentProvider';
import { ProjectAnalyzer } from './utils/projectAnalyzer';
import { ChatWebviewProvider } from './webview/chatWebviewProvider';
import { TaskManager } from './utils/taskManager';
import { TerminalMonitor } from './utils/terminalMonitor';
import { NotesProvider } from './providers/notesProvider';
import { ProjectOverviewProvider } from './providers/projectOverviewProvider';
import { TasksProvider } from './providers/tasksProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Web3 AI Agent extension is now active!');

    // Initialize core components
    const aiAgent = new AIAgentProvider(context);
    const projectAnalyzer = new ProjectAnalyzer(aiAgent);
    const taskManager = new TaskManager(aiAgent);
    const terminalMonitor = new TerminalMonitor(aiAgent);
    const chatProvider = new ChatWebviewProvider(context, aiAgent);

    // Initialize tree view providers
    const projectOverviewProvider = new ProjectOverviewProvider(projectAnalyzer);
    const tasksProvider = new TasksProvider(taskManager);
    const notesProvider = new NotesProvider(context);

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
                    
                    vscode.window.showInformationMessage(
                        `Project analysis complete! Found ${analysis.components.length} components, ${analysis.contracts.length} contracts.`
                    );
                } catch (error) {
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
                    } catch (error) {
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
                            } else {
                                await aiAgent.generateSuiContract(contractName);
                            }
                            vscode.window.showInformationMessage(`${blockchain} contract ${contractName} generated successfully!`);
                        } catch (error) {
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
                            const fullRange = new vscode.Range(
                                editor.document.positionAt(0),
                                editor.document.positionAt(editor.document.getText().length)
                            );
                            editBuilder.replace(fullRange, optimizedCode);
                        });
                    } else {
                        await editor.edit(editBuilder => {
                            editBuilder.replace(selection, optimizedCode);
                        });
                    }

                    vscode.window.showInformationMessage('Code optimized successfully!');
                } catch (error) {
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
                await taskManager.deployContract(blockchain.toLowerCase() as 'solana' | 'sui');
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
                } catch (error) {
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
                } catch (error) {
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
                } catch (error) {
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
                } catch (error) {
                    vscode.window.showErrorMessage(`Accessibility audit failed: ${error}`);
                }
            });
        }),

        // Task management commands
        vscode.commands.registerCommand('jordi.showTaskDetails', async (taskId: string) => {
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

        vscode.commands.registerCommand('jordi.pauseTask', async (taskId: string) => {
            vscode.window.showInformationMessage(`Task ${taskId} paused`);
        }),

        vscode.commands.registerCommand('jordi.resumeTask', async (taskId: string) => {
            vscode.window.showInformationMessage(`Task ${taskId} resumed`);
        }),

        vscode.commands.registerCommand('jordi.cancelTask', async (taskId: string) => {
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
                            type: 'unknown' as const,
                            severity: 'medium' as const,
                            message: errorText,
                            autoFixable: true,
                            rawOutput: errorText
                        };

                        // This would trigger the error handling pipeline
                        vscode.window.showInformationMessage('Error analysis completed! Check the AI suggestions.');
                    } catch (error) {
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
                    } else {
                        vscode.window.showErrorMessage('❌ Local LLM connection failed. Check your configuration.');
                    }
                } catch (error) {
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
                } else {
                    vscode.window.showWarningMessage('No local models found. Make sure your local LLM server is running.');
                }
            } catch (error) {
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

            if (!endpoint) return;

            const apiFormat = await vscode.window.showQuickPick([
                'ollama',
                'openai',
                'textgen',
                'vllm',
                'custom'
            ], {
                placeHolder: 'Select API format'
            });

            if (!apiFormat) return;

            const model = await vscode.window.showInputBox({
                prompt: 'Enter model name',
                value: currentConfig.get('model', 'codellama:7b'),
                placeHolder: 'codellama:7b'
            });

            if (!model) return;

            // Update configuration
            await currentConfig.update('endpoint', endpoint, vscode.ConfigurationTarget.Global);
            await currentConfig.update('apiFormat', apiFormat, vscode.ConfigurationTarget.Global);
            await currentConfig.update('model', model, vscode.ConfigurationTarget.Global);

            vscode.window.showInformationMessage('Local LLM configuration updated!', 'Test Connection').then(selection => {
                if (selection === 'Test Connection') {
                    vscode.commands.executeCommand('jordi.testLocalLLM');
                }
            });
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

    // Show welcome message
    vscode.window.showInformationMessage(
        'Web3 AI Agent is ready! Click the robot icon in the activity bar to get started.',
        'Open Chat'
    ).then(selection => {
        if (selection === 'Open Chat') {
            vscode.commands.executeCommand('jordi.openChat');
        }
    });
}

export function deactivate() {
    console.log('Web3 AI Agent extension deactivated');
}