# Web3 AI Agent VSCode Extension Demo

## 🚀 Quick Start Guide

### 1. Installation & Setup

1. **Clone and Build**:
   ```bash
   git clone <repository-url>
   cd vscode-web3-ai-agent
   npm install
   npm run compile
   ```

2. **Launch Extension**:
   - Open VSCode
   - Press `F5` to launch a new Extension Development Host window
   - The extension will be loaded automatically

### 2. Configuration

Open VSCode Settings (`Ctrl+,`) and configure your API keys:

```json
{
  "web3-ai-agent.deepseekApiKey": "your-deepseek-api-key",
  "web3-ai-agent.openaiApiKey": "your-openai-api-key", 
  "web3-ai-agent.claudeApiKey": "your-claude-api-key",
  "web3-ai-agent.preferredModel": "deepseek",
  "web3-ai-agent.autoAnalyze": true,
  "web3-ai-agent.solanaNetwork": "devnet",
  "web3-ai-agent.suiNetwork": "testnet"
}
```

### 3. Using the Extension

#### 🤖 AI Chat Interface
1. Click the robot icon (🤖) in the activity bar
2. Or use Command Palette: `Ctrl+Shift+P` → "Web3 AI Agent: Open AI Agent Chat"
3. Start chatting with the AI about your Web3 development needs

#### 📊 Project Analysis
1. Open a Next.js or Web3 project
2. Use Command: "Web3 AI Agent: Analyze Project Structure"
3. View insights in the Project Overview panel

#### ⚛️ Component Generation
1. Use Command: "Web3 AI Agent: Generate Next.js Component"
2. Enter component name when prompted
3. AI generates a complete TypeScript React component

#### ⛓️ Smart Contract Generation
1. Use Command: "Web3 AI Agent: Generate Smart Contract"
2. Choose blockchain (Solana or Sui)
3. Enter contract name
4. AI generates complete contract code with tests

#### ⚡ Code Optimization
1. Select code in editor
2. Use Command: "Web3 AI Agent: Optimize Code"
3. AI analyzes and improves your code

### 4. Demo Scenarios

#### Scenario 1: Next.js Component Creation
```
Chat: "Create a wallet connection component for Solana"
```
**Result**: AI generates a complete React component with:
- TypeScript interfaces
- Wallet adapter integration
- Error handling
- Responsive design

#### Scenario 2: Smart Contract Development
```
Chat: "Generate a Solana NFT minting contract"
```
**Result**: AI creates:
- Rust/Anchor smart contract
- Comprehensive tests
- Client integration code
- Deployment instructions

#### Scenario 3: Project Optimization
```
Chat: "Analyze my project and suggest optimizations"
```
**Result**: AI provides:
- Bundle size analysis
- Performance recommendations
- Security improvements
- Best practices suggestions

### 5. Key Features Demonstrated

#### 🧠 Multi-Model AI Support
- **DeepSeek**: Specialized for code generation
- **GPT-4**: Advanced reasoning and analysis
- **Claude**: Excellent for code review and documentation
- **Custom APIs**: Bring your own model

#### 🔧 Autonomous Task Execution
- **Automated Testing**: Run tests with AI analysis
- **Security Auditing**: Comprehensive vulnerability scanning
- **Deployment**: One-click contract deployment
- **Documentation**: Auto-generated project docs

#### 📝 Smart Note-Taking
- **AI-Generated Notes**: Automatic insights and TODOs
- **Categorized Storage**: Organized by type (bugs, ideas, research)
- **Project Context**: Notes linked to specific projects

#### 🌐 Blockchain Integration
- **Multi-Chain Support**: Solana, Sui, and extensible to others
- **Network Management**: Easy switching between networks
- **Wallet Integration**: Ready-to-use wallet connection code

### 6. Advanced Usage

#### Custom AI Prompts
The extension supports sophisticated prompting for specific tasks:

```
"Generate a DeFi yield farming contract for Solana with the following features:
- Stake LP tokens
- Distribute rewards based on time
- Emergency withdrawal function
- Admin controls for reward rates"
```

#### Project-Aware Assistance
The AI understands your project context:
- Existing dependencies
- Code patterns
- Architecture decisions
- Blockchain integrations

#### Continuous Learning
The extension learns from your preferences:
- Code style preferences
- Framework choices
- Security requirements
- Performance priorities

### 7. Troubleshooting

#### Common Issues:
1. **API Key Not Working**: Check configuration and key validity
2. **Compilation Errors**: Ensure TypeScript is properly configured
3. **Extension Not Loading**: Check VSCode version compatibility

#### Debug Mode:
- Open Developer Tools: `Help` → `Toggle Developer Tools`
- Check Console for error messages
- Enable verbose logging in settings

### 8. Next Steps

After the demo, you can:
1. **Customize Prompts**: Modify AI behavior for your specific needs
2. **Add New Models**: Integrate additional AI providers
3. **Extend Blockchain Support**: Add Ethereum, Polygon, etc.
4. **Create Templates**: Save common patterns for reuse

---

## 🎯 Demo Script

### Opening (2 minutes)
1. Show VSCode with extension installed
2. Highlight the robot icon in activity bar
3. Open a sample Next.js project

### Core Features (8 minutes)
1. **AI Chat** (2 min): Open chat, ask for component generation
2. **Project Analysis** (2 min): Run analysis, show insights
3. **Smart Contract** (2 min): Generate Solana contract
4. **Code Optimization** (2 min): Select code, optimize with AI

### Advanced Features (5 minutes)
1. **Task Automation** (2 min): Show automated testing
2. **Multi-Model Support** (1 min): Switch between AI models
3. **Notes & Documentation** (2 min): AI-generated project notes

### Q&A and Wrap-up (5 minutes)
- Answer questions about implementation
- Discuss potential use cases
- Show roadmap for future features

**Total Demo Time: ~20 minutes**

---

*This extension represents the future of AI-assisted Web3 development, making blockchain development accessible to developers of all skill levels.*