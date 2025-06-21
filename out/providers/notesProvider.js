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
exports.NoteItem = exports.NotesProvider = void 0;
const vscode = __importStar(require("vscode"));
class NotesProvider {
    constructor(context) {
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        this.notes = [];
        this.context = context;
        this.loadNotes();
        this.registerCommands();
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - show categories
            const categories = this.getCategories();
            return categories.map(category => new NoteItem(category.name, vscode.TreeItemCollapsibleState.Expanded, category.icon, 'category', category.category));
        }
        if (element.contextValue === 'category') {
            // Show notes in this category
            const categoryNotes = this.notes.filter(note => note.category === element.category);
            return categoryNotes.map(note => {
                const item = new NoteItem(note.title, vscode.TreeItemCollapsibleState.None, 'note', 'note');
                item.note = note;
                item.tooltip = `${note.content.substring(0, 100)}${note.content.length > 100 ? '...' : ''}\n\nCreated: ${note.timestamp.toLocaleString()}`;
                item.command = {
                    command: 'web3-ai-agent.openNote',
                    title: 'Open Note',
                    arguments: [note]
                };
                return item;
            });
        }
        return [];
    }
    getCategories() {
        return [
            { name: 'General', icon: 'note', category: 'general' },
            { name: 'TODOs', icon: 'checklist', category: 'todo' },
            { name: 'Bugs', icon: 'bug', category: 'bug' },
            { name: 'Ideas', icon: 'lightbulb', category: 'idea' },
            { name: 'Research', icon: 'book', category: 'research' }
        ];
    }
    registerCommands() {
        const commands = [
            vscode.commands.registerCommand('web3-ai-agent.addNote', async () => {
                await this.addNote();
            }),
            vscode.commands.registerCommand('web3-ai-agent.openNote', async (note) => {
                await this.openNote(note);
            }),
            vscode.commands.registerCommand('web3-ai-agent.deleteNote', async (item) => {
                if (item.note) {
                    await this.deleteNote(item.note.id);
                }
            }),
            vscode.commands.registerCommand('web3-ai-agent.editNote', async (item) => {
                if (item.note) {
                    await this.editNote(item.note);
                }
            })
        ];
        commands.forEach(command => this.context.subscriptions.push(command));
    }
    async addNote() {
        const title = await vscode.window.showInputBox({
            prompt: 'Enter note title',
            placeHolder: 'My Note'
        });
        if (!title)
            return;
        const category = await vscode.window.showQuickPick([
            { label: 'General', value: 'general' },
            { label: 'TODO', value: 'todo' },
            { label: 'Bug', value: 'bug' },
            { label: 'Idea', value: 'idea' },
            { label: 'Research', value: 'research' }
        ], {
            placeHolder: 'Select category'
        });
        if (!category)
            return;
        const content = await vscode.window.showInputBox({
            prompt: 'Enter note content',
            placeHolder: 'Note content...'
        });
        if (!content)
            return;
        const note = {
            id: this.generateId(),
            title,
            content,
            category: category.value,
            timestamp: new Date(),
            tags: []
        };
        this.notes.push(note);
        await this.saveNotes();
        this.refresh();
        vscode.window.showInformationMessage(`Note "${title}" added successfully!`);
    }
    async openNote(note) {
        const content = `# ${note.title}

**Category:** ${note.category}
**Created:** ${note.timestamp.toLocaleString()}
**Tags:** ${note.tags.join(', ') || 'None'}

---

${note.content}`;
        const doc = await vscode.workspace.openTextDocument({
            content,
            language: 'markdown'
        });
        await vscode.window.showTextDocument(doc);
    }
    async editNote(note) {
        const newTitle = await vscode.window.showInputBox({
            prompt: 'Edit note title',
            value: note.title
        });
        if (!newTitle)
            return;
        const newContent = await vscode.window.showInputBox({
            prompt: 'Edit note content',
            value: note.content
        });
        if (!newContent)
            return;
        note.title = newTitle;
        note.content = newContent;
        await this.saveNotes();
        this.refresh();
        vscode.window.showInformationMessage(`Note "${newTitle}" updated successfully!`);
    }
    async deleteNote(noteId) {
        const note = this.notes.find(n => n.id === noteId);
        if (!note)
            return;
        const confirm = await vscode.window.showWarningMessage(`Are you sure you want to delete "${note.title}"?`, 'Delete', 'Cancel');
        if (confirm === 'Delete') {
            this.notes = this.notes.filter(n => n.id !== noteId);
            await this.saveNotes();
            this.refresh();
            vscode.window.showInformationMessage(`Note "${note.title}" deleted successfully!`);
        }
    }
    async addAIGeneratedNote(title, content, category = 'general') {
        const note = {
            id: this.generateId(),
            title: `[AI] ${title}`,
            content,
            category,
            timestamp: new Date(),
            tags: ['ai-generated']
        };
        this.notes.push(note);
        await this.saveNotes();
        this.refresh();
    }
    async loadNotes() {
        try {
            const savedNotes = this.context.globalState.get('web3-ai-agent.notes', []);
            this.notes = savedNotes.map(note => ({
                ...note,
                timestamp: new Date(note.timestamp)
            }));
        }
        catch (error) {
            console.error('Failed to load notes:', error);
            this.notes = [];
        }
    }
    async saveNotes() {
        try {
            await this.context.globalState.update('web3-ai-agent.notes', this.notes);
        }
        catch (error) {
            console.error('Failed to save notes:', error);
        }
    }
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    getNotes() {
        return this.notes;
    }
    getNotesInCategory(category) {
        return this.notes.filter(note => note.category === category);
    }
}
exports.NotesProvider = NotesProvider;
class NoteItem extends vscode.TreeItem {
    constructor(label, collapsibleState, iconName, contextValue, category) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.iconName = iconName;
        this.contextValue = contextValue;
        this.iconPath = new vscode.ThemeIcon(iconName);
        this.category = category;
    }
}
exports.NoteItem = NoteItem;
//# sourceMappingURL=notesProvider.js.map