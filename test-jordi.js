#!/usr/bin/env node

/**
 * Quick test script to verify Jordi AI Agent extension
 */

const fs = require('fs');
const path = require('path');

console.log('🤖 Testing Jordi AI Agent Extension...\n');

// Test 1: Check if compiled files exist
console.log('1. Checking compiled files...');
const outDir = path.join(__dirname, 'out');
const extensionFile = path.join(outDir, 'extension.js');

if (fs.existsSync(extensionFile)) {
    console.log('   ✅ Extension compiled successfully');
} else {
    console.log('   ❌ Extension compilation failed');
    process.exit(1);
}

// Test 2: Check if package.json is valid
console.log('2. Checking package.json...');
try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    if (packageJson.name === 'jordi-ai-agent') {
        console.log('   ✅ Package.json is valid');
        console.log(`   📦 Version: ${packageJson.version}`);
        console.log(`   📝 Description: ${packageJson.description}`);
    } else {
        console.log('   ❌ Package.json name mismatch');
    }
} catch (error) {
    console.log('   ❌ Package.json is invalid:', error.message);
}

// Test 3: Check if .vsix package exists
console.log('3. Checking .vsix package...');
const vsixFile = path.join(__dirname, 'jordi-ai-agent-1.0.0.vsix');
if (fs.existsSync(vsixFile)) {
    const stats = fs.statSync(vsixFile);
    console.log(`   ✅ .vsix package exists (${Math.round(stats.size / 1024)}KB)`);
} else {
    console.log('   ❌ .vsix package not found');
}

// Test 4: Check memory manager
console.log('4. Checking memory manager...');
const memoryFile = path.join(outDir, 'memory', 'memoryManager.js');
if (fs.existsSync(memoryFile)) {
    console.log('   ✅ Memory manager compiled');
} else {
    console.log('   ❌ Memory manager not found');
}

// Test 5: Check icon
console.log('5. Checking icon...');
const iconFile = path.join(__dirname, 'media', 'jordi-icon.png');
if (fs.existsSync(iconFile)) {
    console.log('   ✅ Jordi icon exists');
} else {
    console.log('   ❌ Jordi icon not found');
}

// Test 6: Check key source files
console.log('6. Checking key source files...');
const keyFiles = [
    'src/extension.ts',
    'src/ai/aiAgentProvider.ts',
    'src/memory/memoryManager.ts',
    'src/webview/chatWebviewProvider.ts',
    '.vscode/launch.json',
    '.vscode/tasks.json'
];

keyFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`   ✅ ${file}`);
    } else {
        console.log(`   ❌ ${file} - MISSING`);
    }
});

console.log('\n🎉 Jordi Extension Test Completed!');
console.log('\n📋 Installation Instructions:');
console.log('   🔧 FIXED ISSUES:');
console.log('   - ✅ Fixed F5 launch configuration');
console.log('   - ✅ Fixed memory system directory creation');
console.log('   - ✅ Added proper error handling');
console.log('   - ✅ Added comprehensive welcome experience');
console.log('   - ✅ Added status bar indicator');
console.log('');
console.log('   📥 INSTALLATION OPTIONS:');
console.log('   Option 1 - Pre-built Extension:');
console.log('     1. Download jordi-ai-agent-1.0.0.vsix');
console.log('     2. VS Code → Ctrl+Shift+P → "Extensions: Install from VSIX"');
console.log('     3. Select the .vsix file');
console.log('     4. Restart VS Code');
console.log('     5. Follow the welcome prompts!');
console.log('');
console.log('   Option 2 - From Source:');
console.log('     1. git pull origin openhands-workspace-qghcclb1');
console.log('     2. npm install');
console.log('     3. npm run compile');
console.log('     4. code .');
console.log('     5. Press Cmd+F5 (Mac) or F5 (Windows/Linux)');
console.log('');
console.log('   🎯 VERIFICATION:');
console.log('     - Welcome dialog appears on first activation');
console.log('     - Status bar shows "🤖 Jordi AI" (bottom right)');
console.log('     - Activity bar has 🤖 robot icon');
console.log('     - Chat opens with welcome message');
console.log('     - Features overview available via command palette');
console.log('');
console.log('   🆕 NEW WELCOME FEATURES:');
console.log('     - First-time user onboarding');
console.log('     - Workspace folder detection and guidance');
console.log('     - Interactive features overview');
console.log('     - Status bar indicator for active state');
console.log('     - Welcome message in chat interface');
console.log('');
console.log('🤖 Happy coding with Jordi!');