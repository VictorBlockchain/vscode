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
exports.TaskItem = exports.TasksProvider = void 0;
const vscode = __importStar(require("vscode"));
class TasksProvider {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
        // Refresh every 5 seconds to show task progress
        setInterval(() => {
            this.refresh();
        }, 5000);
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    getChildren(element) {
        if (!element) {
            // Root level - show all tasks
            const tasks = this.taskManager.getTasks();
            return tasks.map(task => new TaskItem(task, vscode.TreeItemCollapsibleState.Collapsed));
        }
        // Child level - show task steps
        const task = element.task;
        return task.steps.map(step => {
            const stepItem = new TaskItem({
                id: `${task.id}-${step.name}`,
                name: step.name,
                description: step.output || '',
                status: step.status,
                progress: step.status === 'completed' ? 100 : step.status === 'running' ? 50 : 0,
                steps: []
            }, vscode.TreeItemCollapsibleState.None, true);
            return stepItem;
        });
    }
}
exports.TasksProvider = TasksProvider;
class TaskItem extends vscode.TreeItem {
    constructor(task, collapsibleState, isStep = false) {
        super(task.name, collapsibleState);
        this.task = task;
        this.collapsibleState = collapsibleState;
        this.isStep = isStep;
        this.tooltip = this.getTooltip();
        this.description = this.getDescription();
        this.iconPath = this.getIcon();
        this.contextValue = isStep ? 'taskStep' : 'task';
    }
    getTooltip() {
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
    getDescription() {
        const task = this.task;
        if (this.isStep) {
            return this.getStatusText(task.status);
        }
        if (task.status === 'running') {
            return `${task.progress}% - ${this.getStatusText(task.status)}`;
        }
        return this.getStatusText(task.status);
    }
    getStatusText(status) {
        switch (status) {
            case 'pending': return 'Pending';
            case 'running': return 'Running...';
            case 'completed': return 'Completed ✓';
            case 'failed': return 'Failed ✗';
            default: return status;
        }
    }
    getIcon() {
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
        }
        else if (task.name.toLowerCase().includes('deploy')) {
            return new vscode.ThemeIcon('rocket');
        }
        else if (task.name.toLowerCase().includes('security') || task.name.toLowerCase().includes('audit')) {
            return new vscode.ThemeIcon('shield');
        }
        else if (task.name.toLowerCase().includes('optimize')) {
            return new vscode.ThemeIcon('zap');
        }
        else if (task.name.toLowerCase().includes('analyze')) {
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
exports.TaskItem = TaskItem;
//# sourceMappingURL=tasksProvider.js.map