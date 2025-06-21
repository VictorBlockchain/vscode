import * as vscode from 'vscode';
import { AIAgentProvider } from '../ai/aiAgentProvider';
import { ERROR_PATTERNS, matchErrorPattern, extractErrorDetails, generateFixCommands } from './errorPatterns';

export interface TerminalError {
    type: 'compilation' | 'runtime' | 'dependency' | 'test' | 'deployment' | 'unknown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    file?: string;
    line?: number;
    column?: number;
    suggestion?: string;
    autoFixable: boolean;
    rawOutput: string;
}

export interface TerminalFix {
    description: string;
    commands: string[];
    files: { path: string; content: string; action: 'create' | 'modify' | 'delete' }[];
    confidence: number;
    estimatedTime: string;
}

export class TerminalMonitor {
    private aiAgent: AIAgentProvider;
    private activeTerminals: Map<vscode.Terminal, string> = new Map();
    private outputBuffer: Map<vscode.Terminal, string[]> = new Map();
    private isMonitoring: boolean = false;
    private autoFixEnabled: boolean = true;
    private outputChannel: vscode.OutputChannel;

    constructor(aiAgent: AIAgentProvider) {
        this.aiAgent = aiAgent;
        this.outputChannel = vscode.window.createOutputChannel('Web3 AI Agent - Terminal Monitor');
        this.setupTerminalMonitoring();
    }

    private setupTerminalMonitoring(): void {
        // Monitor terminal creation
        vscode.window.onDidOpenTerminal(terminal => {
            this.registerTerminal(terminal);
        });

        // Monitor terminal closure
        vscode.window.onDidCloseTerminal(terminal => {
            this.unregisterTerminal(terminal);
        });

        // Register existing terminals
        vscode.window.terminals.forEach(terminal => {
            this.registerTerminal(terminal);
        });
    }

    private registerTerminal(terminal: vscode.Terminal): void {
        this.activeTerminals.set(terminal, '');
        this.outputBuffer.set(terminal, []);
        this.log(`Registered terminal: ${terminal.name}`);
    }

    private unregisterTerminal(terminal: vscode.Terminal): void {
        this.activeTerminals.delete(terminal);
        this.outputBuffer.delete(terminal);
        this.log(`Unregistered terminal: ${terminal.name}`);
    }

    public startMonitoring(): void {
        this.isMonitoring = true;
        this.log('Terminal monitoring started');
        
        // Start monitoring terminal output
        this.monitorTerminalOutput();
        
        vscode.window.showInformationMessage(
            '🤖 Terminal monitoring enabled! AI will automatically detect and fix errors.',
            'Settings'
        ).then(selection => {
            if (selection === 'Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'web3-ai-agent.terminalMonitoring');
            }
        });
    }

    public stopMonitoring(): void {
        this.isMonitoring = false;
        this.log('Terminal monitoring stopped');
        vscode.window.showInformationMessage('Terminal monitoring disabled');
    }

    public toggleAutoFix(): void {
        this.autoFixEnabled = !this.autoFixEnabled;
        const status = this.autoFixEnabled ? 'enabled' : 'disabled';
        this.log(`Auto-fix ${status}`);
        vscode.window.showInformationMessage(`Auto-fix ${status}`);
    }

    private async monitorTerminalOutput(): Promise<void> {
        // This is a simplified implementation
        // In a real implementation, we'd need to hook into terminal output streams
        // For now, we'll simulate monitoring by checking for common error patterns
        
        setInterval(async () => {
            if (!this.isMonitoring) return;
            
            // Check for compilation errors in workspace
            await this.checkForCompilationErrors();
            
            // Check for package.json issues
            await this.checkForDependencyIssues();
            
            // Check for test failures
            await this.checkForTestFailures();
            
        }, 5000); // Check every 5 seconds
    }

    private async checkForCompilationErrors(): Promise<void> {
        const diagnostics = vscode.languages.getDiagnostics();
        
        for (const [uri, diags] of diagnostics) {
            const errors = diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            
            if (errors.length > 0) {
                for (const error of errors) {
                    const terminalError: TerminalError = {
                        type: 'compilation',
                        severity: 'high',
                        message: error.message,
                        file: uri.fsPath,
                        line: error.range.start.line + 1,
                        column: error.range.start.character + 1,
                        autoFixable: this.isAutoFixable(error.message),
                        rawOutput: `${uri.fsPath}:${error.range.start.line + 1}:${error.range.start.character + 1} - error: ${error.message}`
                    };

                    if (terminalError.autoFixable && this.autoFixEnabled) {
                        await this.handleError(terminalError);
                    }
                }
            }
        }
    }

    private async checkForDependencyIssues(): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(packageJsonContent.toString());

            // Check for missing dependencies
            const missingDeps = await this.findMissingDependencies(packageJson);
            
