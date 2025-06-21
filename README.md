# 🤖 Jordi - AI Development Assistant

Meet Jordi, your smart AI coding companion for Next.js and Web3 development! Jordi specializes in Solana and Sui blockchain development and makes coding feel like having a conversation with a brilliant colleague.

## 🚀 Features

### 🤖 AI-Powered Development
- **Multi-Model Support**: DeepSeek, GPT-4, Claude, Local LLMs, and custom APIs
- **Local LLM Integration**: Complete privacy with Ollama, LM Studio, vLLM, and more
- **Intelligent Code Generation**: Components, smart contracts, and utilities
- **Code Optimization**: Performance and security improvements
- **Automated Testing**: AI-driven test analysis and recommendations

### ⛓️ Blockchain Development
- **Solana Integration**: Rust/Anchor smart contract development
- **Sui Integration**: Move language smart contract development
- **Deployment Automation**: One-click contract deployment
- **Network Management**: Multi-network support (mainnet, testnet, devnet)

### 🔧 Project Management
- **Project Analysis**: Comprehensive codebase understanding
- **Task Automation**: Autonomous task execution
- **Security Auditing**: Automated vulnerability scanning
- **Documentation**: AI-generated docs and notes

### 💬 Interactive Chat Interface
- **Natural Language Commands**: Conversational development assistance
- **Chat Configuration**: Configure everything through natural conversation
- **Context-Aware Responses**: Project-specific recommendations
- **Quick Actions**: One-click common tasks

### 🧠 Memory System
- **Persistent Memory**: Remembers your preferences, project context, and configurations
- **Automatic Learning**: Learns from your coding patterns and decisions
- **Smart Context**: Uses memory to provide personalized assistance
- **Memory Management**: Search, view, and manage stored memories
- **Export Capabilities**: Save conversations and insights

## 📦 Installation

### 🚀 Quick Install (Recommended)

**Option 1: Download Pre-built Extension**
1. Download `jordi-ai-agent-1.0.0.vsix` from the [releases page](https://github.com/VictorBlockchain/vscode/releases)
2. Open VS Code
3. Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
4. Type "Extensions: Install from VSIX"
5. Select the downloaded `.vsix` file
6. Restart VS Code
7. Look for the 🤖 robot icon in the Activity Bar

**Option 2: Install from Source**

**Windows/Linux:**
```bash
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
./install-jordi.sh
code .
# Press F5 to launch development mode
```

**Mac:**
```bash
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
./install-jordi-mac.sh
code .
# Press Cmd+F5 (NOT F5!) to launch development mode
```

### 📋 Installation Verification

After installation, you should see:
- 🤖 **Robot icon** in the VS Code Activity Bar (left sidebar)
- **Jordi commands** available in Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)
- **Welcome message** when clicking the robot icon

### 🆘 Troubleshooting Installation

