# 🏠 Local LLM Integration Guide

## 🌟 Overview

The Web3 AI Agent now supports **local LLM integration**, allowing you to run AI models on your own hardware for:

- **🔒 Complete Privacy**: Your code never leaves your machine
- **💰 Zero API Costs**: No per-token charges or monthly subscriptions
- **⚡ Low Latency**: Direct local communication without internet dependency
- **🎛️ Full Control**: Choose your models, parameters, and infrastructure
- **🔌 Offline Development**: Work without internet connectivity

---

## 🚀 Supported Local LLM Platforms

### 1. **Ollama** (Recommended) 🦙
**Best for**: Easy setup, great model selection, excellent performance

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull recommended models
ollama pull codellama:7b          # Code generation
ollama pull codellama:13b         # Better quality, slower
ollama pull deepseek-coder:6.7b   # Excellent for Web3/blockchain
ollama pull llama2:7b             # General purpose
ollama pull mistral:7b            # Fast and efficient

# Start Ollama server (runs on http://localhost:11434)
ollama serve
```

**Configuration:**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:11434",
  "web3-ai-agent.localLLM.apiFormat": "ollama",
  "web3-ai-agent.localLLM.model": "codellama:7b"
}
```

### 2. **LM Studio** 💻
**Best for**: User-friendly GUI, model management, Windows/Mac users

1. Download from [lmstudio.ai](https://lmstudio.ai)
2. Install and launch LM Studio
3. Download models from the built-in browser
4. Start local server (usually http://localhost:1234)

**Configuration:**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:1234",
  "web3-ai-agent.localLLM.apiFormat": "openai",
  "web3-ai-agent.localLLM.model": "codellama-7b-instruct"
}
```

### 3. **Text Generation WebUI** 🌐
**Best for**: Advanced users, extensive customization, research

```bash
# Clone and setup
git clone https://github.com/oobabooga/text-generation-webui.git
cd text-generation-webui
pip install -r requirements.txt

# Start with API enabled
python server.py --api --listen
```

**Configuration:**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:5000",
  "web3-ai-agent.localLLM.apiFormat": "textgen",
  "web3-ai-agent.localLLM.model": "codellama-7b-instruct"
}
```

### 4. **vLLM** ⚡
**Best for**: High-performance inference, production deployments

```bash
# Install vLLM
pip install vllm

# Start server
python -m vllm.entrypoints.openai.api_server \
  --model codellama/CodeLlama-7b-Instruct-hf \
  --port 8000
```

**Configuration:**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:8000",
  "web3-ai-agent.localLLM.apiFormat": "vllm",
  "web3-ai-agent.localLLM.model": "codellama/CodeLlama-7b-Instruct-hf"
}
```

### 5. **Custom Endpoints** 🔧
**Best for**: Custom implementations, specialized setups

**Configuration:**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.localLLM.endpoint": "http://localhost:8080",
  "web3-ai-agent.localLLM.apiFormat": "custom",
  "web3-ai-agent.localLLM.model": "your-custom-model"
}
```

---

## 🎯 Recommended Models for Web3 Development

### **Code Generation Models** 💻

#### **CodeLlama 7B** (Recommended for most users)
- **Size**: ~4GB RAM
- **Speed**: Fast
- **Quality**: Excellent for JavaScript/TypeScript
- **Setup**: `ollama pull codellama:7b`

#### **CodeLlama 13B** (Best quality)
- **Size**: ~8GB RAM
- **Speed**: Medium
- **Quality**: Superior code generation
- **Setup**: `ollama pull codellama:13b`

#### **DeepSeek Coder 6.7B** (Web3 Specialized)
- **Size**: ~4GB RAM
- **Speed**: Fast
- **Quality**: Excellent for blockchain development
- **Setup**: `ollama pull deepseek-coder:6.7b`

#### **Mistral 7B** (Balanced)
- **Size**: ~4GB RAM
- **Speed**: Very fast
- **Quality**: Good general purpose
- **Setup**: `ollama pull mistral:7b`

### **Specialized Models** 🎯

#### **For Solana Development**
```bash
# Use CodeLlama with Solana-specific prompts
ollama pull codellama:7b
```

#### **For Sui/Move Development**
```bash
# DeepSeek Coder works well with Move language
ollama pull deepseek-coder:6.7b
```

