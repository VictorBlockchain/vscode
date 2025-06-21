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
exports.ProjectOverviewItem = exports.ProjectOverviewProvider = void 0;
const vscode = __importStar(require("vscode"));
class ProjectOverviewProvider {
    constructor(projectAnalyzer) {
        this.projectAnalyzer = projectAnalyzer;
        this._onDidChangeTreeData = new vscode.EventEmitter();
        this.onDidChangeTreeData = this._onDidChangeTreeData.event;
    }
    refresh() {
        this._onDidChangeTreeData.fire();
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        if (!element) {
            // Root level
            try {
                this.projectAnalysis = await this.projectAnalyzer.analyzeWorkspace();
                return this.getRootItems();
            }
            catch (error) {
                return [new ProjectOverviewItem('No workspace found', vscode.TreeItemCollapsibleState.None, 'error')];
            }
        }
        // Child items
        return this.getChildItems(element);
    }
    getRootItems() {
        if (!this.projectAnalysis) {
            return [];
        }
        const items = [];
        // Project Info
        items.push(new ProjectOverviewItem(`Framework: ${this.projectAnalysis.framework}`, vscode.TreeItemCollapsibleState.None, 'info'));
        if (this.projectAnalysis.blockchain.length > 0) {
            items.push(new ProjectOverviewItem(`Blockchain: ${this.projectAnalysis.blockchain.join(', ')}`, vscode.TreeItemCollapsibleState.None, 'blockchain'));
        }
        // Components
        if (this.projectAnalysis.components.length > 0) {
            items.push(new ProjectOverviewItem(`Components (${this.projectAnalysis.components.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'components', 'components'));
        }
        // Contracts
        if (this.projectAnalysis.contracts.length > 0) {
            items.push(new ProjectOverviewItem(`Smart Contracts (${this.projectAnalysis.contracts.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'contracts', 'contracts'));
        }
        // Dependencies
        if (this.projectAnalysis.dependencies.length > 0) {
            items.push(new ProjectOverviewItem(`Dependencies (${this.projectAnalysis.dependencies.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'dependencies', 'dependencies'));
        }
        // Recommendations
        if (this.projectAnalysis.recommendations.length > 0) {
            items.push(new ProjectOverviewItem(`Recommendations (${this.projectAnalysis.recommendations.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'recommendations', 'recommendations'));
        }
        // Issues
        if (this.projectAnalysis.issues.length > 0) {
            items.push(new ProjectOverviewItem(`Issues (${this.projectAnalysis.issues.length})`, vscode.TreeItemCollapsibleState.Collapsed, 'issues', 'issues'));
        }
        return items;
    }
    getChildItems(element) {
        if (!this.projectAnalysis) {
            return [];
        }
        switch (element.contextValue) {
            case 'components':
                return this.projectAnalysis.components.map(component => {
                    const item = new ProjectOverviewItem(`${component.name} (${component.type})`, vscode.TreeItemCollapsibleState.None, this.getComponentIcon(component.type), 'component');
                    item.tooltip = `Path: ${component.path}\nWeb3: ${component.web3Integration ? 'Yes' : 'No'}`;
                    item.command = {
                        command: 'vscode.open',
                        title: 'Open Component',
                        arguments: [vscode.Uri.file(component.path)]
                    };
                    return item;
                });
            case 'contracts':
                return this.projectAnalysis.contracts.map(contract => {
                    const item = new ProjectOverviewItem(`${contract.name} (${contract.blockchain})`, vscode.TreeItemCollapsibleState.None, this.getContractIcon(contract.blockchain), 'contract');
                    item.tooltip = `Language: ${contract.language}\nSecurity: ${contract.security}\nFunctions: ${contract.functions.length}`;
                    item.command = {
                        command: 'vscode.open',
                        title: 'Open Contract',
                        arguments: [vscode.Uri.file(contract.path)]
                    };
                    return item;
                });
            case 'dependencies':
                return this.projectAnalysis.dependencies.slice(0, 20).map(dep => new ProjectOverviewItem(dep, vscode.TreeItemCollapsibleState.None, 'package', 'dependency'));
            case 'recommendations':
                return this.projectAnalysis.recommendations.map((rec, index) => {
                    const item = new ProjectOverviewItem(`${index + 1}. ${rec.substring(0, 50)}${rec.length > 50 ? '...' : ''}`, vscode.TreeItemCollapsibleState.None, 'lightbulb', 'recommendation');
                    item.tooltip = rec;
                    return item;
                });
            case 'issues':
                return this.projectAnalysis.issues.map((issue, index) => {
                    const item = new ProjectOverviewItem(`${index + 1}. ${issue.substring(0, 50)}${issue.length > 50 ? '...' : ''}`, vscode.TreeItemCollapsibleState.None, 'warning', 'issue');
                    item.tooltip = issue;
                    return item;
                });
            default:
                return [];
        }
    }
    getComponentIcon(type) {
        switch (type) {
            case 'page': return 'file-text';
            case 'component': return 'symbol-class';
            case 'layout': return 'layout';
            case 'hook': return 'symbol-function';
            case 'utility': return 'tools';
            default: return 'file';
        }
    }
    getContractIcon(blockchain) {
        switch (blockchain) {
            case 'solana': return 'symbol-method';
            case 'sui': return 'symbol-interface';
            case 'ethereum': return 'symbol-event';
            default: return 'file-code';
        }
    }
}
exports.ProjectOverviewProvider = ProjectOverviewProvider;
class ProjectOverviewItem extends vscode.TreeItem {
    constructor(label, collapsibleState, iconName, contextValue) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.iconName = iconName;
        this.contextValue = contextValue;
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}
exports.ProjectOverviewItem = ProjectOverviewItem;
//# sourceMappingURL=projectOverviewProvider.js.map