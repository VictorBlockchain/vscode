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
exports.SolanaUtils = void 0;
const vscode = __importStar(require("vscode"));
class SolanaUtils {
    constructor() {
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        this.network = config.get('solanaNetwork', 'devnet');
    }
    getEndpoint() {
        const endpoints = {
            'mainnet-beta': 'https://api.mainnet-beta.solana.com',
            'testnet': 'https://api.testnet.solana.com',
            'devnet': 'https://api.devnet.solana.com',
            'localnet': 'http://localhost:8899'
        };
        return endpoints[this.network] || endpoints.devnet;
    }
    async getBalance(publicKey) {
        // This would integrate with @solana/web3.js when installed
        // For now, return mock data
        return Math.random() * 10;
    }
    async validateAddress(address) {
        // Basic Solana address validation (base58, 32 bytes)
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    }
    generateKeypair() {
        // This would use Keypair.generate() when @solana/web3.js is available
        return {
            publicKey: 'mock_public_key_' + Math.random().toString(36).substr(2, 9),
            secretKey: 'mock_secret_key_' + Math.random().toString(36).substr(2, 9)
        };
    }
    getExplorerUrl(signature) {
        const baseUrls = {
            'mainnet-beta': 'https://explorer.solana.com',
            'testnet': 'https://explorer.solana.com',
            'devnet': 'https://explorer.solana.com',
            'localnet': 'http://localhost:3000'
        };
        const baseUrl = baseUrls[this.network] || baseUrls.devnet;
        const cluster = this.network !== 'mainnet-beta' ? `?cluster=${this.network}` : '';
        return `${baseUrl}/tx/${signature}${cluster}`;
    }
    generateAnchorProject(projectName) {
        return `use anchor_lang::prelude::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod ${projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')} {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let base_account = &mut ctx.accounts.base_account;
        base_account.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 16 + 16)]
    pub base_account: Account<'info, BaseAccount>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub base_account: Account<'info, BaseAccount>,
}

#[account]
pub struct BaseAccount {
    pub count: u64,
}`;
    }
    generateClientCode(programId) {
        return `// Solana Client Integration Code
// Install dependencies: npm install @solana/web3.js @project-serum/anchor

import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, AnchorProvider, web3 } from '@project-serum/anchor';

const programID = new PublicKey('${programId}');
const network = clusterApiUrl('${this.network}');

export class SolanaClient {
    private connection: Connection;
    private programId: PublicKey;

    constructor() {
        this.connection = new Connection(network, 'confirmed');
        this.programId = programID;
    }

    async getBalance(publicKey: string): Promise<number> {
        const pubKey = new PublicKey(publicKey);
        const balance = await this.connection.getBalance(pubKey);
        return balance / 1e9; // Convert lamports to SOL
    }

    async sendTransaction(transaction: any, signers: any[]): Promise<string> {
        const signature = await this.connection.sendTransaction(transaction, signers);
        await this.connection.confirmTransaction(signature);
        return signature;
    }
}

// Usage example:
// const client = new SolanaClient();
// const balance = await client.getBalance('your-public-key');`;
    }
    getNetwork() {
        return this.network;
    }
    setNetwork(network) {
        this.network = network;
        // Update configuration
        const config = vscode.workspace.getConfiguration('web3-ai-agent');
        config.update('solanaNetwork', network, vscode.ConfigurationTarget.Global);
    }
}
exports.SolanaUtils = SolanaUtils;
//# sourceMappingURL=solanaUtils.js.map