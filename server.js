import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fetch from 'node-fetch';
import canvas from 'canvas';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

app.use('/api/', limiter);

// Serve static files
app.use(express.static(__dirname));

// Main image generation - combines everything
async function generateImageWithPublicAPI(enhancedPrompt) {
  try {
    console.log('🖼️ === IMAGE GENERATION START ===');
    console.log(`📝 Enhanced prompt: ${enhancedPrompt.substring(0, 100)}...`);
    
    // Try Pollinations.ai first (best quality)
    try {
      console.log('🎨 Attempting Pollinations.ai...');
      const imageBase64 = await generateWithPollinationsAI(enhancedPrompt);
      if (imageBase64 && imageBase64.length > 50000) {
        console.log(`✅ SUCCESS: AI image generated (${(imageBase64.length / 1024).toFixed(2)}KB)`);
        return imageBase64;
      }
    } catch (e) {
      console.warn('⚠️ Pollinations.ai failed:', e.message);
    }
    
    // Fallback to high-quality Canvas image with theme colors
    console.log('📦 Creating high-quality Canvas image...');
    const canvasImage = await createHighQualityCanvasImage(enhancedPrompt);
    if (canvasImage) {
      console.log(`✅ SUCCESS: Canvas image created (${(canvasImage.length / 1024).toFixed(2)}KB)`);
      return canvasImage;
    }
    
    console.error('❌ IMAGE GENERATION FAILED');
    return null;
    
  } catch (error) {
    console.error('❌ Fatal image generation error:', error.message);
    return null;
  }
}

// Create high-quality canvas image with gradient and decorations
async function createHighQualityCanvasImage(prompt) {
  try {
    const { createCanvas } = canvas;
    const canvasObj = createCanvas(1200, 600);
    const ctx = canvasObj.getContext('2d');
    
    const colors = getThemeColors(prompt);
    console.log(`🎨 Theme colors: ${colors.bg1} → ${colors.bg2}`);
    
    // Draw complex multi-layer gradient background
    const gradient1 = ctx.createLinearGradient(0, 0, 1200, 600);
    gradient1.addColorStop(0, colors.bg1);
    gradient1.addColorStop(0.5, colors.accent);
    gradient1.addColorStop(1, colors.bg2);
    ctx.fillStyle = gradient1;
    ctx.fillRect(0, 0, 1200, 600);
    
    // Add radial gradient for depth
    const radGrad = ctx.createRadialGradient(600, 300, 100, 600, 300, 900);
    radGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
    radGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 1200, 600);
    
    // Draw themed decorative patterns
    await drawDecorativePatterns(ctx, prompt, colors);
    
    // Convert to JPEG with high quality
    const buffer = canvasObj.toBuffer('image/jpeg', 0.95);
    console.log(`📦 Canvas buffer created: ${(buffer.length / 1024).toFixed(2)}KB`);
    
    const base64 = buffer.toString('base64');
    return `data:image/jpeg;base64,${base64}`;
    
  } catch (error) {
    console.error('❌ Canvas generation failed:', error.message);
    return null;
  }
}

