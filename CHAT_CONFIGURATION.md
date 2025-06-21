# 💬 Chat Configuration Guide

## 🌟 Overview

The Web3 AI Agent now supports **natural language configuration** through the chat interface! No more navigating through settings menus or command palettes - just chat naturally to configure everything.

---

## 🎯 Quick Examples

### **API Key Configuration**
```
User: "set openai api to sk-proj-abc123..."
🤖: ✅ OPENAI API key configured successfully! ✅ API key format looks valid.

You can now use "openai" by saying "switch to openai" or "use openai".
```

```
User: "configure deepseek api key dk-abc123..."
🤖: ✅ DEEPSEEK API key configured successfully!

You can now use "deepseek" by saying "switch to deepseek" or "use deepseek".
```

### **Model Switching**
```
User: "switch to deepseek"
🤖: ✅ Switched to **deepseek** successfully!
```

```
User: "use local llm"
🤖: ✅ Switched to **local-llm** successfully!

🏠 Local LLM Configuration:
• Endpoint: http://localhost:11434
• Model: codellama:7b

To change the local model, say: "use ollama model codellama:13b"
To change the endpoint, say: "set local llm endpoint to http://localhost:8080"
✅ Local LLM connection successful!
```

### **Local LLM Configuration**
```
User: "use ollama model qwen3"
🤖: ✅ Ollama model set to **qwen3** and connection successful!

Now using local LLM for all AI operations. Your code stays private! 🔒
```

```
User: "switch ollama to deepseek-coder:6.7b"
🤖: ✅ Ollama model set to **deepseek-coder:6.7b** and connection successful!

Now using local LLM for all AI operations. Your code stays private! 🔒
```

### **Network Configuration**
```
User: "set solana to mainnet"
🤖: ✅ Network configuration updated!

Solana: mainnet
```

```
User: "use testnet for sui"
🤖: ✅ Network configuration updated!

Sui: testnet
```

---

## 🛠️ Complete Configuration Commands

### **🔑 API Key Configuration**

#### **OpenAI/ChatGPT**
- `"set openai api to sk-xxx"`
- `"set chatgpt api key to sk-xxx"`
- `"configure gpt api key sk-xxx"`
- `"openai api key is sk-xxx"`

#### **DeepSeek**
- `"set deepseek api to dk-xxx"`
- `"configure deepseek api key dk-xxx"`
- `"deepseek api key is dk-xxx"`

#### **Claude/Anthropic**
- `"set claude api to claude-xxx"`
- `"configure anthropic api key claude-xxx"`
- `"claude api key is claude-xxx"`

### **🔄 Model Switching**

#### **Switch to Cloud Models**
- `"switch to deepseek"`
- `"use gpt-4"`
- `"change to claude"`
- `"prefer deepseek"`

#### **Switch to Local LLM**
- `"switch to local"`
- `"use local llm"`
- `"change to ollama"`
- `"prefer local"`

### **🏠 Local LLM Configuration**

#### **Change Ollama Model**
- `"use ollama model codellama:7b"`
- `"switch ollama to qwen3"`
- `"change ollama model to deepseek-coder:6.7b"`
- `"ollama model mistral:7b"`

#### **Change Endpoint**
- `"set local llm endpoint to http://localhost:8080"`
- `"configure local endpoint to localhost:1234"`
- `"local llm endpoint is http://192.168.1.100:11434"`

### **🌐 Network Configuration**

#### **Solana Networks**
- `"set solana to mainnet"`
- `"use devnet for solana"`
- `"solana network to testnet"`
- `"configure solana mainnet"`

#### **Sui Networks**
- `"set sui to testnet"`
- `"use mainnet for sui"`
- `"sui network to devnet"`
- `"configure sui testnet"`

#### **Both Networks**
- `"switch to devnet"` (sets both)
- `"use testnet"` (sets both)
- `"set both to mainnet"`

---

## 🎮 Interactive Examples

### **Complete Setup Workflow**

