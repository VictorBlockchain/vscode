# 🍎 Jordi Installation Guide for Mac

## 🚀 Quick Start (3 Methods)

### **Method 1: Development Mode (Recommended for Testing)**

```bash
# 1. Clone and setup
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode
./install-jordi-mac.sh

# 2. Open in VSCode
code .

# 3. Launch extension (Mac-specific)
# Option A: Menu → Run → Start Debugging
# Option B: Cmd+F5 (NOT F5!)
# Option C: Cmd+Shift+P → "Debug: Start Debugging"
```

**Expected Result:** New VSCode window opens with Jordi loaded

---

### **Method 2: Install .vsix Package**

```bash
# 1. Download or build the package
# If you have the source:
cd vscode
npm run package

# 2. Install the extension
code --install-extension jordi-ai-agent-1.0.0.vsix

# 3. Restart VSCode
# Close all VSCode windows, then reopen
```

**Expected Result:** Jordi appears in all VSCode windows

---

### **Method 3: Command Palette Access**

```bash
# 1. Open any VSCode window
code .

# 2. Open Command Palette
# Cmd+Shift+P

# 3. Search for Jordi
# Type: "Jordi" or "Open AI Agent Chat"
```

---

## 🔍 Finding Jordi in VSCode

### **Look for the Robot Icon 🤖**

1. **Activity Bar (Left Sidebar)**
   - Should see robot icon at bottom of left sidebar
   - Click to open Jordi chat panel

2. **If Icon is Missing:**
   ```
   View → Appearance → Activity Bar ✓
   ```

3. **Alternative Access:**
   ```
   Cmd+Shift+P → "View: Show Jordi - AI Assistant"
   ```

---

## ✅ Success Indicators

**Jordi is working when you see:**

1. **🤖 Robot icon** in Activity Bar (left sidebar)
2. **Chat panel opens** when you click the icon
3. **Welcome message:** "Hello! I'm Jordi 🤖, your AI development assistant..."
4. **Commands available** in Command Palette (Cmd+Shift+P)

### **Test Commands:**
```
"Hello Jordi"
"set openai api to sk-test"
"help me configure"
"generate a react component"
```

---

## 🐛 Troubleshooting Mac Issues

### **Issue: F5 Opens Debug Search**
**Solution:** Use **Cmd+F5** instead, or:
- Menu: Run → Start Debugging
- Command Palette: Cmd+Shift+P → "Debug: Start Debugging"

### **Issue: No Robot Icon Visible**
```bash
# Check Activity Bar
View → Appearance → Activity Bar ✓

# Try Command Palette
Cmd+Shift+P → "Jordi"

# Check extension status
Cmd+Shift+P → "Developer: Show Running Extensions"
# Look for "jordi-ai-agent" with "Active" status
```

### **Issue: Extension Not Loading**
```bash
# 1. Check compilation
cd vscode
npm run compile

# 2. Check for errors
# In Extension Development Host window:
# Help → Toggle Developer Tools → Console tab

# 3. Restart extension
# Close Extension Development Host window
# Press Cmd+F5 again in main VSCode window
```

### **Issue: .vsix File Not Found**
```bash
# Make sure you're in the right directory
cd /path/to/vscode
ls -la jordi-ai-agent-1.0.0.vsix

# If missing, build it:
npm run package
```

---

## 🎯 Step-by-Step Mac Installation

### **Complete Setup from Scratch:**

```bash
# 1. Clone repository
git clone https://github.com/VictorBlockchain/vscode.git
cd vscode

# 2. Install dependencies
npm install

# 3. Compile TypeScript
npm run compile

# 4. Open in VSCode
code .

# 5. Launch extension (Mac way)
# Press Cmd+F5 or use Run menu

# 6. Look for 🤖 in new VSCode window

# 7. Click robot icon to open chat

# 8. Say hello to Jordi!
```

---

## 🔧 Advanced Mac Configuration

### **Keyboard Shortcuts:**
- **Launch Extension:** `Cmd+F5`
- **Command Palette:** `Cmd+Shift+P`
- **Toggle Activity Bar:** `Cmd+Shift+E` then look for 🤖
- **Developer Tools:** `Cmd+Option+I`

### **VSCode Settings for Mac:**
```json
{
  "jordi.debug.enabled": true,
  "jordi.debug.verbose": true,
  "workbench.activityBar.visible": true
}
```

### **Terminal Commands:**
```bash
# Check VSCode version
code --version

# List installed extensions
code --list-extensions | grep jordi

# Install extension manually
code --install-extension jordi-ai-agent-1.0.0.vsix

# Open with specific workspace
code /path/to/your/project
```

---

## 🆘 Still Not Working?

### **Collect Debug Info:**
```bash
# System info
sw_vers
node --version
npm --version
code --version

# Extension status
code --list-extensions | grep jordi

# Check for errors
# In VSCode: Help → Toggle Developer Tools → Console
```

### **Reset Everything:**
```bash
# Clean slate
rm -rf node_modules package-lock.json out
npm install
npm run compile

# Test in clean VSCode
code --disable-extensions .
# Then press Cmd+F5
```

---

## 🎉 Success! What's Next?

Once Jordi is running:

1. **Configure API Keys:**
   ```
   "set openai api to sk-your-key"
   "switch to deepseek"
   "use local llm ollama"
   ```

2. **Try Development Tasks:**
   ```
   "generate a nextjs component"
   "create a solana smart contract"
   "analyze my project structure"
   ```

3. **Explore Features:**
   ```
   "help with configuration"
   "show me what you can do"
   "optimize my code"
   ```

---

**🤖 Welcome to coding with Jordi! Your AI development assistant is ready to help you build amazing Next.js and Web3 applications!**