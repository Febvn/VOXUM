export default function handler(req, res) {
  res.status(200).json({
    status: "ok",
    app: "Peluit.ai SaaS",
    platform: "Vercel Serverless",
    engine: "Whistle 16.9 MB (Multilingual ID+7) & Gemini Flash",
    timestamp: new Date().toISOString()
  });
}