            if (missingDeps.length > 0) {
                const terminalError: TerminalError = {
                    type: 'dependency',
                    severity: 'medium',
                    message: `Missing dependencies: ${missingDeps.join(', ')}`,
                    autoFixable: true,
                    rawOutput: `npm ERR! Cannot resolve dependency: ${missingDeps.join(', ')}`
                };

                if (this.autoFixEnabled) {
                    await this.handleError(terminalError);
                }
            }
        } catch (error) {
            // package.json doesn't exist or is invalid
        }
    }

    private async checkForTestFailures(): Promise<void> {
        // This would check for test output patterns
        // For now, we'll simulate common test failure scenarios
    }

    private isAutoFixable(errorMessage: string): boolean {
        const pattern = matchErrorPattern(errorMessage);
        return pattern ? pattern.autoFixable : false;
    }

    private analyzeError(errorMessage: string): TerminalError {
        const pattern = matchErrorPattern(errorMessage);
        
        if (pattern) {
            const details = extractErrorDetails(errorMessage, pattern);
            return {
                type: pattern.type,
                severity: pattern.severity,
                message: errorMessage,
                autoFixable: pattern.autoFixable,
                rawOutput: errorMessage,
                suggestion: pattern.description
            };
        }

        // Fallback for unknown errors
        return {
            type: 'unknown',
            severity: 'medium',
            message: errorMessage,
            autoFixable: false,
            rawOutput: errorMessage
        };
    }

    private async handleError(error: TerminalError): Promise<void> {
        this.log(`Detected ${error.type} error: ${error.message}`);

        try {
            // Generate fix using AI
            const fix = await this.generateFix(error);
            
            if (fix.confidence > 0.7) {
                // High confidence - apply automatically
                await this.applyFix(fix, error, true);
            } else if (fix.confidence > 0.4) {
                // Medium confidence - ask user
                await this.promptUserForFix(fix, error);
            } else {
                // Low confidence - just suggest
                await this.suggestFix(fix, error);
            }
        } catch (fixError) {
            this.log(`Failed to generate fix: ${fixError}`);
        }
    }

    private async generateFix(error: TerminalError): Promise<TerminalFix> {
        const systemPrompt = `You are an expert developer assistant. Analyze terminal errors and generate precise fixes.

IMPORTANT: Respond with a valid JSON object containing:
{
    "description": "Brief description of the fix",
    "commands": ["array", "of", "terminal", "commands"],
    "files": [{"path": "file/path", "content": "file content", "action": "create|modify|delete"}],
    "confidence": 0.95,
    "estimatedTime": "30 seconds"
}`;

        const prompt = `Analyze this ${error.type} error and provide a fix:

Error Details:
- Type: ${error.type}
- Severity: ${error.severity}
- Message: ${error.message}
- File: ${error.file || 'unknown'}
- Line: ${error.line || 'unknown'}
- Raw Output: ${error.rawOutput}

Context:
- Project Type: ${await this.getProjectType()}
- Framework: ${await this.getFramework()}
- Dependencies: ${await this.getCurrentDependencies()}

Generate a precise fix with high confidence. Consider:
1. Common patterns for this error type
2. Project context and dependencies
3. Best practices and security
4. Minimal changes required

Provide terminal commands and/or file modifications needed.`;

        const response = await this.aiAgent.generateResponse(prompt, systemPrompt);
        
        try {
            const fix = JSON.parse(response.content);
            return {
                description: fix.description || 'AI-generated fix',
                commands: fix.commands || [],
                files: fix.files || [],
                confidence: fix.confidence || 0.5,
                estimatedTime: fix.estimatedTime || '1 minute'
            };
        } catch (parseError) {
            // Fallback if JSON parsing fails
            return this.generateFallbackFix(error);
        }
    }

    private generateFallbackFix(error: TerminalError): TerminalFix {
        const pattern = matchErrorPattern(error.message);
        
        if (pattern) {
            const details = extractErrorDetails(error.message, pattern);
            const commands = generateFixCommands(pattern, details);
            
            return {
                description: pattern.description,
                commands: commands,
                files: [],
                confidence: pattern.autoFixable ? 0.8 : 0.4,
                estimatedTime: this.estimateFixTime(pattern.type)
            };
        }

        return {
            description: 'Generic error fix - run build to check for issues',
            commands: ['npm run build'],
            files: [],
            confidence: 0.3,
            estimatedTime: '1 minute'
        };
    }

    private estimateFixTime(errorType: string): string {
        const timeEstimates: { [key: string]: string } = {
            'dependency': '30 seconds',
            'compilation': '1 minute',
            'runtime': '15 seconds',
            'test': '45 seconds',
            'deployment': '2 minutes',
            'unknown': '1 minute'
        };
        
        return timeEstimates[errorType] || '1 minute';
    }

    private async applyFix(fix: TerminalFix, error: TerminalError, automatic: boolean = false): Promise<void> {
        const action = automatic ? 'Automatically applying' : 'Applying';
        this.log(`${action} fix: ${fix.description}`);

        try {
            // Apply file changes first
            for (const file of fix.files) {
                await this.applyFileChange(file);
            }

            // Execute terminal commands
            for (const command of fix.commands) {
                await this.executeTerminalCommand(command);
            }

            const message = automatic ? 
                `🤖 Auto-fixed: ${fix.description}` : 
                `✅ Applied fix: ${fix.description}`;
            
            vscode.window.showInformationMessage(message, 'View Details').then(selection => {
                if (selection === 'View Details') {
                    this.showFixDetails(fix, error);
                }
            });

        } catch (applyError) {
            this.log(`Failed to apply fix: ${applyError}`);
            vscode.window.showErrorMessage(`Failed to apply fix: ${applyError}`);
        }
    }

    private async promptUserForFix(fix: TerminalFix, error: TerminalError): Promise<void> {
        const message = `🤖 AI detected an error and suggests a fix:\n\n${fix.description}\n\nConfidence: ${Math.round(fix.confidence * 100)}%\nEstimated time: ${fix.estimatedTime}`;
        
        const selection = await vscode.window.showInformationMessage(
            message,
            'Apply Fix',
            'View Details',
            'Ignore'
        );

        switch (selection) {
            case 'Apply Fix':
                await this.applyFix(fix, error, false);
                break;
            case 'View Details':
                await this.showFixDetails(fix, error);
                break;
            case 'Ignore':
                this.log(`User ignored fix for: ${error.message}`);
                break;
        }
    }

    private async suggestFix(fix: TerminalFix, error: TerminalError): Promise<void> {
        const message = `💡 AI suggestion for error: ${fix.description} (${Math.round(fix.confidence * 100)}% confidence)`;
        
        vscode.window.showInformationMessage(message, 'View Details', 'Dismiss').then(selection => {
            if (selection === 'View Details') {
                this.showFixDetails(fix, error);
            }
        });
    }

    private async showFixDetails(fix: TerminalFix, error: TerminalError): Promise<void> {
        const details = `# AI Fix Details

## Error Analysis
- **Type**: ${error.type}
- **Severity**: ${error.severity}
- **Message**: ${error.message}
- **File**: ${error.file || 'N/A'}
- **Line**: ${error.line || 'N/A'}

## Proposed Fix
- **Description**: ${fix.description}
- **Confidence**: ${Math.round(fix.confidence * 100)}%
- **Estimated Time**: ${fix.estimatedTime}

## Commands to Execute
${fix.commands.map(cmd => `\`\`\`bash\n${cmd}\n\`\`\``).join('\n')}

