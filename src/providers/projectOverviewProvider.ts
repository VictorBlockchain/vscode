import * as vscode from 'vscode';
import { ProjectAnalyzer, ProjectAnalysis } from '../utils/projectAnalyzer';

export class ProjectOverviewProvider implements vscode.TreeDataProvider<ProjectOverviewItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<ProjectOverviewItem | undefined | null | void> = new vscode.EventEmitter<ProjectOverviewItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<ProjectOverviewItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private projectAnalysis?: ProjectAnalysis;

    constructor(private projectAnalyzer: ProjectAnalyzer) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: ProjectOverviewItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: ProjectOverviewItem): Promise<ProjectOverviewItem[]> {
        if (!element) {
            // Root level
            try {
                this.projectAnalysis = await this.projectAnalyzer.analyzeWorkspace();
                return this.getRootItems();
            } catch (error) {
                return [new ProjectOverviewItem('No workspace found', vscode.TreeItemCollapsibleState.None, 'error')];
            }
        }

        // Child items
        return this.getChildItems(element);
    }

    private getRootItems(): ProjectOverviewItem[] {
        if (!this.projectAnalysis) {
            return [];
        }

        const items: ProjectOverviewItem[] = [];

        // Project Info
        items.push(new ProjectOverviewItem(
            `Framework: ${this.projectAnalysis.framework}`,
            vscode.TreeItemCollapsibleState.None,
            'info'
        ));

        if (this.projectAnalysis.blockchain.length > 0) {
            items.push(new ProjectOverviewItem(
                `Blockchain: ${this.projectAnalysis.blockchain.join(', ')}`,
                vscode.TreeItemCollapsibleState.None,
                'blockchain'
            ));
        }

        // Components
        if (this.projectAnalysis.components.length > 0) {
            items.push(new ProjectOverviewItem(
                `Components (${this.projectAnalysis.components.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'components',
                'components'
            ));
        }

        // Contracts
        if (this.projectAnalysis.contracts.length > 0) {
            items.push(new ProjectOverviewItem(
                `Smart Contracts (${this.projectAnalysis.contracts.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'contracts',
                'contracts'
            ));
        }

        // Dependencies
        if (this.projectAnalysis.dependencies.length > 0) {
            items.push(new ProjectOverviewItem(
                `Dependencies (${this.projectAnalysis.dependencies.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'dependencies',
                'dependencies'
            ));
        }

        // Recommendations
        if (this.projectAnalysis.recommendations.length > 0) {
            items.push(new ProjectOverviewItem(
                `Recommendations (${this.projectAnalysis.recommendations.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'recommendations',
                'recommendations'
            ));
        }

        // Issues
        if (this.projectAnalysis.issues.length > 0) {
            items.push(new ProjectOverviewItem(
                `Issues (${this.projectAnalysis.issues.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'issues',
                'issues'
            ));
        }

        return items;
    }

    private getChildItems(element: ProjectOverviewItem): ProjectOverviewItem[] {
        if (!this.projectAnalysis) {
            return [];
        }

        switch (element.contextValue) {
            case 'components':
                return this.projectAnalysis.components.map(component => {
                    const item = new ProjectOverviewItem(
                        `${component.name} (${component.type})`,
                        vscode.TreeItemCollapsibleState.None,
                        this.getComponentIcon(component.type),
                        'component'
                    );
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
                    const item = new ProjectOverviewItem(
                        `${contract.name} (${contract.blockchain})`,
                        vscode.TreeItemCollapsibleState.None,
                        this.getContractIcon(contract.blockchain),
                        'contract'
                    );
                    item.tooltip = `Language: ${contract.language}\nSecurity: ${contract.security}\nFunctions: ${contract.functions.length}`;
                    item.command = {
                        command: 'vscode.open',
                        title: 'Open Contract',
                        arguments: [vscode.Uri.file(contract.path)]
                    };
                    return item;
                });

            case 'dependencies':
                return this.projectAnalysis.dependencies.slice(0, 20).map(dep => 
                    new ProjectOverviewItem(
                        dep,
                        vscode.TreeItemCollapsibleState.None,
                        'package',
                        'dependency'
                    )
                );

            case 'recommendations':
                return this.projectAnalysis.recommendations.map((rec, index) => {
                    const item = new ProjectOverviewItem(
                        `${index + 1}. ${rec.substring(0, 50)}${rec.length > 50 ? '...' : ''}`,
                        vscode.TreeItemCollapsibleState.None,
                        'lightbulb',
                        'recommendation'
                    );
                    item.tooltip = rec;
                    return item;
                });

            case 'issues':
                return this.projectAnalysis.issues.map((issue, index) => {
                    const item = new ProjectOverviewItem(
                        `${index + 1}. ${issue.substring(0, 50)}${issue.length > 50 ? '...' : ''}`,
                        vscode.TreeItemCollapsibleState.None,
                        'warning',
                        'issue'
                    );
                    item.tooltip = issue;
                    return item;
                });

            default:
                return [];
        }
    }

    private getComponentIcon(type: string): string {
        switch (type) {
            case 'page': return 'file-text';
            case 'component': return 'symbol-class';
            case 'layout': return 'layout';
            case 'hook': return 'symbol-function';
            case 'utility': return 'tools';
            default: return 'file';
        }
    }

    private getContractIcon(blockchain: string): string {
        switch (blockchain) {
            case 'solana': return 'symbol-method';
            case 'sui': return 'symbol-interface';
            case 'ethereum': return 'symbol-event';
            default: return 'file-code';
        }
    }
}

export class ProjectOverviewItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly iconName: string,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState);
        this.iconPath = new vscode.ThemeIcon(iconName);
    }
}