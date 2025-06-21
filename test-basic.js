#!/usr/bin/env node

/**
 * Basic test script to verify extension structure
 * Run with: node test-basic.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Web3 AI Agent Extension Structure...\n');

// Test 1: Check if all required files exist
console.log('📁 Checking file structure...');
const requiredFiles = [
    'package.json',
    'src/extension.ts',
    'src/ai/aiAgentProvider.ts',
    'src/ai/localLLMProvider.ts',
    'src/utils/chatConfigHandler.ts',
    'src/webview/chatWebviewProvider.ts',
    'src/utils/terminalMonitor.ts',
    'src/utils/taskManager.ts',
    'TESTING_GUIDE.md',
    'CHAT_CONFIGURATION.md',
    'LOCAL_LLM_GUIDE.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allFilesExist = false;
    }
});

// Test 2: Check package.json configuration
console.log('\n📦 Checking package.json...');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

const requiredCommands = [
    'web3-ai-agent.openChat',
    'web3-ai-agent.configureLocalLLM',
    'web3-ai-agent.testLocalLLM',
    'web3-ai-agent.startTerminalMonitoring'
];

let allCommandsExist = true;
requiredCommands.forEach(command => {
    const exists = packageJson.contributes.commands.some(cmd => cmd.command === command);
    if (exists) {
        console.log(`✅ Command: ${command}`);
    } else {
        console.log(`❌ Command: ${command} - MISSING`);
        allCommandsExist = false;
    }
});

// Test 3: Check configuration settings
console.log('\n⚙️ Checking configuration settings...');
const requiredSettings = [
    'web3-ai-agent.preferredModel',
    'web3-ai-agent.localLLM.endpoint',
    'web3-ai-agent.localLLM.model',
    'web3-ai-agent.localLLM.apiFormat'
];

let allSettingsExist = true;
requiredSettings.forEach(setting => {
    const exists = packageJson.contributes.configuration.properties[setting];
    if (exists) {
        console.log(`✅ Setting: ${setting}`);
    } else {
        console.log(`❌ Setting: ${setting} - MISSING`);
        allSettingsExist = false;
    }
});

// Test 4: Check if TypeScript compiles
console.log('\n🔨 Checking TypeScript compilation...');
const { execSync } = require('child_process');

try {
    execSync('npm run compile', { stdio: 'pipe' });
    console.log('✅ TypeScript compilation successful');
} catch (error) {
    console.log('❌ TypeScript compilation failed:');
    console.log(error.stdout?.toString() || error.message);
    allCommandsExist = false;
}

// Test 5: Check if output files exist
console.log('\n📤 Checking compiled output...');
const outputFiles = [
    'out/extension.js',
    'out/ai/aiAgentProvider.js',
    'out/ai/localLLMProvider.js',
    'out/utils/chatConfigHandler.js'
];

let allOutputExists = true;
outputFiles.forEach(file => {
    if (fs.existsSync(file)) {
        console.log(`✅ ${file}`);
    } else {
        console.log(`❌ ${file} - MISSING`);
        allOutputExists = false;
    }
});

// Test 6: Check chat configuration patterns
console.log('\n🧠 Testing chat configuration patterns...');
const chatConfigFile = fs.readFileSync('src/utils/chatConfigHandler.ts', 'utf8');

const requiredPatterns = [
    'parseConfigCommand',
    'handleApiKeyConfig',
    'handleModelSwitch',
    'handleLocalLLMConfig',
    'isConfigCommand'
];

let allPatternsExist = true;
requiredPatterns.forEach(pattern => {
    if (chatConfigFile.includes(pattern)) {
        console.log(`✅ Method: ${pattern}`);
    } else {
        console.log(`❌ Method: ${pattern} - MISSING`);
        allPatternsExist = false;
    }
});

// Test 7: Check local LLM support
console.log('\n🏠 Checking local LLM integration...');
const localLLMFile = fs.readFileSync('src/ai/localLLMProvider.ts', 'utf8');

const requiredLLMFeatures = [
    'ollama',
    'openai-compatible',
    'text generation webui',
    'vllm',
    'testConnection'
];

let allLLMFeaturesExist = true;
requiredLLMFeatures.forEach(feature => {
    if (localLLMFile.toLowerCase().includes(feature.toLowerCase())) {
        console.log(`✅ LLM Feature: ${feature}`);
    } else {
        console.log(`❌ LLM Feature: ${feature} - MISSING`);
        allLLMFeaturesExist = false;
    }
});

// Test 8: Check documentation completeness
console.log('\n📚 Checking documentation...');
const docs = [
    { file: 'TESTING_GUIDE.md', content: 'Testing Guide' },
    { file: 'CHAT_CONFIGURATION.md', content: 'Chat Configuration' },
    { file: 'LOCAL_LLM_GUIDE.md', content: 'Local LLM' },
    { file: 'README.md', content: 'Local LLM Integration' }
];

let allDocsComplete = true;
docs.forEach(doc => {
    if (fs.existsSync(doc.file)) {
        const content = fs.readFileSync(doc.file, 'utf8');
        if (content.includes(doc.content)) {
            console.log(`✅ Documentation: ${doc.file}`);
        } else {
            console.log(`❌ Documentation: ${doc.file} - INCOMPLETE`);
            allDocsComplete = false;
        }
    } else {
        console.log(`❌ Documentation: ${doc.file} - MISSING`);
        allDocsComplete = false;
    }
});

// Final result
console.log('\n' + '='.repeat(60));
if (allFilesExist && allCommandsExist && allSettingsExist && allOutputExists && allPatternsExist && allLLMFeaturesExist && allDocsComplete) {
    console.log('🎉 ALL TESTS PASSED! Extension is ready for installation.');
    console.log('\n📋 Installation Instructions:');
    console.log('1. Clone: git clone https://github.com/VictorBlockchain/vscode.git');
    console.log('2. Checkout: git checkout openhands-workspace-qghcclb1');
    console.log('3. Install: npm install');
    console.log('4. Open VSCode: code .');
    console.log('5. Press F5 to run in development mode');
    console.log('6. Test chat configuration: "set openai api to sk-test"');
    console.log('\n📖 See TESTING_GUIDE.md for detailed testing instructions');
    console.log('\n🌟 Key Features to Test:');
    console.log('   • Natural language configuration');
    console.log('   • Local LLM integration (Ollama, LM Studio, etc.)');
    console.log('   • Terminal monitoring with auto-fix');
    console.log('   • Real-time task management');
    console.log('   • Web3 development tools');
} else {
    console.log('❌ SOME TESTS FAILED! Please fix the issues above.');
    process.exit(1);
}

console.log('\n🚀 Ready to revolutionize VSCode development! 🚀');