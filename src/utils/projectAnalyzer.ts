import * as vscode from 'vscode';
import * as path from 'path';
import { AIAgentProvider, ProjectContext } from '../ai/aiAgentProvider';

export interface ProjectAnalysis {
    framework: string;
    blockchain: string[];
    dependencies: string[];
    components: ComponentInfo[];
    contracts: ContractInfo[];
    structure: ProjectStructure;
    recommendations: string[];
    issues: string[];
}

export interface ComponentInfo {
    name: string;
    path: string;
    type: 'page' | 'component' | 'layout' | 'hook' | 'utility';
    dependencies: string[];
    exports: string[];
    web3Integration: boolean;
}

export interface ContractInfo {
    name: string;
    path: string;
    blockchain: 'solana' | 'sui' | 'ethereum';
    language: 'rust' | 'move' | 'solidity';
    functions: string[];
    security: 'high' | 'medium' | 'low';
}

export interface ProjectStructure {
    hasNextConfig: boolean;
    hasPackageJson: boolean;
    hasTailwind: boolean;
    hasTypeScript: boolean;
    directories: string[];
    files: FileInfo[];
}

export interface FileInfo {
    path: string;
    type: string;
    size: number;
    lastModified: Date;
}

export class ProjectAnalyzer {
    private aiAgent: AIAgentProvider;

    constructor(aiAgent: AIAgentProvider) {
        this.aiAgent = aiAgent;
    }

