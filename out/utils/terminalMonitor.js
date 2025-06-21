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
exports.TerminalMonitor = void 0;
const vscode = __importStar(require("vscode"));
const errorPatterns_1 = require("./errorPatterns");
class TerminalMonitor {
    constructor(aiAgent) {
        this.activeTerminals = new Map();
        this.outputBuffer = new Map();
        this.isMonitoring = false;
        this.autoFixEnabled = true;
        this.aiAgent = aiAgent;
        this.outputChannel = vscode.window.createOutputChannel('Web3 AI Agent - Terminal Monitor');
        this.setupTerminalMonitoring();
    }
    setupTerminalMonitoring() {
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
    registerTerminal(terminal) {
        this.activeTerminals.set(terminal, '');
        this.outputBuffer.set(terminal, []);
        this.log(`Registered terminal: ${terminal.name}`);
    }
    unregisterTerminal(terminal) {
        this.activeTerminals.delete(terminal);
        this.outputBuffer.delete(terminal);
        this.log(`Unregistered terminal: ${terminal.name}`);
    }
    startMonitoring() {
        this.isMonitoring = true;
        this.log('Terminal monitoring started');
        // Start monitoring terminal output
        this.monitorTerminalOutput();
        vscode.window.showInformationMessage('🤖 Terminal monitoring enabled! AI will automatically detect and fix errors.', 'Settings').then(selection => {
            if (selection === 'Settings') {
                vscode.commands.executeCommand('workbench.action.openSettings', 'web3-ai-agent.terminalMonitoring');
            }
        });
    }
    stopMonitoring() {
        this.isMonitoring = false;
        this.log('Terminal monitoring stopped');
        vscode.window.showInformationMessage('Terminal monitoring disabled');
    }
    toggleAutoFix() {
        this.autoFixEnabled = !this.autoFixEnabled;
        const status = this.autoFixEnabled ? 'enabled' : 'disabled';
        this.log(`Auto-fix ${status}`);
        vscode.window.showInformationMessage(`Auto-fix ${status}`);
    }
    async monitorTerminalOutput() {
        // This is a simplified implementation
        // In a real implementation, we'd need to hook into terminal output streams
        // For now, we'll simulate monitoring by checking for common error patterns
        setInterval(async () => {
            if (!this.isMonitoring)
                return;
            // Check for compilation errors in workspace
            await this.checkForCompilationErrors();
            // Check for package.json issues
            await this.checkForDependencyIssues();
            // Check for test failures
            await this.checkForTestFailures();
        }, 5000); // Check every 5 seconds
    }
    async checkForCompilationErrors() {
        const diagnostics = vscode.languages.getDiagnostics();
        for (const [uri, diags] of diagnostics) {
            const errors = diags.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            if (errors.length > 0) {
                for (const error of errors) {
                    const terminalError = {
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
    async checkForDependencyIssues() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return;
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(packageJsonContent.toString());
            // Check for missing dependencies
            const missingDeps = await this.findMissingDependencies(packageJson);
            if (missingDeps.length > 0) {
                const terminalError = {
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
        }
        catch (error) {
            // package.json doesn't exist or is invalid
        }
    }
    async checkForTestFailures() {
        // This would check for test output patterns
        // For now, we'll simulate common test failure scenarios
    }
    isAutoFixable(errorMessage) {
        const pattern = (0, errorPatterns_1.matchErrorPattern)(errorMessage);
        return pattern ? pattern.autoFixable : false;
    }
    analyzeError(errorMessage) {
        const pattern = (0, errorPatterns_1.matchErrorPattern)(errorMessage);
        if (pattern) {
            const details = (0, errorPatterns_1.extractErrorDetails)(errorMessage, pattern);
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
    async handleError(error) {
        this.log(`Detected ${error.type} error: ${error.message}`);
        try {
            // Generate fix using AI
            const fix = await this.generateFix(error);
            if (fix.confidence > 0.7) {
                // High confidence - apply automatically
                await this.applyFix(fix, error, true);
            }
            else if (fix.confidence > 0.4) {
                // Medium confidence - ask user
                await this.promptUserForFix(fix, error);
            }
            else {
                // Low confidence - just suggest
                await this.suggestFix(fix, error);
            }
        }
        catch (fixError) {
            this.log(`Failed to generate fix: ${fixError}`);
        }
    }
    async generateFix(error) {
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
        }
        catch (parseError) {
            // Fallback if JSON parsing fails
            return this.generateFallbackFix(error);
        }
    }
    generateFallbackFix(error) {
        const pattern = (0, errorPatterns_1.matchErrorPattern)(error.message);
        if (pattern) {
            const details = (0, errorPatterns_1.extractErrorDetails)(error.message, pattern);
            const commands = (0, errorPatterns_1.generateFixCommands)(pattern, details);
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
    estimateFixTime(errorType) {
        const timeEstimates = {
            'dependency': '30 seconds',
            'compilation': '1 minute',
            'runtime': '15 seconds',
            'test': '45 seconds',
            'deployment': '2 minutes',
            'unknown': '1 minute'
        };
        return timeEstimates[errorType] || '1 minute';
    }
    async applyFix(fix, error, automatic = false) {
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
        }
        catch (applyError) {
            this.log(`Failed to apply fix: ${applyError}`);
            vscode.window.showErrorMessage(`Failed to apply fix: ${applyError}`);
        }
    }
    async promptUserForFix(fix, error) {
        const message = `🤖 AI detected an error and suggests a fix:\n\n${fix.description}\n\nConfidence: ${Math.round(fix.confidence * 100)}%\nEstimated time: ${fix.estimatedTime}`;
        const selection = await vscode.window.showInformationMessage(message, 'Apply Fix', 'View Details', 'Ignore');
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
    async suggestFix(fix, error) {
        const message = `💡 AI suggestion for error: ${fix.description} (${Math.round(fix.confidence * 100)}% confidence)`;
        vscode.window.showInformationMessage(message, 'View Details', 'Dismiss').then(selection => {
            if (selection === 'View Details') {
                this.showFixDetails(fix, error);
            }
        });
    }
    async showFixDetails(fix, error) {
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
    async applyFileChange(file) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return;
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
                }
                catch (error) {
                    this.log(`Failed to delete file ${file.path}: ${error}`);
                }
                break;
        }
    }
    async executeTerminalCommand(command) {
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
    async getProjectType() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return 'unknown';
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const content = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(content.toString());
            if (packageJson.dependencies?.next)
                return 'Next.js';
            if (packageJson.dependencies?.react)
                return 'React';
            if (packageJson.dependencies?.express)
                return 'Express.js';
            if (packageJson.dependencies?.['@solana/web3.js'])
                return 'Solana';
            if (packageJson.dependencies?.['@mysten/sui'])
                return 'Sui';
            return 'Node.js';
        }
        catch {
            return 'unknown';
        }
    }
    async getFramework() {
        // Similar to getProjectType but more detailed
        return await this.getProjectType();
    }
    async getCurrentDependencies() {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder)
            return [];
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceFolder.uri, 'package.json');
            const content = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(content.toString());
            return [
                ...Object.keys(packageJson.dependencies || {}),
                ...Object.keys(packageJson.devDependencies || {})
            ];
        }
        catch {
            return [];
        }
    }
    async findMissingDependencies(packageJson) {
        // This would analyze import statements vs package.json
        // For now, return empty array
        return [];
    }
    log(message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] ${message}`);
    }
    dispose() {
        this.stopMonitoring();
        this.outputChannel.dispose();
    }
}
exports.TerminalMonitor = TerminalMonitor;
//# sourceMappingURL=terminalMonitor.js.map