# 🔧 Troubleshooting Jordi Installation

## 🚨 "I don't see Jordi in VSCode!"

### **Quick Fix Checklist:**

#### ✅ **Step 1: Verify Installation**
```bash
# Make sure you're in the right directory
cd /path/to/jordi-extension
ls -la package.json  # Should show jordi-ai-agent

# Install dependencies
npm install

# Compile the extension
npm run compile
```

#### ✅ **Step 2: Run in Development Mode**
1. **Open VSCode in the extension directory:**
   ```bash
   code .
   ```

2. **Press F5** (or go to Run > Start Debugging)
   - This opens a new VSCode window with Jordi loaded
   - Look for "Extension Development Host" in the title

3. **Look for Jordi in the Activity Bar:**
   - Should see a robot icon 🤖 on the left sidebar
   - If not visible, try View > Appearance > Activity Bar

#### ✅ **Step 3: Alternative Access Methods**

**Method 1: Command Palette**
- Press `Ctrl+Shift+P` (Windows/Linux) or `Cmd+Shift+P` (Mac)
- Type "Jordi" or "Open AI Agent Chat"
- Select the command

**Method 2: View Menu**
- Go to View > Open View...
- Search for "Jordi" or "AI Assistant"

#### ✅ **Step 4: Check Extension Status**

**In the Extension Development Host window:**
1. Press `Ctrl+Shift+P`
2. Type "Developer: Show Running Extensions"
3. Look for "jordi-ai-agent" in the list
4. Should show "Active" status

---

## 🐛 Common Issues & Solutions

### **Issue 1: Extension Not Loading**
```
Symptoms: No Jordi icon, commands not found
```

**Solution:**
```bash
# 1. Check for compilation errors
npm run compile

# 2. Check VSCode Developer Console
# In Extension Development Host: Help > Toggle Developer Tools
# Look for red errors in Console tab

# 3. Restart the extension
# Close Extension Development Host window
# Press F5 again in main VSCode window
```

### **Issue 2: TypeScript Compilation Errors**
```
Symptoms: "npm run compile" fails
```

**Solution:**
```bash
# 1. Clean and reinstall
rm -rf node_modules package-lock.json
npm install

# 2. Check TypeScript version
npx tsc --version  # Should be 4.x or higher

# 3. Manual compilation
npx tsc -p ./
```

### **Issue 3: Activity Bar Icon Missing**
```
Symptoms: Extension loads but no icon visible
```

**Solution:**
1. **Check Activity Bar visibility:**
   - View > Appearance > Activity Bar ✓

2. **Reset Activity Bar:**
   - Right-click on Activity Bar
   - Select "Reset Activity Bar"

3. **Manual icon check:**
   - Look for robot icon 🤖
   - May appear at bottom of Activity Bar

### **Issue 4: Chat Interface Not Opening**
```
Symptoms: Icon visible but clicking does nothing
```

**Solution:**
```bash
# 1. Check command registration
# Press Ctrl+Shift+P, type "Jordi"
# Should see "Jordi: Open AI Agent Chat"

# 2. Check webview provider
# Look in Developer Console for errors

# 3. Try alternative command
# Ctrl+Shift+P > "View: Show Jordi - AI Assistant"
```

---

## 🔍 Debug Mode

### **Enable Detailed Logging:**

1. **Open VSCode Settings** (`Ctrl+,`)
2. **Search for "jordi"**
3. **Enable debug options:**
   - `jordi.debug.enabled`: true
   - `jordi.debug.verbose`: true

### **Check Extension Logs:**

1. **Open Output Panel** (`Ctrl+Shift+U`)
2. **Select "Jordi - AI Assistant" from dropdown**
3. **Look for error messages or warnings**

### **Manual Extension Loading:**

```bash
# 1. Package the extension
npm run package

# 2. Install manually
code --install-extension jordi-ai-agent-1.0.0.vsix

# 3. Restart VSCode
# Close all VSCode windows
# Reopen: code .
```

---

## 🆘 Still Having Issues?

### **Collect Debug Information:**

1. **VSCode Version:**
   ```
   Help > About > Copy version info
   ```

2. **Extension Status:**
   ```
   Ctrl+Shift+P > "Developer: Show Running Extensions"
   Screenshot the list
   ```

3. **Console Errors:**
   ```
   Help > Toggle Developer Tools > Console tab
   Copy any red error messages
   ```

4. **System Information:**
   ```bash
   node --version
   npm --version
   code --version
   ```

### **Reset Everything:**

```bash
# 1. Clean slate
rm -rf node_modules out package-lock.json

# 2. Fresh install
npm install
npm run compile

# 3. Test in clean VSCode
code --disable-extensions .
# Then press F5
```

---

## ✅ Success Indicators

**Jordi is working correctly when you see:**

1. **🤖 Robot icon** in Activity Bar
2. **"Jordi - AI Assistant"** panel opens when clicked
3. **Welcome message** from Jordi in chat
4. **Commands available** in Command Palette (Ctrl+Shift+P)
5. **No errors** in Developer Console

### **Test Commands:**
```
"Hello Jordi"
"set openai api to sk-test"
"help with config"
```

---

## 🎯 Quick Success Path

**If you're in a hurry, try this:**

```bash
# 1. One-line setup
./install-jordi.sh

# 2. Open VSCode
code .

# 3. Press F5

# 4. Look for 🤖 icon

# 5. Click and chat!
```

**Expected result:** Jordi says hello and shows configuration options.

---

*Still stuck? The extension is designed to be self-sufficient, so once it's running, Jordi can help debug itself! Just ask: "Jordi, why aren't you working?" 😄*