## File Changes
${fix.files.map(file => `
### ${file.action.toUpperCase()}: ${file.path}
\`\`\`
${file.content}
\`\`\`
`).join('\n')}

## Raw Error Output
\`\`\`
${error.rawOutput}
\`\`\`

---
Generated by Web3 AI Agent Terminal Monitor
`;

        const doc = await vscode.workspace.openTextDocument({
            content: details,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }

    private async applyFileChange(file: { path: string; content: string; action: 'create' | 'modify' | 'delete' }): Promise<void> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const uri = vscode.Uri.joinPath(workspaceFolder.uri, file.path);

        switch (file.action) {
            case 'create':
            case 'modify':
                await vscode.workspace.fs.writeFile(uri, Buffer.from(file.content, 'utf8'));
                this.log(`${file.action === 'create' ? 'Created' : 'Modified'} file: ${file.path}`);
                break;
            case 'delete':
                try {
                    await vscode.workspace.fs.delete(uri);
                    this.log(`Deleted file: ${file.path}`);
                } catch (error) {
                    this.log(`Failed to delete file ${file.path}: ${error}`);
                }
                break;
        }
    }

    private async executeTerminalCommand(command: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const terminal = vscode.window.createTerminal('AI Auto-Fix');
            terminal.show();
            terminal.sendText(command);
            
            this.log(`Executed command: ${command}`);
            
            // Wait a bit for command to execute
            setTimeout(() => {
                resolve();
            }, 2000);
        });
    }

    private async getProjectType(): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return 'unknown';

        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const content = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(content.toString());
            
            if (packageJson.dependencies?.next) return 'Next.js';
            if (packageJson.dependencies?.react) return 'React';
            if (packageJson.dependencies?.express) return 'Express.js';
            if (packageJson.dependencies?.['@solana/web3.js']) return 'Solana';
            if (packageJson.dependencies?.['@mysten/sui']) return 'Sui';
            
            return 'Node.js';
        } catch {
            return 'unknown';
        }
    }

    private async getFramework(): Promise<string> {
        // Similar to getProjectType but more detailed
        return await this.getProjectType();
    }

    private async getCurrentDependencies(): Promise<string[]> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return [];

        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const content = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(content.toString());
            
            return [
                ...Object.keys(packageJson.dependencies || {}),
                ...Object.keys(packageJson.devDependencies || {})
            ];
        } catch {
            return [];
        }
    }

    private async findMissingDependencies(packageJson: any): Promise<string[]> {
        // This would analyze import statements vs package.json
        // For now, return empty array
        return [];
    }

    private log(message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }

    public dispose(): void {
        this.stopMonitoring();
        this.outputChannel.dispose();
    }
}