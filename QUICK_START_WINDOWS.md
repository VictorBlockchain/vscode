# 🚀 Quick Start: Jordi on Windows

## 🎯 TL;DR - Get Jordi Running in 2 Minutes

```bash
# 1. Clone and setup
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
./install-jordi.sh

# 2. Open VSCode
code .

# 3. Launch Jordi
# Press F5
# OR: Run menu → Start Debugging

# 4. Look for 🤖 robot icon in new VSCode window
# 5. Click icon → Chat with Jordi!
```

## ✅ Success Checklist

- [ ] New VSCode window opens (Extension Development Host)
- [ ] Robot icon 🤖 visible in Activity Bar (left sidebar)
- [ ] Clicking icon opens chat panel
- [ ] Jordi says: "Hello! I'm Jordi 🤖, your AI development assistant..."

## 🐛 Quick Fixes

**No robot icon?**
```
View → Appearance → Activity Bar ✓
```

**Git Bash not working?**
```bash
# Use PowerShell or Command Prompt instead
npm install
npm run compile
# Then press F5 in VSCode
```

**Extension not loading?**
```bash
npm run compile
# Then try F5 again
```

**Permission errors?**
```bash
# Run as Administrator or use:
npm install --no-optional
```

## 🎉 Test Jordi

Once running, try these commands:
```
"Hello Jordi"
"set openai api to sk-test"
"help me configure"
"generate a react component"
```

## 🔧 Alternative Installation Methods

### Method 1: Pre-built Extension
1. Download `jordi-ai-agent-1.0.0.vsix`
2. Open VS Code
3. `Ctrl+Shift+P` → "Extensions: Install from VSIX"
4. Select the `.vsix` file
5. Restart VS Code

### Method 2: Command Line
```bash
# Install globally
npm install -g vsce

# Package extension
npm run package

# Install extension
code --install-extension jordi-ai-agent-1.0.0.vsix
```

## 🖥️ Windows-Specific Tips

**Using WSL (Windows Subsystem for Linux)?**
```bash
# Install in WSL
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
npm install && npm run compile

# Open with VS Code
code .
```

**Using PowerShell?**
```powershell
# Clone repository
git clone https://github.com/VictorBlockchain/vscode.git
Set-Location vscode

# Install and compile
npm install
npm run compile

# Open VS Code
code .
```

**Using Command Prompt?**
```cmd
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
npm install
npm run compile
code .
```

## 🚨 Common Windows Issues

**Node.js not found?**
- Install Node.js from [nodejs.org](https://nodejs.org/)
- Restart terminal after installation

**Git not found?**
- Install Git from [git-scm.com](https://git-scm.com/)
- Or use GitHub Desktop

**VS Code not opening?**
- Install VS Code from [code.visualstudio.com](https://code.visualstudio.com/)
- Add VS Code to PATH during installation

**npm permission errors?**
```bash
# Run as Administrator or use:
npm config set prefix %APPDATA%\npm
```

---

**Need more help?** See `TROUBLESHOOTING.md` for detailed instructions.

**🤖 Happy coding with Jordi!**