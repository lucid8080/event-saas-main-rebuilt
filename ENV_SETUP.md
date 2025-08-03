# Environment Setup Guide

## 🚨 **Missing IDEogram API Key**

The "Failed to edit image" error is caused by a missing environment variable. Here's how to fix it:

## 📋 **Step 1: Create .env.local File**

Create a file named `.env.local` in your project root (same directory as `package.json`) with this content:

```env
# IDEogram AI API Key
# Get your API key from: https://ideogram.ai/
NEXT_PUBLIC_IDEOGRAM_API_KEY=your-ideogram-api-key-here
```

## 🔑 **Step 2: Get Your IDEogram API Key**

1. **Go to [IDEogram Dashboard](https://ideogram.ai/)**
2. **Sign in or create an account**
3. **Navigate to API Keys section**
4. **Create a new API key**
5. **Copy the API key**

## 📝 **Step 3: Update .env.local**

Replace `your-ideogram-api-key-here` with your actual API key:

```env
NEXT_PUBLIC_IDEOGRAM_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔄 **Step 4: Restart Development Server**

After creating the `.env.local` file:

1. **Stop your development server** (Ctrl+C)
2. **Restart it** with `npm run dev`
3. **Try the image editing again**

## ✅ **Step 5: Verify Setup**

1. **Open browser console** (F12)
2. **Open the image editor modal**
3. **Look for these console messages:**
   - `API Key available: true`
   - `API Key length: [some number]`

## 🐛 **If Still Not Working**

Check the browser console for detailed error messages. The improved error handling will now show:
- API key status
- Request details
- Response status and error messages

## 📞 **Need Help?**

1. Make sure the `.env.local` file is in the project root
2. Make sure you restarted the development server
3. Check that your IDEogram API key is valid
4. Look at the browser console for detailed error messages 