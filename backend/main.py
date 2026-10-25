import os
import shutil
import tempfile
import logging
from typing import Optional, List
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from services.asr_service import WhistleASRService
from services.llm_service import LLMSummarizerService

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("notula-api")

app = FastAPI(
    title="Peluit AI - Whistle ASR & LLM Summarizer SaaS",
    description="Backend API untuk transkripsi ultra-cepat menggunakan Whistle (16.9 MB) dan ringkasan rapat cerdas via Gemini.",
    version="1.0.0"
)

# Aktifkan CORS untuk frontend Next.js / Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inisialisasi service
asr_service = WhistleASRService()
llm_service = LLMSummarizerService()

class SummarizeRequest(BaseModel):
    transcript: str
    language: Optional[str] = "auto"
    api_key: Optional[str] = None

@app.get("/")
@app.get("/api/health")
def read_root():
    return {
        "app": "Peluit.ai SaaS Backend",
        "asr_engine": "Whistle ASR (faster-whisper int8)",
        "model_size": asr_service.model_size,
        "engine_ready": asr_service.engine is not None,
        "status": "ready"
    }

@app.post("/api/process")
async def process_audio(
    file: UploadFile = File(...),
    language: str = Form("auto"),
    keywords: Optional[str] = Form(None),
    gemini_api_key: Optional[str] = Form(None)
):
    """
    Endpoint utama: Menerima file audio -> Transkripsi Whistle -> Ringkasan Notula LLM.
    """
    # Parse keywords jika ada (dipisahkan koma)
    kw_list = [k.strip() for k in keywords.split(",")] if keywords else []

    # Simpan file audio sementara
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_path = temp_audio.name
        content = await file.read()
        temp_audio.write(content)

    try:
        # 1. Jalankan Whistle ASR
        logger.info(f"Transcribing audio: {file.filename} (lang: {language})")
        asr_result = asr_service.transcribe(
            audio_path=temp_path,
            language=language,
            keywords=kw_list,
            word_timestamps=True
        )

        transcript_text = asr_result.get("text", "")
        if not transcript_text:
            raise HTTPException(status_code=400, detail="Tidak ada suara terdeteksi dalam audio.")

        # 2. Jalankan LLM Summarizer (Gemini Flash)
        logger.info("Generating executive meeting notes via LLM...")
        notes_result = llm_service.summarize(
            transcript_text=transcript_text,
            language=asr_result.get("language", language),
            custom_api_key=gemini_api_key
        )

        return {
            "status": "success",
            "filename": file.filename,
            "transcription": {
                "text": transcript_text,
                "language": asr_result.get("language", language),
                "latency_ms": asr_result.get("latency_ms", 0),
                "tokens_per_sec": asr_result.get("tokens_per_sec", 1319),
                "words": asr_result.get("words", []),
                "engine": asr_result.get("engine", "whistle")
            },
            "meeting_notes": notes_result
        }

    except Exception as e:
        logger.error(f"Error processing audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Hapus file temporary
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/transcribe-only")
async def transcribe_only(
    file: UploadFile = File(...),
    language: str = Form("id"),
    keywords: Optional[str] = Form(None)
):
    """Hanya melakukan transkripsi cepat tanpa ringkasan LLM."""
    kw_list = [k.strip() for k in keywords.split(",")] if keywords else []
    suffix = os.path.splitext(file.filename)[1] or ".wav"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_path = temp_audio.name
        content = await file.read()
        temp_audio.write(content)

    try:
        result = asr_service.transcribe(
            audio_path=temp_path,
            language=language,
            keywords=kw_list,
            word_timestamps=True
        )
        return {"status": "success", "result": result}
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/api/summarize-text")
def summarize_text(req: SummarizeRequest):
    """Membuat ringkasan dari teks yang sudah ada."""
    notes = llm_service.summarize(
        transcript_text=req.transcript,
        language=req.language or "id",
        custom_api_key=req.api_key
    )
    return {"status": "success", "meeting_notes": notes}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

