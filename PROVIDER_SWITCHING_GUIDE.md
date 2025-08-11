# Provider Switching System Guide

## Overview

The AI Provider Switching System allows users to dynamically select between different AI image generation providers from the UI. This system provides flexible provider management, real-time health monitoring, and seamless switching capabilities.

## ✅ **IMPLEMENTATION COMPLETE**

### **What Was Fixed**

1. **✅ Missing Ideogram Provider**: Created complete Ideogram provider implementation
2. **✅ Dynamic Provider Selection**: Built smart UI components that show only available providers
3. **✅ Real-time Status Monitoring**: Added health checks and circuit breaker protection
4. **✅ Enhanced User Experience**: Improved provider selection with status indicators and tooltips

### **New Components**

#### **1. Provider Implementations**
- **`lib/providers/ideogram-provider.ts`**: Complete Ideogram API provider implementation
- **Updated `lib/providers/index.ts`**: Integrated Ideogram provider into the factory system

#### **2. UI Components**
- **`components/dashboard/provider-selector.tsx`**: 
  - `CompactProviderSelector`: Small form factor for image generator
  - `DetailedProviderSelector`: Full details for admin interfaces
  - `ProviderSelector`: Main component with real-time status
- **`components/dashboard/provider-management.tsx`**: Complete admin interface for provider monitoring

#### **3. Updated Image Generator**
- **`components/dashboard/image-generator.tsx`**: Now uses dynamic provider selector with real-time status

## **Features**

### **🎯 Provider Selection**
- **Dynamic Provider List**: Only shows available/configured providers
- **Real-time Status**: Green/red indicators for provider health
- **Smart Tooltips**: Detailed information on hover
- **Automatic Fallback**: Switches to working provider if current one fails

### **💊 Health Monitoring**
- **Circuit Breaker Protection**: Temporarily disables failing providers
- **Response Time Tracking**: Monitors provider performance
- **Error Tracking**: Tracks failures and recovery
- **Automatic Recovery**: Re-enables providers when they recover

### **🎛️ Admin Management**
- **Provider Dashboard**: Complete overview of all providers
- **Health Status**: Real-time monitoring with detailed metrics
- **Circuit Breaker Control**: Manual reset capabilities
- **Cost Tracking**: Per-provider cost monitoring

## **Available Providers**

| Provider | Icon | Status | Features | Cost |
|----------|------|--------|----------|------|
| **Qwen-Image** | 🎯 | ✅ Working | Free, excellent text rendering | $0.02/image |
| **Stable Diffusion XL** | 🤗 | ✅ Working | Reliable, consistent quality | $0.01/image |
| **Ideogram** | 💎 | ✅ **NEW** | Premium, superior text rendering | $0.08/image |

## **Usage**

### **For Users (Image Generator)**
1. **Provider Selection**: Choose from dropdown in image generator
2. **Status Indicators**: Green = healthy, Red = issues, Gray = offline
3. **Automatic Switching**: System handles failures automatically
4. **Cost Display**: See estimated cost per generation

### **For Admins (Provider Management)**
1. **Navigate**: Go to admin dashboard > Provider Management
2. **Monitor**: View real-time status of all providers
3. **Manage**: Reset circuit breakers, view detailed metrics
4. **Test**: Use testing interface to verify provider functionality

## **Configuration**

### **Environment Variables**
```bash
# Ideogram (Premium)
NEXT_PUBLIC_IDEOGRAM_API_KEY=your_ideogram_key

# Hugging Face (Free tier available)
NEXT_PUBLIC_HUGGING_FACE_API_TOKEN=your_hf_token
```

### **Provider Priorities**
1. **Qwen**: Priority 95 (Highest - Free, excellent quality)
2. **Hugging Face**: Priority 90 (Reliable fallback)
3. **Ideogram**: Priority 100 (Premium option when available)

## **Code Integration**

### **Using in React Components**
```tsx
import { CompactProviderSelector } from "@/components/dashboard/provider-selector";

function MyComponent() {
  const [provider, setProvider] = useState<ProviderType>("qwen");
  
  return (
    <CompactProviderSelector 
      value={provider}
      onValueChange={setProvider}
    />
  );
}
```

### **Using in Actions**
```tsx
import { generateImageV2 } from "@/actions/generate-image-v2";

const result = await generateImageV2(
  prompt,
  aspectRatio,
  eventType,
  eventDetails,
  styleName,
  customStyle,
  selectedProvider, // 🎯 Provider selection
  selectedQuality
);
```

## **Technical Details**

### **Provider System Architecture**
- **Factory Pattern**: `ProviderFactory` manages all providers
- **Circuit Breaker**: Protects against failing providers
- **Health Monitoring**: Real-time status checking
- **Fallback Chain**: Automatic provider switching on failure

### **Error Handling**
- **Graceful Degradation**: Falls back to working providers
- **User Feedback**: Clear error messages and status indicators
- **Automatic Recovery**: Re-enables providers when they recover
- **Circuit Protection**: Prevents cascading failures

## **Testing**

### **Run Provider Tests**
```bash
# Test with mock data
npx tsx scripts/demo-provider-switching.ts

# Test with real environment
npx tsx scripts/test-provider-switching.ts
```

### **Expected Output**
```
🎯 Provider Switching Demo

✅ Available providers: qwen, huggingface, ideogram
✅ All providers healthy and working
✅ Dynamic UI components functional
✅ Circuit breaker protection active
```

## **Benefits**

### **For Users**
- **🎯 Choice**: Select best provider for their needs
- **💰 Cost Control**: See costs and choose free options
- **🚀 Reliability**: System automatically handles failures
- **📊 Transparency**: Real-time status and performance info

### **For Admins**
- **🔍 Monitoring**: Complete visibility into provider health
- **⚡ Performance**: Optimize costs and performance
- **🛠️ Control**: Manual override and circuit breaker management
- **📈 Analytics**: Track usage and costs across providers

### **For Developers**
- **🧩 Modularity**: Easy to add new providers
- **🔄 Flexibility**: Runtime provider switching
- **🛡️ Reliability**: Built-in error handling and recovery
- **📝 Documentation**: Complete type safety and documentation

## **Future Enhancements**

- **🎨 Stability AI**: Add Stability AI provider
- **🖼️ Midjourney**: Add Midjourney integration
- **🤖 Auto-optimization**: Automatic provider selection based on prompt type
- **📊 Usage Analytics**: Detailed usage and performance analytics
- **💾 Caching**: Smart caching across providers

## **Troubleshooting**

### **Provider Not Available**
1. Check environment variables are set
2. Verify API keys are valid
3. Check provider configuration in `lib/providers/config.ts`

### **Circuit Breaker Open**
1. Go to Provider Management dashboard
2. Click "Reset Circuit Breaker" for affected provider
3. Check provider logs for recurring issues

### **Health Check Failures**
1. Verify network connectivity
2. Check API key permissions
3. Review provider rate limits

---

## **Summary**

✅ **Ideogram AI provider is now working**  
✅ **Dynamic provider switching implemented**  
✅ **Real-time health monitoring active**  
✅ **Admin management interface complete**  
✅ **All UI components integrated and tested**  

The provider switching system provides a robust, user-friendly way to manage multiple AI providers with automatic fallback, health monitoring, and comprehensive admin controls.
