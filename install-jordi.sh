#!/bin/bash

echo "🤖 Installing Jordi - AI Development Assistant"
echo "=============================================="

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
echo "🎉 Jordi is ready to install!"
echo ""
echo "📋 Next Steps:"
echo "1. Open VSCode: code ."
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "2. Press Cmd+F5 (Mac) or Run → Start Debugging"
else
    echo "2. Press F5 to run Jordi in development mode"
fi
echo "3. Look for the Jordi icon 🤖 in the Activity Bar"
echo "4. Click the icon to open the chat interface"
echo "5. Try: 'Hello Jordi' or 'set openai api to sk-test'"
echo ""
echo "🔧 Alternative Installation:"
echo "1. Package extension: npm run package"
echo "2. Install .vsix file: code --install-extension jordi-ai-agent-1.0.0.vsix"
echo ""
if [[ "$OSTYPE" == "darwin"* ]]; then
    echo "📖 Mac users: See MAC_INSTALL_GUIDE.md for detailed instructions"
else
    echo "📖 For detailed testing instructions, see TESTING_GUIDE.md"
fi
echo ""
echo "🚀 Happy coding with Jordi! 🚀"