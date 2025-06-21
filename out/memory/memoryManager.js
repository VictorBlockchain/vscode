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
exports.MemoryManager = void 0;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class MemoryManager {
    constructor(context) {
        this.context = context;
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        const projectPath = workspaceFolder?.uri.fsPath || '';
        // Store memory in workspace .vscode folder
        const vscodeDir = path.join(projectPath, '.vscode');
        if (!fs.existsSync(vscodeDir)) {
            fs.mkdirSync(vscodeDir, { recursive: true });
        }
        this.memoryFile = path.join(vscodeDir, 'jordi-memory.json');
        this.loadMemory();
    }
    loadMemory() {
        try {
            if (fs.existsSync(this.memoryFile)) {
                const data = fs.readFileSync(this.memoryFile, 'utf8');
                this.memory = JSON.parse(data);
                // Convert date strings back to Date objects
                this.memory.lastUpdated = new Date(this.memory.lastUpdated);
                this.memory.entries = this.memory.entries.map(entry => ({
                    ...entry,
                    timestamp: new Date(entry.timestamp)
                }));
            }
            else {
                this.initializeMemory();
            }
        }
        catch (error) {
            console.error('Error loading memory:', error);
            this.initializeMemory();
        }
    }
    initializeMemory() {
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
    saveMemory() {
        try {
            this.memory.lastUpdated = new Date();
            fs.writeFileSync(this.memoryFile, JSON.stringify(this.memory, null, 2));
        }
        catch (error) {
            console.error('Error saving memory:', error);
        }
    }
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    // Core memory operations
    remember(entry) {
        const newEntry = {
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
    getMemoryContext() {
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
    searchMemory(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.memory.entries.filter(entry => entry.title.toLowerCase().includes(lowercaseQuery) ||
            entry.content.toLowerCase().includes(lowercaseQuery) ||
            entry.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))).sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    getMemoriesByCategory(category) {
        return this.memory.entries
            .filter(entry => entry.category === category)
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    }
    updateUserPreference(key, value) {
        this.memory.userPreferences[key] = value;
        this.remember({
            category: 'user_preference',
            title: `Updated ${key}`,
            content: `User preference ${key} updated to: ${JSON.stringify(value)}`,
            tags: ['preference', key],
            priority: 'medium'
        });
    }
    updateProjectContext(key, value) {
        this.memory.projectContext[key] = value;
        this.remember({
            category: 'project',
            title: `Updated project ${key}`,
            content: `Project ${key} updated to: ${JSON.stringify(value)}`,
            tags: ['project_context', key],
            priority: 'medium'
        });
    }
    getFormattedMemory() {
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
            sections.push('', `### ${priorityIcon} ${entry.title}`, `**Category:** ${entry.category} | **Date:** ${entry.timestamp.toLocaleDateString()}`, `**Tags:** ${entry.tags.join(', ')}`, '', entry.content);
        });
        return sections.join('\n');
    }
    clearMemory() {
        this.initializeMemory();
    }
    exportMemory() {
        return JSON.stringify(this.memory, null, 2);
    }
    importMemory(data) {
        try {
            const imported = JSON.parse(data);
            this.memory = imported;
            this.saveMemory();
            return true;
        }
        catch (error) {
            console.error('Error importing memory:', error);
            return false;
        }
    }
    // Quick memory helpers for common scenarios
    rememberApiKey(provider) {
        this.memory.userPreferences.apiKeys[provider] = true;
        this.remember({
            category: 'configuration',
            title: `${provider} API Key Configured`,
            content: `User has configured API key for ${provider}. Remember to use this provider when requested.`,
            tags: ['api_key', provider, 'configuration'],
            priority: 'high'
        });
    }
    rememberTask(taskType, details) {
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
    rememberLearning(insight, context) {
        this.remember({
            category: 'learning',
            title: 'New Insight',
            content: `${insight}\n\nContext: ${context}`,
            tags: ['learning', 'insight'],
            priority: 'high'
        });
    }
    rememberImportantNote(title, content, tags = []) {
        this.remember({
            category: 'important',
            title,
            content,
            tags: ['important', ...tags],
            priority: 'critical'
        });
    }
}
exports.MemoryManager = MemoryManager;
//# sourceMappingURL=memoryManager.js.map