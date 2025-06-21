"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFixCommands = exports.extractErrorDetails = exports.matchErrorPattern = exports.ERROR_PATTERNS = void 0;
exports.ERROR_PATTERNS = [
    // Node.js / npm errors
    {
        pattern: /Cannot find module ['"]([^'"]+)['"]/,
        type: 'dependency',
        severity: 'high',
        autoFixable: true,
        description: 'Missing module dependency',
        commonCauses: ['Module not installed', 'Incorrect import path', 'Missing dependency in package.json'],
        suggestedFixes: ['npm install {module}', 'Check import path', 'Add to package.json dependencies']
    },
    {
        pattern: /Module not found: Error: Can't resolve ['"]([^'"]+)['"]/,
        type: 'dependency',
        severity: 'high',
        autoFixable: true,
        description: 'Webpack module resolution error',
        commonCauses: ['Missing dependency', 'Incorrect path', 'Missing file extension'],
        suggestedFixes: ['npm install {module}', 'Check file path', 'Add file extension']
    },
    {
        pattern: /ENOENT: no such file or directory, open ['"]([^'"]+)['"]/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'File not found error',
        commonCauses: ['Missing file', 'Incorrect path', 'File moved or deleted'],
        suggestedFixes: ['Create missing file', 'Check file path', 'Restore deleted file']
    },
    {
        pattern: /Port (\d+) is already in use/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'Port already in use',
        commonCauses: ['Another process using port', 'Previous process not terminated'],
        suggestedFixes: ['Kill process on port {port}', 'Use different port', 'Restart development server']
    },
    {
        pattern: /npm ERR! peer dep missing: ([^,]+)/,
        type: 'dependency',
        severity: 'medium',
        autoFixable: true,
        description: 'Missing peer dependency',
        commonCauses: ['Peer dependency not installed', 'Version mismatch'],
        suggestedFixes: ['npm install {dependency}', 'Check version compatibility']
    },
    // TypeScript errors
    {
        pattern: /Property ['"]([^'"]+)['"] does not exist on type ['"]([^'"]+)['"]/,
        type: 'compilation',
        severity: 'high',
        autoFixable: true,
        description: 'TypeScript property error',
        commonCauses: ['Typo in property name', 'Missing type definition', 'Incorrect type'],
        suggestedFixes: ['Check property spelling', 'Add type definition', 'Update type annotation']
    },
    {
        pattern: /Type ['"]([^'"]+)['"] is not assignable to type ['"]([^'"]+)['"]/,
        type: 'compilation',
        severity: 'medium',
        autoFixable: true,
        description: 'TypeScript type mismatch',
        commonCauses: ['Incorrect type annotation', 'Missing type conversion', 'Type definition mismatch'],
        suggestedFixes: ['Update type annotation', 'Add type conversion', 'Check type definitions']
    },
    {
        pattern: /Cannot find name ['"]([^'"]+)['"]/,
        type: 'compilation',
        severity: 'high',
        autoFixable: true,
        description: 'Undefined variable or function',
        commonCauses: ['Typo in variable name', 'Missing import', 'Variable not declared'],
        suggestedFixes: ['Check spelling', 'Add import statement', 'Declare variable']
    },
    // React/Next.js errors
    {
        pattern: /Warning: React\.createElement: type is invalid/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'Invalid React component type',
        commonCauses: ['Incorrect component import', 'Component not exported', 'Typo in component name'],
        suggestedFixes: ['Check component import', 'Verify component export', 'Check component name']
    },
    {
        pattern: /Error: Hydration failed because the initial UI does not match/,
        type: 'runtime',
        severity: 'high',
        autoFixable: true,
        description: 'Next.js hydration mismatch',
        commonCauses: ['Server/client rendering difference', 'Dynamic content', 'Conditional rendering'],
        suggestedFixes: ['Use useEffect for client-only code', 'Add suppressHydrationWarning', 'Check conditional rendering']
    },
    // Web3/Blockchain errors
    {
        pattern: /failed to send transaction: Transaction simulation failed/,
        type: 'deployment',
        severity: 'high',
        autoFixable: true,
        description: 'Solana transaction simulation failed',
        commonCauses: ['Insufficient funds', 'Invalid instruction', 'Account not found'],
        suggestedFixes: ['Check account balance', 'Verify instruction parameters', 'Check account existence']
    },
    {
        pattern: /Error: Account does not exist ([A-Za-z0-9]+)/,
        type: 'deployment',
        severity: 'medium',
        autoFixable: true,
        description: 'Blockchain account not found',
        commonCauses: ['Account not initialized', 'Incorrect address', 'Network mismatch'],
        suggestedFixes: ['Initialize account', 'Check address format', 'Verify network configuration']
    },
    // Build/Compilation errors
    {
        pattern: /SyntaxError: Unexpected token/,
        type: 'compilation',
        severity: 'high',
        autoFixable: true,
        description: 'JavaScript syntax error',
        commonCauses: ['Missing bracket/parenthesis', 'Invalid syntax', 'Incorrect operator'],
        suggestedFixes: ['Check syntax', 'Verify brackets/parentheses', 'Use proper operators']
    },
    {
        pattern: /ReferenceError: ([^\\s]+) is not defined/,
        type: 'runtime',
        severity: 'high',
        autoFixable: true,
        description: 'Undefined variable reference',
        commonCauses: ['Variable not declared', 'Missing import', 'Scope issue'],
        suggestedFixes: ['Declare variable', 'Add import statement', 'Check variable scope']
    },
    // Test errors
    {
        pattern: /Test suite failed to run/,
        type: 'test',
        severity: 'medium',
        autoFixable: true,
        description: 'Test suite execution failed',
        commonCauses: ['Missing test dependencies', 'Configuration error', 'Import issues'],
        suggestedFixes: ['Install test dependencies', 'Check test configuration', 'Fix import statements']
    },
    {
        pattern: /expect\(received\)\.([^(]+)\(expected\)/,
        type: 'test',
        severity: 'low',
        autoFixable: true,
        description: 'Test assertion failed',
        commonCauses: ['Incorrect expected value', 'Logic error', 'Test data issue'],
        suggestedFixes: ['Check expected value', 'Review test logic', 'Update test data']
    },
    // Security/Permission errors
    {
        pattern: /EACCES: permission denied/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'Permission denied error',
        commonCauses: ['Insufficient permissions', 'File ownership issue', 'Directory permissions'],
        suggestedFixes: ['Run with sudo (carefully)', 'Change file permissions', 'Check directory ownership']
    },
    // Network/API errors
    {
        pattern: /ECONNREFUSED/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'Connection refused',
        commonCauses: ['Service not running', 'Incorrect URL/port', 'Network issue'],
        suggestedFixes: ['Start required service', 'Check URL/port', 'Verify network connectivity']
    },
    {
        pattern: /fetch failed/,
        type: 'runtime',
        severity: 'medium',
        autoFixable: true,
        description: 'Network request failed',
        commonCauses: ['Network connectivity', 'Invalid URL', 'CORS issue'],
        suggestedFixes: ['Check network connection', 'Verify URL', 'Configure CORS']
    }
];
function matchErrorPattern(errorMessage) {
    for (const pattern of exports.ERROR_PATTERNS) {
        if (pattern.pattern.test(errorMessage)) {
            return pattern;
        }
    }
    return null;
}
exports.matchErrorPattern = matchErrorPattern;
function extractErrorDetails(errorMessage, pattern) {
    const match = errorMessage.match(pattern.pattern);
    const details = {};
    if (match) {
        // Extract common placeholders
        if (match[1])
            details.module = match[1];
        if (match[2])
            details.type = match[2];
        if (match[1] && pattern.pattern.source.includes('Port'))
            details.port = match[1];
    }
    return details;
}
exports.extractErrorDetails = extractErrorDetails;
function generateFixCommands(pattern, details) {
    const commands = [];
    switch (pattern.type) {
        case 'dependency':
            if (details.module) {
                commands.push(`npm install ${details.module}`);
                commands.push(`npm run build`);
            }
            break;
        case 'runtime':
            if (pattern.description.includes('Port') && details.port) {
                commands.push(`npx kill-port ${details.port}`);
                commands.push(`npm run dev`);
            }
            break;
        case 'compilation':
            commands.push(`npm run build`);
            break;
        case 'test':
            commands.push(`npm test`);
            break;
    }
    return commands;
}
exports.generateFixCommands = generateFixCommands;
//# sourceMappingURL=errorPatterns.js.map