# Installation Guide - Web3 AI Agent VSCode Extension

## 🚀 Quick Installation

### Method 1: Development Installation (Recommended for Testing)

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd vscode-web3-ai-agent
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile TypeScript**
   ```bash
   npm run compile
   ```

4. **Launch Extension**
   - Open the project in VSCode
   - Press `F5` to launch Extension Development Host
   - The extension will be loaded automatically

### Method 2: Package Installation

1. **Build Extension Package**
   ```bash
   npm run install-vsce  # Install vsce globally (one-time)
   npm run build         # Compile and package
   ```

2. **Install Package**
   ```bash
   code --install-extension web3-ai-agent-1.0.0.vsix
   ```

## ⚙️ Configuration

### 1. API Keys Setup

Open VSCode Settings (`Ctrl+,` or `Cmd+,`) and add your API keys:

**Via Settings UI:**
1. Search for "web3-ai-agent"
2. Enter your API keys in the respective fields

**Via settings.json:**
```json
{
  "web3-ai-agent.deepseekApiKey": "your-deepseek-api-key",
  "web3-ai-agent.openaiApiKey": "your-openai-api-key",
  "web3-ai-agent.claudeApiKey": "your-claude-api-key",
  "web3-ai-agent.preferredModel": "deepseek"
}
```

### 2. Blockchain Networks

Configure your preferred blockchain networks:

```json
{
  "web3-ai-agent.solanaNetwork": "devnet",
  "web3-ai-agent.suiNetwork": "testnet"
}
```

### 3. Advanced Settings

```json
{
  "web3-ai-agent.autoAnalyze": true,
  "web3-ai-agent.customApiEndpoint": "https://your-custom-api.com/v1/chat",
  "web3-ai-agent.customApiKey": "your-custom-api-key"
}
```

## 🔑 Getting API Keys

### DeepSeek API
1. Visit [DeepSeek Platform](https://platform.deepseek.com/)
2. Sign up for an account
3. Navigate to API Keys section
4. Generate a new API key
5. Copy and paste into VSCode settings

### OpenAI API
1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Sign up for an account
3. Go to API Keys section
4. Create a new secret key
5. Copy and paste into VSCode settings

### Claude API (Anthropic)
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign up for an account
3. Navigate to API Keys
4. Generate a new API key
5. Copy and paste into VSCode settings

## 🛠️ Development Setup

### Prerequisites
- Node.js 16+ 
- npm or yarn
- VSCode 1.74+
- TypeScript 4.9+

### Development Dependencies
```bash
npm install -g @vscode/vsce  # For packaging extensions
npm install -g typescript   # TypeScript compiler
```

### Building from Source
```bash
# Clone repository
git clone <repository-url>
cd vscode-web3-ai-agent

# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes (development)
npm run watch

# Package for distribution
npm run package
```

## 🔧 Troubleshooting

### Common Issues

#### Extension Not Loading
**Problem**: Extension doesn't appear in VSCode
**Solution**: 
1. Check VSCode version (requires 1.74+)
2. Restart VSCode
3. Check Developer Console for errors

#### API Keys Not Working
**Problem**: AI features not responding
**Solution**:
1. Verify API keys are correctly entered
2. Check API key permissions and quotas
3. Test with different AI models

#### Compilation Errors
**Problem**: TypeScript compilation fails
**Solution**:
1. Ensure Node.js 16+ is installed
2. Clear node_modules and reinstall: `rm -rf node_modules && npm install`
3. Check TypeScript version: `tsc --version`

#### Blockchain Features Not Working
**Problem**: Smart contract generation fails
**Solution**:
1. Check network connectivity
2. Verify blockchain network settings
3. Ensure proper API configuration

### Debug Mode

Enable debug mode for detailed logging:

1. Open Command Palette (`Ctrl+Shift+P`)
2. Run "Developer: Toggle Developer Tools"
3. Check Console tab for error messages
4. Enable verbose logging in extension settings

### Performance Issues

If the extension is slow:

1. **Reduce Auto-Analysis**: Set `autoAnalyze` to `false`
2. **Limit AI Requests**: Use shorter prompts
3. **Check Network**: Ensure stable internet connection
4. **Restart VSCode**: Clear any memory leaks

## 📦 Distribution

### Creating Release Package

1. **Update Version**
   ```bash
   npm version patch  # or minor/major
   ```

2. **Build Package**
   ```bash
   npm run build
   ```

3. **Test Package**
   ```bash
   code --install-extension web3-ai-agent-*.vsix
   ```

### Publishing to Marketplace

1. **Get Publisher Token**
   - Visit [Visual Studio Marketplace](https://marketplace.visualstudio.com/)
   - Create publisher account
   - Generate Personal Access Token

2. **Publish Extension**
   ```bash
   vsce publish
   ```

## 🔄 Updates

### Automatic Updates
- Extensions installed from marketplace update automatically
- Check for updates in Extensions view

### Manual Updates
1. Download latest .vsix file
2. Install using: `code --install-extension new-version.vsix`
3. Restart VSCode

## 🆘 Support

### Getting Help
- **Documentation**: Check README.md and ARCHITECTURE.md
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Discord**: Join our Discord community (if available)

### Reporting Issues
When reporting issues, include:
1. VSCode version
2. Extension version
3. Operating system
4. Error messages
5. Steps to reproduce

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

---

**Need help?** Open an issue on GitHub or check our documentation for more detailed guides.