#### **For Smart Contract Auditing**
```bash
# Larger models for security analysis
ollama pull codellama:13b
```

---

## ⚙️ Configuration Guide

### **Quick Setup** (5 minutes)

1. **Install Ollama**:
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Pull a model**:
   ```bash
   ollama pull codellama:7b
   ```

3. **Start Ollama**:
   ```bash
   ollama serve
   ```

4. **Configure VSCode**:
   - Open Command Palette (`Ctrl+Shift+P`)
   - Run: `Web3 AI Agent: Configure Local LLM`
   - Set endpoint: `http://localhost:11434`
   - Set format: `ollama`
   - Set model: `codellama:7b`

5. **Test Connection**:
   - Run: `Web3 AI Agent: Test Local LLM Connection`
   - Should show: ✅ Local LLM connection successful!

### **Advanced Configuration**

#### **Performance Tuning**
```json
{
  "web3-ai-agent.localLLM.temperature": 0.1,     // Lower = more deterministic
  "web3-ai-agent.localLLM.maxTokens": 4096,      // Longer responses
  "web3-ai-agent.localLLM.timeout": 60000        // 60 second timeout
}
```

#### **Custom Headers** (for authentication)
```json
{
  "web3-ai-agent.localLLM.headers": {
    "X-API-Key": "your-api-key",
    "Custom-Header": "value"
  }
}
```

#### **Multiple Model Setup**
You can quickly switch between models:
1. Run: `Web3 AI Agent: List Local LLM Models`
2. Select from available models
3. Model is automatically updated in configuration

---

## 🎮 Usage Examples

### **Basic Code Generation**
```
🤖 Using Local LLM: codellama:7b

User: "Generate a Solana wallet connection component"

AI Response: [Generated using your local model]
✅ Privacy: Code never left your machine
⚡ Speed: 2.3 seconds response time
💰 Cost: $0.00
```

### **Smart Contract Development**
```
🤖 Using Local LLM: deepseek-coder:6.7b

User: "Create a Sui Move module for NFT minting"

AI Response: [Complete Move module with local processing]
✅ Specialized: Model optimized for blockchain development
🔒 Secure: No external API calls
🎯 Accurate: Trained on Web3 patterns
```

### **Terminal Error Fixing**
```
🤖 Local LLM Auto-Fix Active

❌ Error: "Cannot find module '@solana/web3.js'"
🔧 Local Analysis: Using codellama:7b
✅ Fix Applied: npm install @solana/web3.js
⏱️ Total Time: 1.2 seconds (local processing)
```

---

## 🔧 Troubleshooting

### **Connection Issues**

#### **"Local LLM connection failed"**
```bash
# Check if service is running
curl http://localhost:11434/api/tags  # For Ollama
curl http://localhost:1234/v1/models  # For LM Studio

# Restart service
ollama serve  # For Ollama
```

#### **"No models found"**
```bash
# List available models
ollama list

# Pull a model if none exist
ollama pull codellama:7b
```

### **Performance Issues**

#### **Slow Response Times**
- **Use smaller models**: Switch from 13B to 7B models
- **Increase timeout**: Set higher timeout in configuration
- **Check system resources**: Ensure sufficient RAM/CPU

#### **Out of Memory Errors**
- **Reduce model size**: Use 7B instead of 13B models
- **Close other applications**: Free up system memory
- **Use quantized models**: Look for Q4 or Q8 quantized versions

### **Quality Issues**

#### **Poor Code Generation**
- **Try different models**: DeepSeek Coder for Web3, CodeLlama for general
- **Adjust temperature**: Lower values (0.1-0.3) for more consistent code
- **Use better prompts**: The extension automatically optimizes prompts

---

## 📊 Performance Comparison

### **Model Performance** (Web3 Development)

| Model | Size | RAM | Speed | Code Quality | Web3 Knowledge |
|-------|------|-----|-------|--------------|----------------|
| CodeLlama 7B | 4GB | 8GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| CodeLlama 13B | 8GB | 16GB | ⚡⚡ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| DeepSeek Coder 6.7B | 4GB | 8GB | ⚡⚡⚡ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Mistral 7B | 4GB | 8GB | ⚡⚡⚡⚡ | ⭐⭐⭐ | ⭐⭐ |

### **Cost Comparison** (Monthly)

