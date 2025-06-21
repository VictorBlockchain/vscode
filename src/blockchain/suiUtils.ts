import * as vscode from 'vscode';

export class SuiUtils {
    private network: string;

    constructor() {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        this.network = config.get<string>('suiNetwork', 'testnet');
    }

    private getRpcUrl(): string {
        const endpoints = {
            'mainnet': 'https://fullnode.mainnet.sui.io:443',
            'testnet': 'https://fullnode.testnet.sui.io:443',
            'devnet': 'https://fullnode.devnet.sui.io:443',
            'localnet': 'http://localhost:9000'
        };
        return endpoints[this.network as keyof typeof endpoints] || endpoints.testnet;
    }

    async getBalance(address: string): Promise<string> {
        // This would integrate with @mysten/sui when installed
        // For now, return mock data
        return (Math.random() * 100).toFixed(2);
    }

    async validateAddress(address: string): Promise<boolean> {
        // Basic validation - Sui addresses are 32 bytes hex with 0x prefix
        return /^0x[a-fA-F0-9]{64}$/.test(address);
    }

    generateKeypair(): { address: string; secretKey: string; publicKey: string } {
        // This would use Ed25519Keypair when @mysten/sui is available
        const mockId = Math.random().toString(16).substr(2, 64);
        return {
            address: '0x' + mockId,
            secretKey: 'mock_secret_key_' + Math.random().toString(36).substr(2, 9),
            publicKey: 'mock_public_key_' + Math.random().toString(36).substr(2, 9)
        };
    }

    getExplorerUrl(transactionDigest: string): string {
        const baseUrls = {
            'mainnet': 'https://suiexplorer.com',
            'testnet': 'https://suiexplorer.com',
            'devnet': 'https://suiexplorer.com',
            'localnet': 'http://localhost:3000'
        };

        const baseUrl = baseUrls[this.network as keyof typeof baseUrls] || baseUrls.testnet;
        const network = this.network !== 'mainnet' ? `?network=${this.network}` : '';
        
        return `${baseUrl}/txblock/${transactionDigest}${network}`;
    }

    generateMoveModule(moduleName: string): string {
        return `module ${moduleName.toLowerCase()}::${moduleName.toLowerCase()} {
    use sui::object::{Self, UID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};

    /// A simple counter object
    struct Counter has key, store {
        id: UID,
        value: u64,
    }

    /// Create a new counter
    public fun create_counter(ctx: &mut TxContext) {
        let counter = Counter {
            id: object::new(ctx),
            value: 0,
        };
        transfer::share_object(counter);
    }

    /// Increment the counter
    public fun increment(counter: &mut Counter) {
        counter.value = counter.value + 1;
    }

    /// Get the current value
    public fun value(counter: &Counter): u64 {
        counter.value
    }

    /// Reset the counter to zero
    public fun reset(counter: &mut Counter) {
        counter.value = 0;
    }

    #[test]
    fun test_counter() {
        use sui::test_scenario;

        let admin = @0xABBA;
        let scenario_val = test_scenario::begin(admin);
        let scenario = &mut scenario_val;

        test_scenario::next_tx(scenario, admin);
        {
            create_counter(test_scenario::ctx(scenario));
        };

        test_scenario::next_tx(scenario, admin);
        {
            let counter = test_scenario::take_shared<Counter>(scenario);
            assert!(value(&counter) == 0, 0);
            
            increment(&mut counter);
            assert!(value(&counter) == 1, 1);
            
            increment(&mut counter);
            assert!(value(&counter) == 2, 2);
            
            reset(&mut counter);
            assert!(value(&counter) == 0, 3);
            
            test_scenario::return_shared(counter);
        };

        test_scenario::end(scenario_val);
    }
}`;
    }

    generateClientCode(packageId: string, moduleName: string): string {
        return `// Sui Client Integration Code
// Install dependencies: npm install @mysten/sui

import { SuiClient, getFullnodeUrl } from '@mysten/sui/client';
import { TransactionBlock } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';

const client = new SuiClient({ url: getFullnodeUrl('${this.network}') });
const packageId = '${packageId}';

export class ${moduleName}Client {
    private client: SuiClient;
    private packageId: string;

    constructor() {
        this.client = client;
        this.packageId = packageId;
    }

    async getBalance(address: string): Promise<string> {
        const balance = await this.client.getBalance({ owner: address });
        return (parseInt(balance.totalBalance) / 1_000_000_000).toString();
    }

    async executeMove(functionName: string, args: any[] = []) {
        const txb = new TransactionBlock();
        
        txb.moveCall({
            target: \`\${this.packageId}::${moduleName.toLowerCase()}::\${functionName}\`,
            arguments: args,
        });

        return txb;
    }
}

// Usage example:
// const client = new ${moduleName}Client();
// const balance = await client.getBalance('your-sui-address');`;
    }

    async publishPackage(packagePath: string): Promise<any> {
        // This would integrate with the Sui CLI for package publishing
        // For now, return a mock result
        return {
            packageId: '0x' + Math.random().toString(16).substr(2, 64),
            transactionDigest: '0x' + Math.random().toString(16).substr(2, 64)
        };
    }

    getNetwork(): string {
        return this.network;
    }

    setNetwork(network: string): void {
        this.network = network;
        
        // Update configuration
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        config.update('suiNetwork', network, vscode.ConfigurationTarget.Global);
    }
}