#### **1. First Time Setup**
```
User: "help with config"

🤖: 🛠️ Configuration Help

**API Keys:**
• "set openai api key to sk-xxx" - Configure OpenAI API
• "set deepseek api to xxx" - Configure DeepSeek API  
• "configure claude api key xxx" - Configure Claude API

**Model Switching:**
• "switch to deepseek" - Use DeepSeek for AI operations
• "use gpt-4" - Switch to GPT-4
• "change to local" - Use local LLM (private & free!)

**Local LLM (Ollama):**
• "use ollama model codellama:7b" - Switch Ollama model
• "switch ollama to deepseek-coder:6.7b" - Change to different model
• "set local llm endpoint to http://localhost:8080" - Change endpoint

**Networks:**
• "set solana to mainnet" - Configure Solana network
• "use testnet for sui" - Configure Sui network
• "switch to devnet" - Set both networks to devnet

**Examples:**
• "switch ollama to qwen3" ✅
• "set chatgpt api to 4808045" ✅  
• "use deepseek" ✅
• "configure local endpoint to localhost:8080" ✅

Just type naturally - I understand many variations! 🤖
```

#### **2. Configure API Key**
```
User: "set chatgpt api to sk-proj-4808045abc123def456..."

🤖: ✅ OPENAI API key configured successfully! ✅ API key format looks valid.

You can now use "openai" by saying "switch to openai" or "use openai".
```

#### **3. Switch Models**
```
User: "use gpt-4"

🤖: ✅ Switched to **gpt-4** successfully!
```

#### **4. Try Local LLM**
```
User: "switch to local"

🤖: ✅ Switched to **local-llm** successfully!

🏠 Local LLM Configuration:
• Endpoint: http://localhost:11434
• Model: codellama:7b

To change the local model, say: "use ollama model codellama:13b"
To change the endpoint, say: "set local llm endpoint to http://localhost:8080"
❌ Local LLM connection failed. Please check your configuration.
```

#### **5. Configure Local LLM**
```
User: "use ollama model qwen3"

🤖: ⚠️ Ollama model set to **qwen3** but connection failed.

Make sure the model is pulled: `ollama pull qwen3`
```

#### **6. After Installing Ollama**
```
User: "use ollama model codellama:7b"

🤖: ✅ Ollama model set to **codellama:7b** and connection successful!

Now using local LLM for all AI operations. Your code stays private! 🔒
```

---

## 🎯 Natural Language Understanding

The chat configuration system understands many natural variations:

### **Flexible Phrasing**
```
✅ "set openai api to sk-xxx"
✅ "configure openai api key sk-xxx"  
✅ "openai api key is sk-xxx"
✅ "set chatgpt api key to sk-xxx"
✅ "gpt api sk-xxx"
```

### **Model Names**
```
✅ "switch to deepseek"
✅ "use deepseek"
✅ "change to deepseek"
✅ "prefer deepseek"
✅ "default to deepseek"
```

### **Local LLM Variations**
```
✅ "use ollama model qwen3"
✅ "switch ollama to qwen3"
✅ "change ollama model to qwen3"
✅ "ollama qwen3"
✅ "set ollama qwen3"
```

### **Network Flexibility**
```
✅ "set solana to mainnet"
✅ "use mainnet for solana"
✅ "solana network mainnet"
✅ "configure solana mainnet"
✅ "switch solana to mainnet"
```

---

## 🔧 Advanced Configuration

### **Custom Endpoints**
```
User: "set local llm endpoint to http://192.168.1.100:8080"

🤖: ✅ Local LLM endpoint set to **http://192.168.1.100:8080** and connection successful!
```

### **Multiple Model Setup**
```
User: "switch ollama to deepseek-coder:6.7b"
🤖: ✅ Ollama model set to **deepseek-coder:6.7b** and connection successful!

User: "use gpt-4"  
🤖: ✅ Switched to **gpt-4** successfully!

User: "back to local"
🤖: ✅ Switched to **local-llm** successfully! (using deepseek-coder:6.7b)
```

