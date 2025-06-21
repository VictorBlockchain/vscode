# 🧪 Testing Guide: Web3 AI Agent Extension

## 🚀 Quick Installation & Testing

### **Method 1: Install from Source (Recommended)**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/VictorBlockchain/vscode.git
   cd vscode
   git checkout openhands-workspace-qghcclb1
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Compile the Extension**
   ```bash
   npm run compile
   ```

4. **Open in VSCode**
   ```bash
   code .
   ```

5. **Run Extension in Development Mode**
   - Press `F5` or go to `Run > Start Debugging`
   - This opens a new VSCode window with the extension loaded
   - The extension will appear in the Activity Bar (robot icon 🤖)

### **Method 2: Package and Install**

1. **Install VSCE (VSCode Extension Manager)**
   ```bash
   npm install -g vsce
   ```

2. **Package the Extension**
   ```bash
   vsce package
   ```

3. **Install the .vsix File**
   ```bash
   code --install-extension web3-ai-agent-1.0.0.vsix
   ```

---

## 🎯 Testing the Chat Configuration System

### **Test 1: Basic Chat Interface**

1. **Open the Chat**
   - Click the robot icon 🤖 in the Activity Bar
   - Or use `Ctrl+Shift+P` → "Web3 AI Agent: Open AI Agent Chat"

2. **Verify Welcome Message**
   - Should see welcome message with configuration examples
   - Look for the "⚙️ Easy Configuration (NEW!)" section

### **Test 2: Configuration Commands**

#### **API Key Configuration**
```
Test Input: "set openai api to sk-test123"
Expected: ✅ OPENAI API key configured successfully!

Test Input: "configure deepseek api key dk-test456"
Expected: ✅ DEEPSEEK API key configured successfully!

Test Input: "claude api key is claude-test789"
Expected: ✅ CLAUDE API key configured successfully!
```

#### **Model Switching**
```
Test Input: "switch to deepseek"
Expected: ✅ Switched to **deepseek** successfully!

Test Input: "use gpt-4"
Expected: ✅ Switched to **gpt-4** successfully!

Test Input: "change to local"
Expected: ✅ Switched to **local-llm** successfully! + local LLM info
```

#### **Local LLM Configuration**
```
Test Input: "use ollama model codellama:7b"
Expected: Model configuration + connection test result

Test Input: "set local llm endpoint to http://localhost:8080"
Expected: Endpoint configuration + connection test
```

#### **Network Configuration**
```
Test Input: "set solana to mainnet"
Expected: ✅ Network configuration updated! Solana: mainnet

Test Input: "use testnet for sui"
Expected: ✅ Network configuration updated! Sui: testnet
```

#### **Help System**
```
Test Input: "help with config"
Expected: Comprehensive configuration help with examples
```

### **Test 3: Natural Language Variations**

Try these variations to test flexibility:
```
✅ "set chatgpt api to sk-xxx"
✅ "configure openai api key sk-xxx"  
✅ "openai api key is sk-xxx"
✅ "switch ollama to qwen3"
✅ "use ollama model deepseek-coder:6.7b"
✅ "solana network mainnet"
✅ "what can I configure"
```

### **Test 4: Settings Verification**

After each configuration command, verify in VSCode settings:

1. **Open Settings**
   - `Ctrl+,` or `File > Preferences > Settings`
   - Search for "web3-ai-agent"

2. **Check Configuration Values**
   - API keys should be stored securely
   - Model preferences should update
   - Network settings should change
   - Local LLM settings should persist

---

## 🔧 Advanced Testing

### **Test 5: Local LLM Integration**

