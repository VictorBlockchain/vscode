# 🧠 Jordi's Memory System

Jordi AI Agent features a sophisticated memory system that allows it to remember important information across sessions, providing personalized and contextual assistance.

## 🎯 Overview

The memory system automatically stores and retrieves:
- **API configurations** you set
- **Tasks** completed together
- **Project context** (framework, language, dependencies)
- **User preferences** and working style
- **Important insights** and learnings
- **Manual notes** you add

## 📁 Storage

Memory is stored per-project in `.vscode/jordi-memory.json` with the following structure:

```json
{
  "memories": [
    {
      "id": "unique-id",
      "title": "Memory Title",
      "content": "Memory content",
      "category": "project|user_preference|configuration|task_context|learning|important",
      "priority": "low|medium|high|critical",
      "timestamp": "2024-01-01T00:00:00.000Z",
      "tags": ["tag1", "tag2"],
      "metadata": {}
    }
  ]
}
```

## 🎮 Commands

### Command Palette Commands

- **Jordi: Show Memory Notepad** - Display all memories in a webview
- **Jordi: Search Memory** - Search for specific memories
- **Jordi: Clear Memory** - Reset all memories (with confirmation)

### Chat Commands

You can interact with memory directly through chat using natural language:

#### View Memory
```
show my memory
view my notes
what do you remember
```

#### Search Memory
```
search memory for API keys
find notes about React
search for user preferences
```

#### Add to Memory
```
remember that I prefer TypeScript
note that this project uses Next.js
add to memory: user likes dark theme
```

#### Manage Memory
```
clear my memory
forget API configuration
memory help
```

## 🏷️ Memory Categories

### `project`
- Framework and language information
- Project structure insights
- Dependencies and configurations

### `user_preference`
- Preferred coding style
- Favorite tools and libraries
- Working patterns

### `configuration`
- API keys and endpoints
- Model preferences
- Extension settings

### `task_context`
- Completed tasks and their outcomes
- Current work context
- Progress tracking

### `learning`
- Insights gained during development
- Problem-solving patterns
- Best practices discovered

### `important`
- Critical information
- Manual notes
- Key decisions

## 🎯 Priority Levels

- **🔴 Critical** - Essential information that should always be considered
- **🟡 High** - Important information that frequently affects decisions
- **🔵 Medium** - Useful information that occasionally affects decisions
- **⚪ Low** - Background information for context

## 🤖 Automatic Memory

Jordi automatically remembers:

### API Configurations
When you set API keys through chat:
```
set openai api key to sk-...
use deepseek
configure claude api key abc123
```

### Task Completions
When tasks are completed:
- Component generation
- Code optimization
- Security audits
- Smart contract deployment

### Project Context
When analyzing projects:
- Framework detection (Next.js, React, etc.)
- Language preferences (TypeScript, JavaScript)
- Dependencies and tools

### User Preferences
When you express preferences:
- Coding style choices
- Tool preferences
- Working patterns

## 🔍 Memory Context in Responses

Before generating any response, Jordi:

1. **Retrieves relevant memories** based on the current context
2. **Builds enhanced system prompt** with memory context
3. **Considers past preferences** and configurations
4. **Maintains consistency** with previous work
5. **Learns from interactions** and updates memory

## 💡 Best Practices

### For Users

1. **Be explicit about preferences**: "I prefer TypeScript over JavaScript"
2. **Add important project notes**: "remember this is a DeFi project for Solana"
3. **Review memory periodically**: Use "show my memory" to see what's stored
4. **Search before asking**: Use "search memory for X" to find existing information

### For Developers

1. **Use appropriate categories** when storing memories
2. **Set proper priorities** based on importance
3. **Add relevant tags** for better searchability
4. **Include metadata** for additional context

## 🔧 Technical Implementation

### MemoryManager Class

```typescript
class MemoryManager {
    // Core methods
    addMemory(memory: Memory): void
    getMemoryContext(): string
    searchMemory(query: string): Memory[]
    clearMemory(): void
    
    // Helper methods
    rememberApiKey(provider: string): void
    rememberTask(type: string, details: string): void
    rememberImportantNote(title: string, content: string, tags?: string[]): void
    updateUserPreference(key: string, value: any): void
    updateProjectContext(key: string, value: any): void
}
```

### Integration Points

1. **AIAgentProvider**: Checks memory before generating responses
2. **ChatConfigHandler**: Processes memory commands from chat
3. **Extension Commands**: Provides UI for memory management
4. **Task Completion**: Automatically stores task outcomes

## 🚀 Future Enhancements

- **Memory sharing** between projects
- **Memory export/import** functionality
- **Advanced search** with filters and sorting
- **Memory analytics** and insights
- **Collaborative memory** for team projects
- **Memory backup** and sync

## 🛠️ Troubleshooting

### Memory Not Saving
- Check if `.vscode` directory exists and is writable
- Verify file permissions for `jordi-memory.json`
- Look for error messages in VS Code output

### Memory Not Loading
- Ensure `jordi-memory.json` is valid JSON
- Check for file corruption
- Try clearing memory and starting fresh

### Search Not Working
- Verify search query is not empty
- Check if memories contain searchable content
- Try broader search terms

### Performance Issues
- Large memory files may slow down responses
- Consider clearing old, irrelevant memories
- Use specific searches instead of viewing all memory

## 📞 Support

If you encounter issues with the memory system:

1. Check the **Output** panel in VS Code for error messages
2. Try **clearing memory** and starting fresh
3. Report issues on the [GitHub repository](https://github.com/VictorBlockchain/vscode)
4. Include memory file contents (remove sensitive data) when reporting bugs

---

*The memory system makes Jordi more than just an AI assistant - it becomes your personalized development companion that learns and grows with you!* 🤖✨