### **Network Management**
```
User: "set both networks to testnet"
🤖: ✅ Network configuration updated!

Solana: testnet
Sui: testnet

User: "solana to mainnet"
🤖: ✅ Network configuration updated!

Solana: mainnet
```

---

## 🎊 Benefits of Chat Configuration

### **🚀 Speed & Convenience**
- **No Menu Navigation**: Configure everything through natural chat
- **Instant Feedback**: Immediate confirmation and testing
- **Context Aware**: Understands your intent from natural language

### **🧠 Intelligent Understanding**
- **Flexible Phrasing**: Many ways to say the same thing
- **Auto-Correction**: Handles typos and variations
- **Smart Defaults**: Sensible configuration choices

### **🔒 Privacy & Security**
- **Local LLM Support**: Complete privacy with local models
- **Secure Storage**: API keys stored securely in VSCode settings
- **Connection Testing**: Automatic validation of configurations

### **📚 Learning & Help**
- **Built-in Help**: "help with config" shows all options
- **Examples**: Clear examples for every configuration type
- **Guidance**: Step-by-step assistance for complex setups

---

## 🎯 Real-World Scenarios

### **Scenario 1: Privacy-Conscious Developer**
```
User: "I want to use local AI for privacy"

🤖: Great choice for privacy! Let me help you set up local LLM.

First, install Ollama:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
ollama pull codellama:7b
ollama serve
```

Then say: "use ollama model codellama:7b"

User: "use ollama model codellama:7b"

🤖: ✅ Ollama model set to **codellama:7b** and connection successful!

Now using local LLM for all AI operations. Your code stays private! 🔒
```

### **Scenario 2: Cost-Conscious Developer**
```
User: "what's the cheapest option?"

🤖: For cost-effectiveness, I recommend:

1. **Free**: Local LLM (Ollama) - $0/month, complete privacy
2. **Cheap**: DeepSeek API - ~$10-20/month, excellent quality
3. **Premium**: GPT-4 - $50-200/month, best quality

Want to try DeepSeek? Say: "set deepseek api to your-key"
Or go free with: "switch to local"

User: "switch to local"

🤖: ✅ Switched to **local-llm** successfully!
[Local LLM setup guidance...]
```

### **Scenario 3: Team Development**
```
User: "set up for team development"

🤖: For team development, I recommend:

1. **Shared API**: Use DeepSeek or GPT-4 with shared billing
2. **Network Config**: Set to testnet for safe development
3. **Consistent Models**: Everyone uses the same model

Let's configure:

User: "set deepseek api to dk-team-key-123"
🤖: ✅ DEEPSEEK API key configured successfully!

User: "set both networks to testnet"  
🤖: ✅ Network configuration updated!
Solana: testnet
Sui: testnet

User: "use deepseek"
🤖: ✅ Switched to **deepseek** successfully!
```

---

## 🔮 Future Enhancements

### **Planned Features**
- **Voice Configuration**: "Hey AI, switch to local LLM"
- **Smart Suggestions**: AI recommends optimal configurations
- **Team Sync**: Share configurations across team members
- **Configuration Profiles**: Save and switch between setups

### **Advanced Commands**
- **Conditional Logic**: "use local if available, otherwise deepseek"
- **Performance Tuning**: "optimize for speed" or "optimize for quality"
- **Cost Management**: "use cheapest option" or "stay under $50/month"

---

## 🎉 Summary

**Chat configuration makes the Web3 AI Agent incredibly user-friendly!**

✅ **Natural Language**: Configure everything through normal conversation  
✅ **Instant Feedback**: Immediate confirmation and testing  
✅ **Flexible Understanding**: Many ways to express the same intent  
✅ **Complete Coverage**: API keys, models, networks, and local LLM  
✅ **Built-in Help**: Always available guidance and examples  
✅ **Privacy Options**: Full support for local, private AI models  

**No more settings menus - just chat naturally to configure everything!** 🚀

---

*Your AI assistant understands you perfectly and makes configuration effortless. Welcome to the future of user-friendly development tools!*