#### **With Ollama Installed**
1. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ollama pull codellama:7b
   ollama serve
   ```

2. **Test Configuration**
   ```
   Chat: "use ollama model codellama:7b"
   Expected: ✅ Connection successful + privacy message
   ```

3. **Test AI Responses**
   ```
   Chat: "generate a simple React component"
   Expected: Response from local LLM (codellama:7b)
   ```

#### **Without Ollama**
```
Chat: "switch to local"
Expected: ❌ Connection failed message with setup guidance
```

### **Test 6: Terminal Monitoring**

1. **Start Terminal Monitoring**
   ```
   Command Palette: "Web3 AI Agent: Start Terminal Monitoring"
   ```

2. **Create an Error**
   ```bash
   # In VSCode terminal
   npm run nonexistent-script
   ```

3. **Verify Error Detection**
   - Should see notification about error detection
   - AI should suggest fixes automatically

### **Test 7: Task Management**

1. **Open Tasks View**
   - Check the "AI Tasks" section in the sidebar

2. **Run a Task**
   ```
   Command Palette: "Web3 AI Agent: Analyze Project Structure"
   ```

3. **Verify Progress Tracking**
   - Real-time progress updates
   - Detailed task logs
   - Performance metrics

---

## 🐛 Common Issues & Solutions

### **Issue 1: Extension Not Loading**
```
Solution:
1. Check VSCode Developer Console (Help > Toggle Developer Tools)
2. Look for error messages
3. Verify all dependencies are installed: npm install
4. Recompile: npm run compile
```

### **Issue 2: Chat Not Responding**
```
Solution:
1. Check if API keys are configured
2. Verify network connectivity
3. Check VSCode Output panel for errors
4. Try switching models: "switch to deepseek"
```

### **Issue 3: Local LLM Connection Failed**
```
Solution:
1. Verify Ollama is running: ollama serve
2. Check endpoint: "set local llm endpoint to http://localhost:11434"
3. Verify model is pulled: ollama pull codellama:7b
4. Test connection: "Web3 AI Agent: Test Local LLM Connection"
```

### **Issue 4: Configuration Not Saving**
```
Solution:
1. Check VSCode settings permissions
2. Try manual configuration in settings.json
3. Restart VSCode after configuration
4. Verify workspace vs global settings
```

---

## 📊 Testing Checklist

### **Core Functionality**
- [ ] Extension loads without errors
- [ ] Chat interface opens and displays welcome message
- [ ] Configuration commands are recognized
- [ ] Settings are updated correctly
- [ ] Help system works

### **Configuration System**
- [ ] API key configuration (OpenAI, DeepSeek, Claude)
- [ ] Model switching (cloud and local)
- [ ] Local LLM configuration
- [ ] Network configuration (Solana, Sui)
- [ ] Natural language variations work
- [ ] Error handling for invalid inputs

### **Local LLM Integration**
- [ ] Connection testing works
- [ ] Model switching works
- [ ] Endpoint configuration works
- [ ] Privacy messaging is clear
- [ ] Fallback to cloud models works

### **Advanced Features**
- [ ] Terminal monitoring detects errors
- [ ] Task management shows progress
- [ ] Project analysis works
- [ ] Code generation works
- [ ] Smart contract templates work

### **User Experience**
- [ ] Natural language understanding
- [ ] Helpful error messages
- [ ] Clear success confirmations
- [ ] Comprehensive help system
- [ ] Intuitive workflow

---

## 🎉 Success Criteria

**The extension is working correctly if:**

✅ **Chat Configuration**: All configuration commands work naturally  
✅ **Local LLM**: Can configure and test local models  
✅ **API Integration**: Cloud APIs work with proper keys  
✅ **Terminal Monitoring**: Detects and suggests fixes for errors  
✅ **Task Management**: Shows real-time progress and results  
✅ **User Experience**: Natural, intuitive, and helpful  

---

## 📝 Feedback & Bug Reports

When testing, please note:

1. **What you tested**
2. **Expected behavior**
3. **Actual behavior**
4. **Error messages (if any)**
5. **VSCode version**
6. **Operating system**

**Example Bug Report:**
```
Test: "set openai api to sk-test123"
Expected: ✅ Success message
Actual: No response in chat
Error: TypeError in console: Cannot read property 'update' of undefined
VSCode: 1.85.0
OS: Windows 11
```

---

## 🚀 Next Steps

After successful testing:

1. **Share feedback** on what works well
2. **Report any bugs** found during testing
3. **Suggest improvements** for user experience
4. **Test with real projects** for practical validation
5. **Try advanced features** like smart contract generation

**Happy testing! 🎉**

---

*This extension represents the future of AI-powered development tools. Your testing helps make it even better!*