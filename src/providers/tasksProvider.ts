import * as vscode from 'vscode';
import { TaskManager, Task } from '../utils/taskManager';

export class TasksProvider implements vscode.TreeDataProvider<TaskItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TaskItem | undefined | null | void> = new vscode.EventEmitter<TaskItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TaskItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private taskManager: TaskManager) {
        // Refresh every 5 seconds to show task progress
        setInterval(() => {
            this.refresh();
        }, 5000);
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TaskItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TaskItem): TaskItem[] {
        if (!element) {
            // Root level - show all tasks
            const tasks = this.taskManager.getTasks();
            return tasks.map(task => new TaskItem(task, vscode.TreeItemCollapsibleState.Collapsed));
        }

        // Child level - show task steps
        const task = element.task;
        return task.steps.map(step => {
            const stepItem = new TaskItem(
                {
                    id: `${task.id}-${step.name}`,
                    name: step.name,
                    description: step.output || '',
                    status: step.status,
                    progress: step.status === 'completed' ? 100 : step.status === 'running' ? 50 : 0,
                    steps: []
                } as Task,
                vscode.TreeItemCollapsibleState.None,
                true
            );
            return stepItem;
        });
    }
}

export class TaskItem extends vscode.TreeItem {
    constructor(
        public readonly task: Task,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly isStep: boolean = false
    ) {
        super(task.name, collapsibleState);
        
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = isStep ? 'taskStep' : 'task';
    }

    private getTooltip(): string {
        const task = this.task;
        let tooltip = `Status: ${task.status}\nProgress: ${task.progress}%`;
        
        if (task.startTime) {
            tooltip += `\nStarted: ${task.startTime.toLocaleString()}`;
        }
        
        if (task.endTime) {
            tooltip += `\nEnded: ${task.endTime.toLocaleString()}`;
        }
        
        if (task.result) {
            tooltip += `\nResult: ${task.result}`;
        }
        
        if (task.error) {
            tooltip += `\nError: ${task.error}`;
        }
        
        return tooltip;
    }

    private getDescription(): string {
        const task = this.task;
        
        if (this.isStep) {
            return this.getStatusText(task.status);
        }
        
        if (task.status === 'running') {
            return `${task.progress}% - ${this.getStatusText(task.status)}`;
        }
        
        return this.getStatusText(task.status);
    }

    private getStatusText(status: string): string {
        switch (status) {
            case 'pending': return 'Pending';
            case 'running': return 'Running...';
            case 'completed': return 'Completed ✓';
            case 'failed': return 'Failed ✗';
            default: return status;
        }
    }

    private getIcon(): vscode.ThemeIcon {
        const task = this.task;
        
        if (this.isStep) {
            switch (task.status) {
                case 'pending': return new vscode.ThemeIcon('circle-outline');
                case 'running': return new vscode.ThemeIcon('loading~spin');
                case 'completed': return new vscode.ThemeIcon('check');
                case 'failed': return new vscode.ThemeIcon('error');
                default: return new vscode.ThemeIcon('circle-outline');
            }
        }
        
        // Task icons based on type
        if (task.name.toLowerCase().includes('test')) {
            return new vscode.ThemeIcon('beaker');
        } else if (task.name.toLowerCase().includes('deploy')) {
            return new vscode.ThemeIcon('rocket');
        } else if (task.name.toLowerCase().includes('security') || task.name.toLowerCase().includes('audit')) {
            return new vscode.ThemeIcon('shield');
        } else if (task.name.toLowerCase().includes('optimize')) {
            return new vscode.ThemeIcon('zap');
        } else if (task.name.toLowerCase().includes('analyze')) {
            return new vscode.ThemeIcon('graph');
        }
        
        // Default icon based on status
        switch (task.status) {
            case 'pending': return new vscode.ThemeIcon('clock');
            case 'running': return new vscode.ThemeIcon('loading~spin');
            case 'completed': return new vscode.ThemeIcon('check-all');
            case 'failed': return new vscode.ThemeIcon('error');
            default: return new vscode.ThemeIcon('gear');
        }
    }
}