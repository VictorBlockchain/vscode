# Web3 AI Agent - VSCode Extension

A comprehensive AI-powered development assistant for Next.js and Web3 applications, specializing in Solana and Sui blockchain development.

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
- **Export Capabilities**: Save conversations and insights

## 📦 Installation

1. Clone this repository
2. Install dependencies: `npm install`
3. Compile TypeScript: `npm run compile`
4. Press `F5` to launch a new VSCode window with the extension loaded

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