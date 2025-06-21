#!/usr/bin/env node

/**
 * Simple test script to verify extension functionality
 * Run with: node test-extension.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Web3 AI Agent Extension...\n');

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
    'src/utils/taskManager.ts'
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

if (!allFilesExist) {
    console.log('\n❌ Some required files are missing!');
    process.exit(1);
}

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

// Test 6: Basic functionality test
console.log('\n🧠 Testing chat configuration parser...');
try {
    // Import the compiled module
    const { ChatConfigHandler } = require('./out/utils/chatConfigHandler.js');
    
    // Create a mock AI agent
    const mockAiAgent = {
        testLocalLLMConnection: async () => true
    };
    
    const configHandler = new ChatConfigHandler(mockAiAgent);
    
    // Test command recognition
    const testCommands = [
        'set openai api to sk-test123',
        'switch to deepseek',
        'use ollama model codellama:7b',
        'help with config'
    ];
    
    let allCommandsRecognized = true;
    testCommands.forEach(command => {
        const isRecognized = configHandler.isConfigCommand(command);
        if (isRecognized) {
            console.log(`✅ Recognized: "${command}"`);
        } else {
            console.log(`❌ Not recognized: "${command}"`);
            allCommandsRecognized = false;
        }
    });
    
    if (allCommandsRecognized) {
        console.log('✅ Chat configuration parser working correctly');
    }
    
} catch (error) {
    console.log('❌ Chat configuration test failed:');
    console.log(error.message);
    allOutputExists = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist && allCommandsExist && allSettingsExist && allOutputExists) {
    console.log('🎉 ALL TESTS PASSED! Extension is ready for testing.');
    console.log('\n📋 Next steps:');
    console.log('1. Open VSCode: code .');
    console.log('2. Press F5 to run in development mode');
    console.log('3. Test the chat configuration system');
    console.log('4. See TESTING_GUIDE.md for detailed testing instructions');
} else {
    console.log('❌ SOME TESTS FAILED! Please fix the issues above.');
    process.exit(1);
}