    async analyzeWorkspace(): Promise<ProjectAnalysis> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }

        const analysis: ProjectAnalysis = {
            framework: 'unknown',
            blockchain: [],
            dependencies: [],
            components: [],
            contracts: [],
            structure: {
                hasNextConfig: false,
                hasPackageJson: false,
                hasTailwind: false,
                hasTypeScript: false,
                directories: [],
                files: []
            },
            recommendations: [],
            issues: []
        };

        try {
            // Analyze project structure
            await this.analyzeProjectStructure(workspaceFolder.uri, analysis);
            
            // Analyze dependencies
            await this.analyzeDependencies(workspaceFolder.uri, analysis);
            
            // Analyze components
            await this.analyzeComponents(workspaceFolder.uri, analysis);
            
            // Analyze contracts
            await this.analyzeContracts(workspaceFolder.uri, analysis);
            
            // Generate AI recommendations
            await this.generateRecommendations(analysis);

            // Set project context for AI agent
            const context: ProjectContext = {
                framework: analysis.framework,
                blockchain: analysis.blockchain,
                dependencies: analysis.dependencies,
                structure: analysis.structure,
                files: analysis.structure.files.map(f => f.path)
            };
            this.aiAgent.setProjectContext(context);

            return analysis;
        } catch (error) {
            throw new Error(`Project analysis failed: ${error}`);
        }
    }

    private async analyzeProjectStructure(workspaceUri: vscode.Uri, analysis: ProjectAnalysis): Promise<void> {
        const files = await this.getAllFiles(workspaceUri);
        
        for (const file of files) {
            const relativePath = path.relative(workspaceUri.fsPath, file.fsPath);
            const fileName = path.basename(file.fsPath);
            
            // Check for key configuration files
            if (fileName === 'next.config.js' || fileName === 'next.config.ts') {
                analysis.structure.hasNextConfig = true;
                analysis.framework = 'nextjs';
            }
            
            if (fileName === 'package.json') {
                analysis.structure.hasPackageJson = true;
            }
            
            if (fileName === 'tailwind.config.js' || fileName === 'tailwind.config.ts') {
                analysis.structure.hasTailwind = true;
            }
            
            if (fileName === 'tsconfig.json') {
                analysis.structure.hasTypeScript = true;
            }

            // Add to files list
            try {
                const stat = await vscode.workspace.fs.stat(file);
                analysis.structure.files.push({
                    path: relativePath,
                    type: path.extname(fileName),
                    size: stat.size,
                    lastModified: new Date(stat.mtime)
                });
            } catch (error) {
                // Skip files that can't be read
            }
        }

        // Get directories
        analysis.structure.directories = await this.getDirectories(workspaceUri);
    }

    private async analyzeDependencies(workspaceUri: vscode.Uri, analysis: ProjectAnalysis): Promise<void> {
        try {
            const packageJsonUri = vscode.Uri.joinPath(workspaceUri, 'package.json');
            const packageJsonContent = await vscode.workspace.fs.readFile(packageJsonUri);
            const packageJson = JSON.parse(packageJsonContent.toString());

            const allDeps = {
                ...packageJson.dependencies,
                ...packageJson.devDependencies
            };

            analysis.dependencies = Object.keys(allDeps);

            // Detect blockchain dependencies
            if (allDeps['@solana/web3.js'] || allDeps['@solana/wallet-adapter-react']) {
                analysis.blockchain.push('solana');
            }
            
            if (allDeps['@mysten/sui.js'] || allDeps['@mysten/wallet-kit']) {
                analysis.blockchain.push('sui');
            }
            
            if (allDeps['ethers'] || allDeps['web3'] || allDeps['@web3-react/core']) {
                analysis.blockchain.push('ethereum');
            }

            // Detect framework
            if (allDeps['next']) {
                analysis.framework = 'nextjs';
            } else if (allDeps['react']) {
                analysis.framework = 'react';
            }

        } catch (error) {
            // package.json not found or invalid
        }
    }

    private async analyzeComponents(workspaceUri: vscode.Uri, analysis: ProjectAnalysis): Promise<void> {
        const componentDirs = ['components', 'src/components', 'app/components', 'pages', 'src/pages', 'app'];
        
        for (const dir of componentDirs) {
            try {
                const dirUri = vscode.Uri.joinPath(workspaceUri, dir);
                await vscode.workspace.fs.stat(dirUri);
                
                const files = await this.getAllFiles(dirUri);
                for (const file of files) {
                    const fileName = path.basename(file.fsPath);
                    const ext = path.extname(fileName);
                    
                    if (['.tsx', '.jsx', '.ts', '.js'].includes(ext)) {
                        const component = await this.analyzeComponentFile(file, workspaceUri);
                        if (component) {
                            analysis.components.push(component);
                        }
                    }
                }
            } catch (error) {
                // Directory doesn't exist
            }
        }
    }

    private async analyzeContracts(workspaceUri: vscode.Uri, analysis: ProjectAnalysis): Promise<void> {
        const contractDirs = ['contracts', 'programs', 'sources'];
        
        for (const dir of contractDirs) {
            try {
                const dirUri = vscode.Uri.joinPath(workspaceUri, dir);
                await vscode.workspace.fs.stat(dirUri);
                
                const files = await this.getAllFiles(dirUri);
                for (const file of files) {
                    const fileName = path.basename(file.fsPath);
                    const ext = path.extname(fileName);
                    
                    if (['.rs', '.move', '.sol'].includes(ext)) {
                        const contract = await this.analyzeContractFile(file, workspaceUri);
                        if (contract) {
                            analysis.contracts.push(contract);
                        }
                    }
                }
            } catch (error) {
                // Directory doesn't exist
            }
        }
    }

    private async analyzeComponentFile(fileUri: vscode.Uri, workspaceUri: vscode.Uri): Promise<ComponentInfo | null> {
        try {
            const content = await vscode.workspace.fs.readFile(fileUri);
            const code = content.toString();
            const relativePath = path.relative(workspaceUri.fsPath, fileUri.fsPath);
            const fileName = path.basename(fileUri.fsPath, path.extname(fileUri.fsPath));

            // Determine component type
            let type: ComponentInfo['type'] = 'component';
            if (relativePath.includes('pages/') || relativePath.includes('app/')) {
                type = 'page';
            } else if (fileName.toLowerCase().includes('layout')) {
                type = 'layout';
            } else if (fileName.startsWith('use') || code.includes('export function use')) {
                type = 'hook';
            } else if (!code.includes('export default') && !code.includes('export const')) {
                type = 'utility';
            }

            // Check for Web3 integration
            const web3Keywords = ['wallet', 'blockchain', 'contract', 'web3', 'solana', 'sui', 'ethereum'];
            const web3Integration = web3Keywords.some(keyword => 
                code.toLowerCase().includes(keyword) || fileName.toLowerCase().includes(keyword)
            );

            // Extract dependencies (imports)
            const importMatches = code.match(/import.*from\s+['"]([^'"]+)['"]/g) || [];
            const dependencies = importMatches.map(match => {
                const moduleMatch = match.match(/from\s+['"]([^'"]+)['"]/);
                return moduleMatch ? moduleMatch[1] : '';
            }).filter(Boolean);

            // Extract exports
            const exportMatches = code.match(/export\s+(default\s+)?(function|const|class)\s+(\w+)/g) || [];
            const exports = exportMatches.map(match => {
                const nameMatch = match.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/);
                return nameMatch ? nameMatch[1] : '';
            }).filter(Boolean);

            return {
                name: fileName,
                path: relativePath,
                type,
                dependencies,
                exports,
                web3Integration
            };
        } catch (error) {
            return null;
        }
    }

    private async analyzeContractFile(fileUri: vscode.Uri, workspaceUri: vscode.Uri): Promise<ContractInfo | null> {
        try {
            const content = await vscode.workspace.fs.readFile(fileUri);
            const code = content.toString();
            const relativePath = path.relative(workspaceUri.fsPath, fileUri.fsPath);
            const fileName = path.basename(fileUri.fsPath, path.extname(fileUri.fsPath));
            const ext = path.extname(fileUri.fsPath);

            // Determine blockchain and language
            let blockchain: ContractInfo['blockchain'] = 'ethereum';
            let language: ContractInfo['language'] = 'solidity';

            if (ext === '.rs') {
                blockchain = 'solana';
                language = 'rust';
            } else if (ext === '.move') {
                blockchain = 'sui';
                language = 'move';
            }

            // Extract function names
            let functions: string[] = [];
            if (language === 'rust') {
                const fnMatches = code.match(/pub\s+fn\s+(\w+)/g) || [];
                functions = fnMatches.map(match => {
                    const nameMatch = match.match(/pub\s+fn\s+(\w+)/);
                    return nameMatch ? nameMatch[1] : '';
                }).filter(Boolean);
            } else if (language === 'move') {
                const fnMatches = code.match(/public\s+fun\s+(\w+)/g) || [];
                functions = fnMatches.map(match => {
                    const nameMatch = match.match(/public\s+fun\s+(\w+)/);
                    return nameMatch ? nameMatch[1] : '';
                }).filter(Boolean);
            } else {
                const fnMatches = code.match(/function\s+(\w+)/g) || [];
                functions = fnMatches.map(match => {
                    const nameMatch = match.match(/function\s+(\w+)/);
                    return nameMatch ? nameMatch[1] : '';
                }).filter(Boolean);
            }

            // Basic security assessment
            const securityIssues = this.checkBasicSecurity(code, language);
            const security: ContractInfo['security'] = securityIssues.length > 3 ? 'low' : 
                                                     securityIssues.length > 1 ? 'medium' : 'high';

            return {
                name: fileName,
                path: relativePath,
                blockchain,
                language,
                functions,
                security
            };
        } catch (error) {
            return null;
        }
    }

    private checkBasicSecurity(code: string, language: string): string[] {
        const issues: string[] = [];

        // Common security patterns to check
        if (language === 'rust') {
            if (code.includes('unwrap()')) {
                issues.push('Use of unwrap() can cause panics');
            }
            if (!code.includes('require!') && code.includes('assert!')) {
                issues.push('Consider using require! instead of assert! for user input validation');
            }
        } else if (language === 'solidity') {
            if (code.includes('tx.origin')) {
                issues.push('Use of tx.origin is dangerous');
            }
            if (!code.includes('nonReentrant') && code.includes('call{')) {
                issues.push('Potential reentrancy vulnerability');
            }
        }

        return issues;
    }

    private async generateRecommendations(analysis: ProjectAnalysis): Promise<void> {
        const systemPrompt = `You are an expert Web3 and Next.js consultant. 
        Analyze the project structure and provide actionable recommendations for improvement.`;

        const prompt = `Based on this project analysis, provide specific recommendations:

Framework: ${analysis.framework}
Blockchain: ${analysis.blockchain.join(', ')}
Components: ${analysis.components.length}
Contracts: ${analysis.contracts.length}
Dependencies: ${analysis.dependencies.slice(0, 10).join(', ')}...

Structure:
- Next.js config: ${analysis.structure.hasNextConfig}
- TypeScript: ${analysis.structure.hasTypeScript}
- Tailwind: ${analysis.structure.hasTailwind}

Provide 5-7 specific, actionable recommendations for:
1. Code organization and architecture
2. Security improvements
3. Performance optimizations
4. Web3 best practices
5. Development workflow improvements

Format as a bullet list.`;

        try {
            const response = await this.aiAgent.generateResponse(prompt, systemPrompt);
            const recommendations = response.content
                .split('\n')
                .filter(line => line.trim().startsWith('-') || line.trim().startsWith('•'))
                .map(line => line.replace(/^[-•]\s*/, '').trim())
                .filter(Boolean);
            
            analysis.recommendations = recommendations;
        } catch (error) {
            analysis.recommendations = [
                'Enable TypeScript for better type safety',
                'Add comprehensive testing suite',
                'Implement proper error handling',
                'Add security auditing tools',
                'Optimize bundle size and performance'
            ];
        }
    }

    private async getAllFiles(dirUri: vscode.Uri): Promise<vscode.Uri[]> {
        const files: vscode.Uri[] = [];
        
        try {
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            
            for (const [name, type] of entries) {
                if (name.startsWith('.') || name === 'node_modules') {
                    continue;
                }
                
                const entryUri = vscode.Uri.joinPath(dirUri, name);
                
                if (type === vscode.FileType.File) {
                    files.push(entryUri);
                } else if (type === vscode.FileType.Directory) {
                    const subFiles = await this.getAllFiles(entryUri);
                    files.push(...subFiles);
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        
        return files;
    }

    private async getDirectories(dirUri: vscode.Uri): Promise<string[]> {
        const directories: string[] = [];
        
        try {
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            
            for (const [name, type] of entries) {
                if (name.startsWith('.') || name === 'node_modules') {
                    continue;
                }
                
                if (type === vscode.FileType.Directory) {
                    directories.push(name);
                }
            }
        } catch (error) {
            // Directory doesn't exist or can't be read
        }
        
        return directories;
    }
}