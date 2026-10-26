import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Research Assistant endpoint
app.post('/api/gemini/research-assistant', async (req, res) => {
  try {
    const { prompt, sightingsContext } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const systemInstruction = `You are a Wildlife Biologist and Senior Predator Ecology Specialist for the Northwest Territories (NWT) Department of Environment and Climate Change in Canada.
You specialize in wolf (Canis lupus) pack dynamics, territory mapping, caribou predator-prey relationships (Bathurst, Bluenose-East, Porcupine, Woodland Caribou), telemetry collar analysis, and community wildlife reporting in NWT.
Analyze the user query and provided active sightings dataset context thoroughly and produce concise, scientifically rigorous responses. Use bullet points, bold key stats, and reference specific wolf packs or NWT regions when relevant.`;

    const fullPrompt = `${prompt}

[CURRENT FILTERED NWT WOLF SIGHTINGS CONTEXT]
${JSON.stringify(sightingsContext || [], null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: fullPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const replyText = response.text || 'No response generated.';
    return res.json({ text: replyText });
  } catch (error: any) {
    console.error('Gemini Research Assistant Error:', error);
    return res.status(500).json({
      error: 'Failed to query AI research assistant',
      details: error.message || String(error),
    });
  }
});

// Configure Vite middleware or static serving
async function setupServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });
    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api/')) return next();

      try {
        const fs = await import('fs/promises');
        let template = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      if (req.originalUrl.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`NWT Wolf Research App running on port ${PORT}`);
  });
}

setupServer();
