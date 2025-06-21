#!/bin/bash

echo "🤖 Installing Jordi - AI Development Assistant (Mac)"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the extension directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Compile TypeScript
echo "🔨 Compiling TypeScript..."
npm run compile

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
else
    echo "❌ Compilation failed!"
    exit 1
fi

echo ""
echo "🎉 Jordi is ready to test!"
echo ""
echo "📋 Mac-Specific Instructions:"
echo ""
echo "🚀 Method 1: Development Mode (Recommended)"
echo "1. Open VSCode: code ."
echo "2. Go to Run menu → Start Debugging"
echo "3. OR press Cmd+F5 (not F5!)"
echo "4. OR use Command Palette: Cmd+Shift+P → 'Debug: Start Debugging'"
echo "5. Look for Jordi icon 🤖 in the new VSCode window"
echo ""
echo "📦 Method 2: Package and Install"
echo "1. Install VSCE: npm install -g vsce"
echo "2. Package: npm run package"
echo "3. Install: code --install-extension jordi-ai-agent-1.0.0.vsix"
echo "4. Restart VSCode"
echo ""
echo "🔧 Method 3: Command Palette Access"
echo "1. Open VSCode: code ."
echo "2. Press Cmd+Shift+P"
echo "3. Type 'Jordi' or 'Open AI Agent Chat'"
echo "4. Select the command"
echo ""
echo "❓ Troubleshooting:"
echo "- If no Jordi icon appears, check View → Appearance → Activity Bar"
echo "- Try Cmd+Shift+P → 'View: Show Jordi - AI Assistant'"
echo "- See TROUBLESHOOTING.md for detailed help"
echo ""
echo "🚀 Happy coding with Jordi! 🚀"