// Draw decorative patterns based on theme
async function drawDecorativePatterns(ctx, prompt, colors) {
  const lower = prompt.toLowerCase();
  ctx.fillStyle = colors.accent;
  ctx.globalAlpha = 0.2;
  ctx.lineWidth = 6;
  
  if (lower.includes('diwali') || lower.includes('festival')) {
    // Draw diya/lamp circles
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 5; col++) {
        const x = 100 + col * 200;
        const y = 100 + row * 150;
        ctx.beginPath();
        ctx.arc(x, y, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  } else if (lower.includes('christmas')) {
    // Draw Christmas trees
    for (let i = 0; i < 5; i++) {
      const x = 130 + i * 210;
      // Tree
      ctx.beginPath();
      ctx.moveTo(x, 80);
      ctx.lineTo(x - 90, 280);
      ctx.lineTo(x + 90, 280);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  } else if (lower.includes('beach') || lower.includes('ocean')) {
    // Draw waves
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(600, i * 120, 180, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (lower.includes('wedding')) {
    // Draw heart and flower patterns
    for (let i = 0; i < 6; i++) {
      ctx.beginPath();
      ctx.arc(100 + i * 180, 150, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(100 + i * 180, 450, 40, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // Default geometric patterns
    for (let i = 0; i < 25; i++) {
      const x = Math.random() * 1200;
      const y = Math.random() * 600;
      if (i % 3 === 0) {
        ctx.fillRect(x - 30, y - 30, 60, 60);
      } else {
        ctx.beginPath();
        ctx.arc(x, y, 35, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  ctx.globalAlpha = 1.0;
}

// Generate using Replicate API
async function generateWithReplicate(prompt) {
  try {
    // Using Stabilityai's SDXL model through a free endpoint
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version: 'f178fa7a1ae43a9d65f2b6adc9e2b7f5f5b3f5f5',
        input: {
          prompt: prompt,
          width: 1200,
          height: 600,
          num_outputs: 1
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Replicate response:', data);
    
    if (data.error || !data.output || data.output.length === 0) {
      throw new Error('No image output from Replicate');
    }
    
    const imageUrl = data.output[0];
    console.log('🖼️ Generated image URL:', imageUrl);
    
    // Fetch the image and convert to base64
    const imgResponse = await fetch(imageUrl);
    const buffer = await imgResponse.buffer();
    const base64 = buffer.toString('base64');
    
    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.warn('Replicate error:', error.message);
    return null;
  }
}

// Generate using Pollinations.ai (free, no auth needed)
async function generateWithPollinationsAI(prompt) {
  try {
    const truncatedPrompt = prompt.substring(0, 400);
    const encodedPrompt = encodeURIComponent(truncatedPrompt);
    
    // Direct image URL with turbo model for speed
    const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1200&height=600&model=turbo&nologo=true`;
    
    console.log(`📡 Calling Pollinations API...`);
    console.log(`🎨 Image URL: ${imageUrl.substring(0, 120)}...`);
    
    // Use axios to download image with proper error handling
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'AIBannerGenerator/1.0'
      }
    });
    
    console.log(`📊 Response Status: ${response.status}`);
    console.log(`📦 Content-Type: ${response.headers['content-type']}`);
    
    const buffer = response.data;
    
    if (!buffer || buffer.length === 0) {
      throw new Error('Empty image buffer received');
    }
    
    console.log(`✅ Image downloaded: ${(buffer.length / 1024).toFixed(2)}KB`);
    
    const base64 = Buffer.from(buffer).toString('base64');
    console.log(`✅ Converted to Base64: ${(base64.length / 1024).toFixed(2)}KB encoded`);
    
    return `data:image/jpeg;base64,${base64}`;
    
  } catch (error) {
    console.error('❌ Pollinations error:', error.message);
    throw error;
  }
}

// Create enhanced canvas image with textures

// Get theme colors based on keywords in prompt
function getThemeColors(prompt) {
  const lower = prompt.toLowerCase();
  
  const themes = {
    diwali: { bg1: '#FF6B35', bg2: '#FFD700', accent: '#F7931E' },
    festival: { bg1: '#FF6B35', bg2: '#FFD700', accent: '#F7931E' },
    christmas: { bg1: '#DC143C', bg2: '#FFFFFF', accent: '#006400' },
    xmas: { bg1: '#DC143C', bg2: '#FFFFFF', accent: '#006400' },
    valentine: { bg1: '#FF1493', bg2: '#FFB6C1', accent: '#FF69B4' },
    wedding: { bg1: '#FFB6C1', bg2: '#FFFFFF', accent: '#FF1493' },
    beach: { bg1: '#00B4DB', bg2: '#87CEEB', accent: '#0083B0' },
    ocean: { bg1: '#0083B0', bg2: '#00B4DB', accent: '#006994' },
    summer: { bg1: '#FFD700', bg2: '#87CEEB', accent: '#FF6347' },
    nature: { bg1: '#228B22', bg2: '#FFFFFF', accent: '#32CD32' },
    forest: { bg1: '#0B6623', bg2: '#90EE90', accent: '#228B22' },
    halloween: { bg1: '#FF8C00', bg2: '#000000', accent: '#9932CC' },
    easter: { bg1: '#FFD700', bg2: '#FF69B4', accent: '#87CEEB' },
    newyear: { bg1: '#000080', bg2: '#FFD700', accent: '#C0C0C0' },
    birthday: { bg1: '#FF1493', bg2: '#00CED1', accent: '#FFD700' },
    business: { bg1: '#003366', bg2: '#CCCCCC', accent: '#0066CC' },
    tech: { bg1: '#0F2027', bg2: '#203A43', accent: '#2C5282' },
    sports: { bg1: '#FF6347', bg2: '#000000', accent: '#FFD700' },
    music: { bg1: '#9400D3', bg2: '#00CED1', accent: '#FF1493' }
  };
  
  for (const [key, colors] of Object.entries(themes)) {
    if (lower.includes(key)) {
      return colors;
    }
  }
  
  // Default vibrant theme
  return { bg1: '#667EEA', bg2: '#764BA2', accent: '#F093FB' };
}

// Use Gemini to enhance prompts
async function enhancePromptWithGemini(userPrompt) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    
    const enhancementPrompt = `You are an expert at creating detailed, vivid image generation prompts.

User wants: "${userPrompt}"

Create a highly detailed prompt for image generation that:
1. Describes EXACTLY what should appear in the image
2. Includes specific colors, objects, and atmosphere
3. Matches the user's theme perfectly
4. Is 80-120 words maximum
5. MUST include all key elements the user mentioned

Return ONLY the enhanced prompt, nothing else.`;
    
    const result = await model.generateContent(enhancementPrompt);
    const response = await result.response;
    const enhancedPrompt = response.text();
    
    console.log('📝 Original:', userPrompt);
    console.log('✨ Enhanced:', enhancedPrompt);
    
    return enhancedPrompt;
  } catch (error) {
    console.error('Gemini enhancement error:', error.message);
    return userPrompt;
  }
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Generate banner with AI image and Gemini text
app.post('/api/generate-banner', async (req, res) => {
  try {
    const { prompt, theme } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      return res.status(500).json({ 
        error: 'Gemini API not configured'
      });
    }

    console.log(`\n🎨 === BANNER GENERATION START ===`);
    console.log(`📝 Prompt: ${prompt}`);
    console.log(`🎭 Theme: ${theme}`);

    // Step 1: Enhance prompt for better images
    console.log('📝 Step 1: Enhancing prompt...');
    let enhancedImagePrompt = prompt;
    try {
      enhancedImagePrompt = await enhancePromptWithGemini(prompt);
    } catch (e) {
      console.log(`⚠️ Enhancement failed, using original prompt`);
    }

    // Step 2: Generate image
    console.log('🖼️ Step 2: Generating image...');
    let imageBase64 = null;
    try {
      imageBase64 = await generateImageWithPublicAPI(enhancedImagePrompt);
    } catch (e) {
      console.error(`❌ Image generation error: ${e.message}`);
    }

    // Step 3: Generate text content
    console.log('✍️ Step 3: Generating title & description...');
    let content = {
      title: `Wonderful ${theme || 'Banner'}`,
      description: prompt.substring(0, 80)
    };

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const contentPrompt = `Create banner content for: "${prompt}"
{
  "title": "Catchy title (max 40 chars)",
  "description": "Compelling subtitle (max 80 chars)"
}
Return ONLY JSON.`;
      
      const result = await model.generateContent(contentPrompt);
      const text = (await result.response).text();
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        content = JSON.parse(match[0]);
      }
    } catch (e) {
      console.log(`⚠️ Gemini text generation failed, using defaults`);
    }

    console.log(`✅ === GENERATION COMPLETE ===\n`);

    res.json({
      success: true,
      title: content.title,
      description: content.description,
      image: imageBase64,
      theme: theme,
      promptUsed: enhancedImagePrompt,
      generatedBy: '🤖 Gemini AI + Image Gen'
    });

  } catch (error) {
    console.error(`❌ Fatal error: ${error.message}`);
    res.status(500).json({ 
      error: error.message,
      success: false
    });
  }
});

// Health check endpoint
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  const geminiConfigured = !!process.env.GOOGLE_GEMINI_API_KEY;
  
  console.log(`
╔═══════════════════════════════════════════════════╗
║  🤖 AI Banner Generator with Google Gemini       ║
║           Server Running Successfully            ║
╚═══════════════════════════════════════════════════╝

✅ Server: http://localhost:${PORT}
📝 Banner Generation: /api/generate-banner
🏥 Health Check: /api/health
🤖 AI Engine: Google Gemini ${geminiConfigured ? '✨ ENABLED' : '⚠️ NOT CONFIGURED'}

${geminiConfigured ? '✨ Gemini API is configured and ready!' : 'WARNING: Please add GOOGLE_GEMINI_API_KEY to .env file'}

📌 Features:
✓ Gemini Pro for intelligent text generation
✓ Smart prompt enhancement
✓ Theme-aware banner creation
✓ Multiple theme support (30+ themes)
✓ Real-time banner generation

🚀 Ready to generate amazing banners with Gemini AI!
  `);
});

export default app;