**No robot icon visible?**
- Go to `View → Appearance → Activity Bar` (ensure it's enabled)
- Try `Ctrl+Shift+P` → "View: Show Jordi - AI Assistant"

**Extension not loading?**
- Restart VS Code completely
- Check `View → Output → Jordi AI Agent` for error messages
- See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help

**Platform-specific help:**
- **Mac users**: Use `Cmd+F5` instead of `F5` - See [QUICK_START_MAC.md](./QUICK_START_MAC.md)
- **Windows users**: See [QUICK_START_WINDOWS.md](./QUICK_START_WINDOWS.md) for Windows-specific instructions
- **All platforms**: See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed help

## ⚙️ Configuration

Configure your API keys and preferences in VSCode settings:

```json
{
  "web3-ai-agent.deepseekApiKey": "your-deepseek-api-key",
  "web3-ai-agent.openaiApiKey": "your-openai-api-key",
  "web3-ai-agent.claudeApiKey": "your-claude-api-key",
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:11434",
  "web3-ai-agent.localLLM.model": "codellama:7b",
  "web3-ai-agent.localLLM.apiFormat": "ollama",
  "web3-ai-agent.autoAnalyze": true,
  "web3-ai-agent.solanaNetwork": "devnet",
  "web3-ai-agent.suiNetwork": "testnet"
}
```

## 🏠 Local LLM Setup (Privacy-First Option)

For complete privacy and zero API costs, you can run AI models locally:

### Quick Setup with Ollama (Recommended)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a coding model
ollama pull codellama:7b

# Start the server
ollama serve
```

### Configure VSCode
1. Open Command Palette (`Ctrl+Shift+P`)
2. Run: `Web3 AI Agent: Configure Local LLM`
3. Set endpoint: `http://localhost:11434`
4. Set format: `ollama`
5. Set model: `codellama:7b`
6. Test connection: `Web3 AI Agent: Test Local LLM Connection`

**Benefits:**
- 🔒 **Complete Privacy**: Code never leaves your machine
- 💰 **Zero API Costs**: No monthly subscriptions
- ⚡ **Low Latency**: Direct local communication
- 🔌 **Offline Development**: Works without internet

See [LOCAL_LLM_GUIDE.md](./LOCAL_LLM_GUIDE.md) for detailed setup instructions.

## 🎯 Quick Start

1. **Open the AI Chat**: Click the robot icon in the activity bar or use `Ctrl+Shift+P` → "Web3 AI Agent: Open AI Agent Chat"

2. **Configure Through Chat** (NEW!): 
   - Say: `"set openai api to sk-xxx"` to configure API keys
   - Say: `"switch to local"` for privacy-first local LLM
   - Say: `"use ollama model codellama:7b"` for specific models
   - Say: `"help with config"` to see all options

3. **Analyze Your Project**: Use the command "Analyze Project Structure" to get AI insights about your codebase

4. **Generate Components**: Ask the AI to "Generate a React component" and follow the prompts

5. **Create Smart Contracts**: Request "Create a Solana smart contract" or "Create a Sui smart contract"

6. **Optimize Code**: Select code and use "Optimize Code" for AI-powered improvements

7. **Use Memory System** (NEW!):
   - Say: `"remember that I prefer TypeScript"` to store preferences
   - Say: `"show my memory"` to view stored information
   - Say: `"search memory for API keys"` to find specific memories
   - Jordi automatically remembers your configurations and project context!

## 🛠️ Available Commands

### Core Commands
- `Web3 AI Agent: Open AI Agent Chat` - Launch the interactive chat interface
- `Web3 AI Agent: Analyze Project Structure` - Comprehensive project analysis
- `Web3 AI Agent: Generate Next.js Component` - Create React components
- `Web3 AI Agent: Generate Smart Contract` - Create blockchain contracts
- `Web3 AI Agent: Optimize Code` - Improve selected code
- `Web3 AI Agent: Run Tests with AI Analysis` - Execute and analyze tests
- `Web3 AI Agent: Deploy Smart Contract` - Deploy contracts to blockchain
- `Web3 AI Agent: Security Audit` - Perform security analysis

### Local LLM Commands
- `Web3 AI Agent: Configure Local LLM` - Set up local AI models
- `Web3 AI Agent: Test Local LLM Connection` - Verify local model connectivity
- `Web3 AI Agent: List Local LLM Models` - Browse and select available models

### Terminal Monitoring
- `Web3 AI Agent: Start Terminal Monitoring` - Enable automatic error detection
- `Web3 AI Agent: Stop Terminal Monitoring` - Disable monitoring
- `Web3 AI Agent: Toggle Auto-Fix` - Enable/disable automatic error fixing
- `Web3 AI Agent: Analyze Terminal Error` - Manually analyze error messages

### Memory System (NEW!)
- `Jordi: Show Memory Notepad` - Display all stored memories with beautiful interface
- `Jordi: Search Memory` - Search for specific memories and information
- `Jordi: Clear Memory` - Reset all memories (with confirmation)
- **Chat Commands**: `"show my memory"`, `"remember that..."`, `"search memory for..."`

## 📊 Sidebar Views

### Project Overview
- Framework detection (Next.js, React)
- Blockchain integration status
- Component and contract inventory
- AI-generated recommendations

### AI Tasks
- Real-time task progress
- Automated workflow execution
- Task history and results

### AI Notes
- Categorized note-taking
- AI-generated insights
- Project documentation

## 🔗 Blockchain Support

### Solana
- **Language**: Rust with Anchor framework
- **Networks**: Mainnet, Testnet, Devnet, Localnet
- **Features**: Program deployment, account management, transaction handling
- **Tools**: Anchor CLI integration, wallet connectivity

### Sui
- **Language**: Move
- **Networks**: Mainnet, Testnet, Devnet, Localnet
- **Features**: Package publishing, object management, transaction execution
- **Tools**: Sui CLI integration, wallet connectivity

## 🧠 AI Models

### DeepSeek (Default)
- Specialized in code generation
- Excellent for technical tasks
- Cost-effective for development

### OpenAI GPT-4
- Advanced reasoning capabilities
- Comprehensive knowledge base
- Premium model for complex tasks

### Claude
- Strong analytical capabilities
- Excellent for code review
- Great for documentation

### Custom APIs
- Bring your own model
- Flexible endpoint configuration
- Custom authentication support

## 🔒 Security Features

- **Smart Contract Auditing**: Automated vulnerability detection
- **Dependency Scanning**: Security analysis of npm packages
- **Code Analysis**: Static analysis for common security issues
- **Best Practices**: AI-powered security recommendations

## 🚀 Performance Optimization

- **Bundle Analysis**: Identify optimization opportunities
- **Code Splitting**: Automated optimization suggestions
- **Performance Monitoring**: Real-time performance insights
- **Gas Optimization**: Smart contract efficiency improvements

## 📝 Development Workflow

1. **Project Setup**: AI analyzes your project structure
2. **Development**: Generate components and contracts with AI assistance
3. **Testing**: Automated test execution and analysis
4. **Optimization**: AI-powered code improvements
5. **Deployment**: One-click blockchain deployment
6. **Monitoring**: Ongoing performance and security monitoring

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)

## 🗺️ Roadmap

- [ ] Ethereum smart contract support
- [ ] Advanced debugging tools
- [ ] Team collaboration features
- [ ] CI/CD integration
- [ ] Mobile development support
- [ ] Advanced analytics dashboard

---

**Made with ❤️ for the Web3 developer community**