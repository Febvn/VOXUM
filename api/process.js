export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { transcript, language = "id", template = "general", apiKey } = req.body || {};
    const effectiveKey = apiKey || process.env.GEMINI_API_KEY;

    // Template instructions
    const templatePrompts = {
      general: "Format notula rapat formal: ringkasan eksekutif, action items, topik, dan keputusan.",
      agile: "Format Agile Sprint Standup: blockers, apa yang selesai, target sprint berikutnya, dan PIC.",
      one_on_one: "Format 1-on-1 Catchup: feedback, personal development, tantangan kerja, dan tindak lanjut.",
      sales: "Format Sales Call: pain points klien, budget/timeline, objection, dan kesepakatan next step.",
      webinar: "Format Kuliah/Webinar: konsep utama, poin penting, Q&A takeaways, dan rangkuman intisari."
    };

    const templateGuide = templatePrompts[template] || templatePrompts.general;
    const langInstruction = language === "id" ? "Gunakan Bahasa Indonesia profesional." : "Use professional English.";

    if (effectiveKey && transcript) {
      const prompt = `Sebagai sekretaris eksekutif AI profesional, analisalah teks rapat berikut.
${langInstruction}
Tipe Rapat: ${templateGuide}

TEKS RAPAT:
"""${transcript}"""

Keluarkan output HANYA dalam JSON valid tanpa markdown tambahan dengan skema:
{
  "title": "Judul Rapat Spesifik",
  "executive_summary": "Ringkasan eksekutif 2-3 paragraf.",
  "key_topics": [
    { "title": "Nama Topik", "summary": "Penjelasan ringkas" }
  ],
  "action_items": [
    { "task": "Nama tugas", "assignee": "PIC", "deadline": "Tenggat waktu", "priority": "High" | "Medium" | "Low" }
  ],
  "decisions": ["Poin keputusan rapat"],
  "sentiment": "Sangat Produktif" | "Produktif" | "Perlu Tindak Lanjut"
}`;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        })
      });

      if (geminiRes.ok) {
        const data = await geminiRes.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          return res.status(200).json({
            status: "success",
            meeting_notes: parsed
          });
        }
      }
    }

    // Default response
    return res.status(200).json({
      status: "success",
      message: "Vercel Serverless Ready. Set GEMINI_API_KEY di dashboard Vercel untuk aktivasi penuh."
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Internal Server Error" });
  }
}

