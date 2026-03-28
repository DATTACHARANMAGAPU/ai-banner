# AI Banner Generator - Server Setup Guide

## 📋 Overview

This banner generator now supports **AI-powered image generation**! Instead of just procedural canvas drawing, it can generate realistic, beautiful banner images using AI models.

## 🚀 Quick Start

### Step 1: Install Backend Dependencies

```bash
cd "c:\Users\magap\OneDrive\Desktop(1)\banner"
npm install
```

This installs:
- `express` - Web server
- `cors` - Cross-origin requests
- `dotenv` - Environment variable management
- `axios` - API requests
- `express-rate-limit` - Rate limiting

### Step 2: Get a Free API Key

Choose one of these services (both have free tier options):

#### Option A: Hugging Face (Recommended - Easiest)
1. Go to https://huggingface.co/join
2. Create a free account
3. Visit https://huggingface.co/settings/tokens
4. Click "New token"
5. Copy your token

#### Option B: Fal.ai (Faster image generation)
1. Go to https://fal.run
2. Sign up for free
3. Get your API key from the dashboard

### Step 3: Configure Environment

1. Open `.env` file in the banner folder
2. Replace the placeholder with your actual API key:

```env
# For Hugging Face:
HUGGINGFACE_API_KEY=hf_xxxxxxxxxxxxxxxxxxxxx

# OR for Fal.ai:
FAL_API_KEY=xxx_xxxxxxxxxxxxxxxx
```

3. Save the file

### Step 4: Start the Backend Server

```bash
npm start
```

You should see:
```
✅ Server: http://localhost:5000
📝 Image Generation: /api/generate-banner
🏥 Health Check: /api/health
```

### Step 5: Use the App

1. Open `http://localhost:5000` in your browser
2. Enter a theme prompt (e.g., "Diwali festival with golden lamps")
3. Click "Generate Banner"
4. The AI will generate a realistic image! 🎉

## 🎨 How It Works

### Image Generation Flow
1. **User enters prompt** → "Diwali festival with golden lamps"
2. **App detects theme** → "diwali"
3. **Prompt gets enhanced** → Adds detailed descriptors from theme templates
4. **AI generates image** → Uses Hugging Face Stable Diffusion or Fal.ai Flux
5. **Image displayed** → Shows in banner preview

### Theme-Specific Enhancements

Each theme has predefined enhancements that make AI images more accurate:

- **Diwali**: "golden oil lamps, fireworks, rangoli patterns, festive Indian celebration"
- **Christmas**: "Christmas tree, falling snow, colorful ornaments, warm cozy lighting"
- **Wedding**: "elegant flowers, romantic decorations, bride/groom, elegant atmosphere"
- **Beach**: "ocean waves, sandy beach, palm trees, tropical paradise, sunny day"
- And many more...

## 🔧 API Endpoints

### Generate Banner
```
POST /api/generate-banner
```

**Request:**
```json
{
  "prompt": "Diwali festival celebration 2026",
  "theme": "diwali"
}
```

**Response (Success):**
```json
{
  "success": true,
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJ...",
  "theme": "diwali",
  "promptUsed": "Diwali festival celebration 2026. Beautiful Diwali festival scene..."
}
```

**Response (No API Key):**
```json
{
  "error": "AI image generation not configured. Please set API key in .env file.",
  "info": "Get free API key from: https://huggingface.co/settings/tokens"
}
```

### Health Check
```
GET /api/health
```

Response: `{ "status": "Server is running", "timestamp": "..." }`

## 📊 Supported Themes

The app automatically detects and enhances these themes:

**Festivals**: Diwali, Christmas, New Year, Easter, Halloween, Valentine
**Life Events**: Birthday, Wedding, Graduation, Baby Shower
**Nature**: Beach, Mountain, Forest, Garden
**Professional**: Coffee, Tech, Gaming, Music, Sports, Fitness, Business, Fashion

## ⚠️ Troubleshooting

### "AI image generation not configured"
- Confirm you added the API key to `.env`
- Restart the server after adding the key
- Check that the key is correct (copy from API provider)

### Blank image generated
- The API key might be invalid
- Try using a different service (Hugging Face vs Fal.ai)
- Check internet connection

### Server won't start
```bash
# Kill any existing process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Then restart
npm start
```

### Slow image generation
- First generation might take 30-60 seconds
- Set a longer timeout in the browser (currently 60 seconds)
- Consider using Fal.ai instead (faster)

## 🎯 Best Practices

1. **Use descriptive prompts**: "Diwali with golden lamps and fireworks" works better than just "Diwali"
2. **Include dates/years**: "Christmas 2026" or "New Year 2026" specificity helps
3. **Add descriptive words**: "festive", "elegant", "celebration", etc.
4. **Let the AI enhance**: The system automatically adds quality descriptors

## 🔒 Security Notes

- **API Keys are private**: Never share your API key publicly
- **Use environment variables**: The `.env` file is in `.gitignore` (not uploaded to version control)
- **Rate limiting enabled**: Max 100 requests per 15 minutes per IP
- **CORS enabled**: Only accepts requests from same domain

## 📝 Example Prompts

Try these for beautiful results:

- "Diwali 29th March 2026 festival with golden lamps and fireworks celebration"
- "Christmas tree snowfall festive lights warm cozy home"
- "Wedding ceremony elegant flowers romantic roses decoration"
- "Summer beach vacation ocean waves palm trees tropical paradise"
- "Tech conference innovation future technology modern"

## 🆘 Support

### Get Help with API Keys
- **Hugging Face Support**: https://huggingface.co/docs/hub/security-tokens
- **Fal.ai Support**: https://fal.run/docs
- **OpenAI DALL-E**: https://openai.com/docs/guides/images

### Check API Status
- Hugging Face: https://status.huggingface.co
- Fal.ai: https://status.fal.run

## 📦 Next Steps

1. ✅ Install dependencies (`npm install`)
2. ✅ Get API key from Hugging Face or Fal.ai
3. ✅ Add key to `.env` file
4. ✅ Run server (`npm start`)
5. ✅ Open app and test banner generation
6. ✅ Enjoy AI-generated banners! 🎨

---

**Version**: 1.0.0  
**Last Updated**: March 27, 2026
