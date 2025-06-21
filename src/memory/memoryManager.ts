import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export interface MemoryEntry {
    id: string;
    timestamp: Date;
    category: 'project' | 'user_preference' | 'configuration' | 'task_context' | 'learning' | 'important';
    title: string;
    content: string;
    tags: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface ProjectMemory {
    projectPath: string;
    projectName: string;
    lastUpdated: Date;
    entries: MemoryEntry[];
    userPreferences: {
        preferredAI: string;
        apiKeys: { [key: string]: boolean }; // Just track if they exist, not the actual keys
        workingStyle: string;
        commonTasks: string[];
    };
    projectContext: {
        framework: string;
        language: string;
        dependencies: string[];
        structure: string[];
        recentChanges: string[];
    };
}

export class MemoryManager {
    private memoryFile: string;
    private memory: ProjectMemory;
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        
        if (workspaceFolder && workspaceFolder.uri.fsPath) {
            // Store memory in workspace .vscode folder if workspace exists
            const projectPath = workspaceFolder.uri.fsPath;
            const vscodeDir = path.join(projectPath, '.vscode');
            
            try {
                if (!fs.existsSync(vscodeDir)) {
                    fs.mkdirSync(vscodeDir, { recursive: true });
                }
                this.memoryFile = path.join(vscodeDir, 'jordi-memory.json');
            } catch (error) {
                console.warn('Could not create workspace .vscode directory, falling back to extension storage:', error);
                // Fallback to extension global storage
                this.memoryFile = path.join(context.globalStorageUri.fsPath, 'jordi-memory.json');
                this.ensureStorageDirectory();
            }
        } else {
            // No workspace folder, use extension global storage
            this.memoryFile = path.join(context.globalStorageUri.fsPath, 'jordi-memory.json');
            this.ensureStorageDirectory();
        }
        
        this.loadMemory();
    }

    private ensureStorageDirectory(): void {
        try {
            const storageDir = path.dirname(this.memoryFile);
            if (!fs.existsSync(storageDir)) {
                fs.mkdirSync(storageDir, { recursive: true });
            }
        } catch (error) {
            console.error('Could not create storage directory:', error);
            // If we can't create storage, we'll work in memory only
            this.memoryFile = '';
        }
    }

    private loadMemory(): void {
        try {
            if (this.memoryFile && fs.existsSync(this.memoryFile)) {
                const data = fs.readFileSync(this.memoryFile, 'utf8');
                this.memory = JSON.parse(data);
                // Convert date strings back to Date objects
                this.memory.lastUpdated = new Date(this.memory.lastUpdated);
                this.memory.entries = this.memory.entries.map(entry => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
            } else {
                this.initializeMemory();
            }
        } catch (error) {
            console.error('Error loading memory:', error);
            this.initializeMemory();
        }
    }

    private initializeMemory(): void {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const projectPath = workspaceFolder?.uri.fsPath || '';
        const projectName = workspaceFolder?.name || 'Unknown Project';

        this.memory = {
            projectPath,
            projectName,
            lastUpdated: new Date(),
            entries: [
                {
                    id: this.generateId(),
                    timestamp: new Date(),
                    category: 'project',
                    title: 'Project Initialized',
                    content: `Started working on ${projectName}. This is Jordi's memory notepad for this project.`,
                    tags: ['initialization'],
                    priority: 'medium'
                }
            ],
            userPreferences: {
                preferredAI: 'not_set',
                apiKeys: {},
                workingStyle: 'collaborative',
                commonTasks: []
            },
            projectContext: {
                framework: 'unknown',
                language: 'unknown',
                dependencies: [],
                structure: [],
                recentChanges: []
            }
        };
        this.saveMemory();
    }

    private saveMemory(): void {
        try {
            this.memory.lastUpdated = new Date();
            if (this.memoryFile) {
                fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
            } else {
                console.warn('Memory file not available, running in memory-only mode');
            }
        } catch (error) {
            console.error('Error saving memory:', error);
        }
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Core memory operations
    public remember(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): void {
        const newEntry: MemoryEntry = {
            ...entry,
            id: this.generateId(),
            timestamp: new Date()
        };

        this.memory.entries.push(newEntry);
        
        // Keep only the most recent 100 entries to prevent bloat
        if (this.memory.entries.length > 100) {
            this.memory.entries = this.memory.entries
                .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                .slice(0, 100);
        }

        this.saveMemory();
    }

    public getMemoryContext(): string {
        const recentEntries = this.memory.entries
            .filter(entry => entry.priority !== 'low')
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);

        const context = {
            projectName: this.memory.projectName,
            userPreferences: this.memory.userPreferences,
            projectContext: this.memory.projectContext,
            recentMemories: recentEntries.map(entry => ({
                category: entry.category,
                title: entry.title,
                content: entry.content,
                tags: entry.tags,
                priority: entry.priority
            }))
        };

        return JSON.stringify(context, null, 2);
    }

    public searchMemory(query: string): MemoryEntry[] {
        const lowercaseQuery = query.toLowerCase();
        return this.memory.entries.filter(entry =>
            entry.title.toLowerCase().includes(lowercaseQuery) ||
            entry.content.toLowerCase().includes(lowercaseQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        ).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    public getMemoriesByCategory(category: MemoryEntry['category']): MemoryEntry[] {
        return this.memory.entries
            .filter(entry => entry.category === category)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }

    public updateUserPreference(key: keyof ProjectMemory['userPreferences'], value: any): void {
        (this.memory.userPreferences as any)[key] = value;
        this.remember({
            category: 'user_preference',
            title: `Updated ${key}`,
            content: `User preference ${key} updated to: ${JSON.stringify(value)}`,
            tags: ['preference', key],
            priority: 'medium'
        });
    }

    public updateProjectContext(key: keyof ProjectMemory['projectContext'], value: any): void {
        (this.memory.projectContext as any)[key] = value;
        this.remember({
            category: 'project',
            title: `Updated project ${key}`,
            content: `Project ${key} updated to: ${JSON.stringify(value)}`,
            tags: ['project_context', key],
            priority: 'medium'
        });
    }

    public getFormattedMemory(): string {
        const sections = [
            '# 🧠 Jordi\'s Memory Notepad',
            '',
            `**Project:** ${this.memory.projectName}`,
            `**Last Updated:** ${this.memory.lastUpdated.toLocaleString()}`,
            '',
            '## 👤 User Preferences',
            `- **Preferred AI:** ${this.memory.userPreferences.preferredAI}`,
            `- **Working Style:** ${this.memory.userPreferences.workingStyle}`,
            `- **API Keys Configured:** ${Object.keys(this.memory.userPreferences.apiKeys).join(', ') || 'None'}`,
            `- **Common Tasks:** ${this.memory.userPreferences.commonTasks.join(', ') || 'None yet'}`,
            '',
            '## 📁 Project Context',
            `- **Framework:** ${this.memory.projectContext.framework}`,
            `- **Language:** ${this.memory.projectContext.language}`,
            `- **Dependencies:** ${this.memory.projectContext.dependencies.slice(0, 5).join(', ')}${this.memory.projectContext.dependencies.length > 5 ? '...' : ''}`,
            '',
            '## 📝 Recent Memories',
        ];

        const recentEntries = this.memory.entries
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 15);

        recentEntries.forEach(entry => {
            const priorityIcon = {
                'critical': '🔴',
                'high': '🟡',
                'medium': '🔵',
                'low': '⚪'
            }[entry.priority];

            sections.push(
                '',
                `### ${priorityIcon} ${entry.title}`,
                `**Category:** ${entry.category} | **Date:** ${entry.timestamp.toLocaleDateString()}`,
                `**Tags:** ${entry.tags.join(', ')}`,
                '',
                entry.content
            );
        });

        return sections.join('\n');
    }

    public clearMemory(): void {
        this.initializeMemory();
    }

    public exportMemory(): string {
        return JSON.stringify(this.memory, null, 2);
    }

    public importMemory(data: string): boolean {
        try {
            const imported = JSON.parse(data);
            this.memory = imported;
            this.saveMemory();
            return true;
        } catch (error) {
            console.error('Error importing memory:', error);
            return false;
        }
    }

    // Quick memory helpers for common scenarios
    public rememberApiKey(provider: string): void {
        this.memory.userPreferences.apiKeys[provider] = true;
        this.remember({
            category: 'configuration',
            title: `${provider} API Key Configured`,
            content: `User has configured API key for ${provider}. Remember to use this provider when requested.`,
            tags: ['api_key', provider, 'configuration'],
            priority: 'high'
        });
    }

    public rememberTask(taskType: string, details: string): void {
        if (!this.memory.userPreferences.commonTasks.includes(taskType)) {
            this.memory.userPreferences.commonTasks.push(taskType);
        }
        
        this.remember({
            category: 'task_context',
            title: `Completed: ${taskType}`,
            content: details,
            tags: ['task', taskType],
            priority: 'medium'
        });
    }

    public rememberLearning(insight: string, context: string): void {
        this.remember({
            category: 'learning',
            title: 'New Insight',
            content: `${insight}\n\nContext: ${context}`,
            tags: ['learning', 'insight'],
            priority: 'high'
        });
    }

    public rememberImportantNote(title: string, content: string, tags: string[] = []): void {
        this.remember({
            category: 'important',
            title,
            content,
            tags: ['important', ...tags],
            priority: 'critical'
        });
    }
}