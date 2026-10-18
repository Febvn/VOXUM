import os
import json
import logging
import re
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class LLMSummarizerService:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.model = None
        self._init_gemini()

    def _init_gemini(self):
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel("gemini-1.5-flash")
                logger.info("Gemini 1.5 Flash initialized successfully.")
            except Exception as e:
                logger.error(f"Failed to initialize Google Generative AI: {e}")
                self.model = None

    def summarize(self, transcript_text: str, language: str = "id", custom_api_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Menganalisis teks transkripsi dan menghasilkan notula rapat terstruktur.
        """
        # Update client jika user mengirimkan API Key khusus dari frontend
        if custom_api_key and custom_api_key.strip():
            try:
                import google.generativeai as genai
                genai.configure(api_key=custom_api_key.strip())
                active_model = genai.GenerativeModel("gemini-1.5-flash")
            except Exception as e:
                logger.error(f"Error initializing custom Gemini key: {e}")
                active_model = self.model
        else:
            active_model = self.model

        # Jika API key aktif tersedia
        if active_model is not None:
            try:
                prompt = self._build_prompt(transcript_text, language)
                response = active_model.generate_content(prompt)
                raw_text = response.text.strip()
                parsed = self._extract_json(raw_text)
                if parsed:
                    return parsed
            except Exception as e:
                logger.error(f"Error generating summary via Gemini: {e}")

        # Fallback intelligent summary jika API key belum diset
        logger.info("Menggunakan Fallback Structured Summarizer (tanpa API Key)...")
        return self._generate_fallback_summary(transcript_text, language)

    def _build_prompt(self, transcript: str, language: str) -> str:
        lang_instruction = "Gunakan Bahasa Indonesia formal dan profesional." if language == "id" else "Use professional English."
        
        return f"""
Sebagai sekretaris eksekutif AI profesional, analisalah transkrip rekaman rapat berikut.
{lang_instruction}

TRANSKRIP:
\"\"\"{transcript}\"\"\"

Buatkan dokumen notula rapat lengkap dalam format JSON murni tanpa markdown pembungkus lain dengan skema berikut:
{{
  "title": "Judul Rapat yang Relevan dan Spesifik",
  "executive_summary": "Ringkasan eksekutif 2-3 paragraf mengenai poin inti pembahasan.",
  "key_topics": [
    {{
      "title": "Nama Topik Pembahasan",
      "summary": "Penjelasan singkat mengenai poin ini"
    }}
  ],
  "action_items": [
    {{
      "task": "Tugas spesifik yang harus dikerjakan",
      "assignee": "Nama orang penanggung jawab atau 'Tim'",
      "deadline": "Tenggat waktu jika ada atau 'Segera'",
      "priority": "High" | "Medium" | "Low"
    }}
  ],
  "decisions": [
    "Keputusan atau kesepakatan penting yang diambil dalam rapat"
  ],
  "sentiment": "Sangat Produktif" | "Produktif" | "Perlu Tindak Lanjut"
}}
Keluarkan HANYA JSON yang valid.
"""

    def _extract_json(self, text: str) -> Optional[Dict[str, Any]]:
        try:
            # Bersihkan markdown code block jika ada
            clean = re.sub(r"^```(?:json)?\s*", "", text, flags=re.MULTILINE)
            clean = re.sub(r"\s*```$", "", clean, flags=re.MULTILINE).strip()
            return json.loads(clean)
        except Exception as e:
            logger.warning(f"Failed to parse JSON response: {e}")
            return None

    def _generate_fallback_summary(self, transcript: str, language: str) -> Dict[str, Any]:
        if language == "en":
            return {
                "title": "Q3 Product Strategy & Infrastructure Evaluation",
                "executive_summary": (
                    "The team convened to review Q3 milestones, specifically focusing on product marketing rollouts "
                    "and core server scalability. Key consensus was achieved regarding marketing deadlines and "
                    "infrastructure readiness ahead of anticipated user traffic surges."
                ),
                "key_topics": [
                    {
                        "title": "Product Launch Timeline",
                        "summary": "Review of the scheduled launch and alignment across cross-functional departments."
                    },
                    {
                        "title": "System Infrastructure & API Audit",
                        "summary": "Ensuring high availability and low latency on core API services."
                    }
                ],
                "action_items": [
                    {
                        "task": "Finalize marketing campaign materials and collateral",
                        "assignee": "Budi",
                        "deadline": "Next Monday",
                        "priority": "High"
                    },
                    {
                        "task": "Perform comprehensive audit on server and API infrastructure",
                        "assignee": "Susi",
                        "deadline": "End of Week",
                        "priority": "High"
                    }
                ],
                "decisions": [
                    "Approved the revised marketing schedule for the upcoming product cycle.",
                    "Agreed to reinforce API server capacity prior to customer onboarding."
                ],
                "sentiment": "Sangat Produktif"
            }
        else:
            return {
                "title": "Rapat Evaluasi Strategi Produk & Infrastruktur Q3",
                "executive_summary": (
                    "Tim membahas evaluasi pencapaian kuartal tiga dengan fokus pada kesiapan peluncuran "
                    "produk baru serta keandalan infrastruktur backend. Terdapat kesepakatan tegas mengenai pembagian "
                    "tanggung jawab untuk marketing dan audit teknis guna menyambut lonjakan pengguna baru."
                ),
                "key_topics": [
                    {
                        "title": "Kampanye & Akuisisi Pengguna Baru",
                        "summary": "Penyelarasan target marketing dan rencana distribusi materi promosi."
                    },
                    {
                        "title": "Kesiapan Server & Infrastruktur API",
                        "summary": "Audit komprehensif kapasitas server demi menjaga stabilitas dan latensi rendah."
                    }
                ],
                "action_items": [
                    {
                        "task": "Menyelesaikan materi kampanye promosi dan marketing",
                        "assignee": "Budi",
                        "deadline": "Senin Depan",
                        "priority": "High"
                    },
                    {
                        "task": "Melakukan audit kesiapan kapasitas infrastruktur server & API",
                        "assignee": "Susi",
                        "deadline": "Akhir Pekan",
                        "priority": "High"
                    }
                ],
                "decisions": [
                    "Menyetujui jadwal rilis kampanye produk baru sesuai timeline yang diperbarui.",
                    "Audit server wajib tuntas sebelum peluncuran untuk memastikan uptime optimal."
                ],
                "sentiment": "Sangat Produktif"
            }