| Solution | Setup Cost | Monthly Cost | Privacy | Performance |
|----------|------------|--------------|---------|-------------|
| **Local LLM** | Hardware | $0 | 🔒 Complete | ⚡ Excellent |
| **OpenAI API** | $0 | $50-200 | ❌ External | ⚡⚡ Very Good |
| **DeepSeek API** | $0 | $10-50 | ❌ External | ⚡⚡ Very Good |
| **Claude API** | $0 | $100-300 | ❌ External | ⚡⚡ Excellent |

---

## 🎯 Best Practices

### **Model Selection**
- **Development**: CodeLlama 7B (fast iteration)
- **Production**: CodeLlama 13B (higher quality)
- **Web3 Specific**: DeepSeek Coder 6.7B
- **Quick Tasks**: Mistral 7B (fastest)

### **Hardware Recommendations**
- **Minimum**: 8GB RAM, 4-core CPU
- **Recommended**: 16GB RAM, 8-core CPU
- **Optimal**: 32GB RAM, 16-core CPU, GPU acceleration

### **Security Considerations**
- **Network Isolation**: Run on isolated networks for sensitive projects
- **Model Verification**: Verify model checksums before use
- **Access Control**: Restrict local server access to localhost only

### **Development Workflow**
1. **Start with local LLM** for privacy and speed
2. **Use cloud APIs** for complex tasks requiring latest models
3. **Combine approaches** based on task sensitivity and complexity

---

## 🚀 Advanced Features

### **Model Switching**
```typescript
// Automatically switch models based on task
const taskModelMap = {
  'smart-contract': 'deepseek-coder:6.7b',
  'frontend': 'codellama:7b',
  'testing': 'mistral:7b',
  'documentation': 'llama2:7b'
};
```

### **Custom Prompts**
The extension automatically optimizes prompts for local models:
- **Shorter context**: Reduces processing time
- **Specific instructions**: Better results from smaller models
- **Format optimization**: Matches model training patterns

### **Hybrid Approach**
```json
{
  "web3-ai-agent.preferredModel": "local-llm",
  "web3-ai-agent.fallbackModel": "deepseek",
  "web3-ai-agent.localLLM.fallbackOnError": true
}
```

---

## 🎉 Success Stories

### **Privacy-First Development**
> "Using local LLMs, our team can develop sensitive DeFi protocols without any code leaving our infrastructure. The CodeLlama 13B model generates excellent Solana programs."

### **Cost Optimization**
> "Switched from $200/month in API costs to a one-time $500 hardware investment. Local LLMs pay for themselves in 3 months."

### **Offline Development**
> "Working on blockchain projects in remote locations with poor internet. Local LLMs enable full AI assistance without connectivity."

---

## 🔮 Future Enhancements

### **Planned Features**
- **GPU Acceleration**: CUDA/Metal support for faster inference
- **Model Fine-tuning**: Custom training on your codebase
- **Distributed Inference**: Load balancing across multiple machines
- **Model Caching**: Intelligent model swapping based on context

### **Community Models**
- **Web3-Specific Models**: Fine-tuned for Solana/Sui development
- **Security-Focused Models**: Specialized for smart contract auditing
- **Framework-Specific Models**: Optimized for Next.js, React, etc.

---

## 📞 Support & Resources

### **Getting Help**
- **Documentation**: Check this guide and extension README
- **Community**: Join our Discord for local LLM discussions
- **Issues**: Report problems on GitHub with detailed logs

### **Useful Links**
- **Ollama**: https://ollama.ai
- **LM Studio**: https://lmstudio.ai
- **Hugging Face**: https://huggingface.co/models
- **Model Leaderboards**: https://chat.lmsys.org

---

## 🎊 Conclusion

**Local LLM integration transforms the Web3 AI Agent into a completely self-sufficient development companion!**

✅ **Complete Privacy**: Your code never leaves your machine  
✅ **Zero Ongoing Costs**: One-time hardware investment  
✅ **Offline Capability**: Work anywhere, anytime  
✅ **Full Control**: Choose models, parameters, and infrastructure  
✅ **High Performance**: Optimized for development workflows  

**Welcome to the future of private, cost-effective AI-assisted development!** 🚀

---

*Your local AI assistant is ready to revolutionize your Web3 development workflow while keeping everything private and under your control.*