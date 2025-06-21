import * as vscode from 'vscode';

export interface Note {
    id: string;
    title: string;
    content: string;
    category: 'general' | 'todo' | 'bug' | 'idea' | 'research';
    timestamp: Date;
    tags: string[];
}

export class NotesProvider implements vscode.TreeDataProvider<NoteItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NoteItem | undefined | null | void> = new vscode.EventEmitter<NoteItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NoteItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private notes: Note[] = [];
    private context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.loadNotes();
        this.registerCommands();
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: NoteItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: NoteItem): NoteItem[] {
        if (!element) {
            // Root level - show categories
            const categories = this.getCategories();
            return categories.map(category => new NoteItem(
                category.name,
                vscode.TreeItemCollapsibleState.Expanded,
                category.icon,
                'category',
                category.category
            ));
        }

        if (element.contextValue === 'category') {
            // Show notes in this category
            const categoryNotes = this.notes.filter(note => note.category === element.category);
            return categoryNotes.map(note => {
                const item = new NoteItem(
                    note.title,
                    vscode.TreeItemCollapsibleState.None,
                    'note',
                    'note'
                );
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

    private getCategories() {
        return [
            { name: 'General', icon: 'note', category: 'general' as const },
            { name: 'TODOs', icon: 'checklist', category: 'todo' as const },
            { name: 'Bugs', icon: 'bug', category: 'bug' as const },
            { name: 'Ideas', icon: 'lightbulb', category: 'idea' as const },
            { name: 'Research', icon: 'book', category: 'research' as const }
        ];
    }

    private registerCommands() {
        const commands = [
            vscode.commands.registerCommand('web3-ai-agent.addNote', async () => {
                await this.addNote();
            }),

            vscode.commands.registerCommand('web3-ai-agent.openNote', async (note: Note) => {
                await this.openNote(note);
            }),

            vscode.commands.registerCommand('web3-ai-agent.deleteNote', async (item: NoteItem) => {
                if (item.note) {
                    await this.deleteNote(item.note.id);
                }
            }),

            vscode.commands.registerCommand('web3-ai-agent.editNote', async (item: NoteItem) => {
                if (item.note) {
                    await this.editNote(item.note);
                }
            })
        ];

        commands.forEach(command => this.context.subscriptions.push(command));
    }

    async addNote(): Promise<void> {
        const title = await vscode.window.showInputBox({
            prompt: 'Enter note title',
            placeHolder: 'My Note'
        });

        if (!title) return;

        const category = await vscode.window.showQuickPick([
            { label: 'General', value: 'general' },
            { label: 'TODO', value: 'todo' },
            { label: 'Bug', value: 'bug' },
            { label: 'Idea', value: 'idea' },
            { label: 'Research', value: 'research' }
        ], {
            placeHolder: 'Select category'
        });

        if (!category) return;

        const content = await vscode.window.showInputBox({
            prompt: 'Enter note content',
            placeHolder: 'Note content...'
        });

        if (!content) return;

        const note: Note = {
            id: this.generateId(),
            title,
            content,
            category: category.value as Note['category'],
            timestamp: new Date(),
            tags: []
        };

        this.notes.push(note);
        await this.saveNotes();
        this.refresh();

        vscode.window.showInformationMessage(`Note "${title}" added successfully!`);
    }

    async openNote(note: Note): Promise<void> {
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

    async editNote(note: Note): Promise<void> {
        const newTitle = await vscode.window.showInputBox({
            prompt: 'Edit note title',
            value: note.title
        });

        if (!newTitle) return;

        const newContent = await vscode.window.showInputBox({
            prompt: 'Edit note content',
            value: note.content
        });

        if (!newContent) return;

        note.title = newTitle;
        note.content = newContent;

        await this.saveNotes();
        this.refresh();

        vscode.window.showInformationMessage(`Note "${newTitle}" updated successfully!`);
    }

    async deleteNote(noteId: string): Promise<void> {
        const note = this.notes.find(n => n.id === noteId);
        if (!note) return;

        const confirm = await vscode.window.showWarningMessage(
            `Are you sure you want to delete "${note.title}"?`,
            'Delete',
            'Cancel'
        );

        if (confirm === 'Delete') {
            this.notes = this.notes.filter(n => n.id !== noteId);
            await this.saveNotes();
            this.refresh();

            vscode.window.showInformationMessage(`Note "${note.title}" deleted successfully!`);
        }
    }

    async addAIGeneratedNote(title: string, content: string, category: Note['category'] = 'general'): Promise<void> {
        const note: Note = {
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

    private async loadNotes(): Promise<void> {
        try {
            const savedNotes = this.context.globalState.get<Note[]>('web3-ai-agent.notes', []);
            this.notes = savedNotes.map(note => ({
                ...note,
                timestamp: new Date(note.timestamp)
            }));
        } catch (error) {
            console.error('Failed to load notes:', error);
            this.notes = [];
        }
    }

    private async saveNotes(): Promise<void> {
        try {
            await this.context.globalState.update('web3-ai-agent.notes', this.notes);
        } catch (error) {
            console.error('Failed to save notes:', error);
        }
    }

    private generateId(): string {
        return Math.random().toString(36).substr(2, 9);
    }

    getNotes(): Note[] {
        return this.notes;
    }

    getNotesInCategory(category: Note['category']): Note[] {
        return this.notes.filter(note => note.category === category);
    }
}

export class NoteItem extends vscode.TreeItem {
    public note?: Note;
    public category?: Note['category'];

    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly iconName: string,
        public readonly contextValue: string,
        category?: Note['category']
    ) {
        super(label, collapsibleState);
        this.iconPath = new vscode.ThemeIcon(iconName);
        this.category = category;
    }
}