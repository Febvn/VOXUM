# Notula.ai - Web SaaS AI Meeting Notes & Speech-to-Text

Web SaaS modern untuk transkripsi rapat ultra-cepat dan pembuatan notula otomatis, ditenagai oleh kombinasi:
1. **Whistle (16.9 MB)** oleh Cactus Compute untuk Automatic Speech Recognition (ASR) ultra-cepat (latensi first-token 11 ms, 1.319 tok/s, footprint CPU ringan).
2. **LoRA Fine-Tuning Pipeline** untuk memperluas kemampuan multibahasa (termasuk Bahasa Indonesia).
3. **Google Gemini 1.5 Flash** untuk menyusun Ringkasan Eksekutif, Action Items (tugas & PIC), Topik Bahasan, dan Keputusan Rapat.

---

## Struktur Proyek

```
Trans/
├── frontend/             # Antarmuka Web SaaS (React + TypeScript + Tailwind CSS + Lucide)
│   ├── src/
│   │   ├── components/   # AudioUploader, AudioPlayerWithSync, MeetingNotesView, SettingsModal
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   └── index.css
│   └── package.json
│
├── backend/              # REST API Backend (FastAPI + Python)
│   ├── services/
│   │   ├── asr_service.py # Integrasi Whistle Engine (.cact runtime)
│   │   └── llm_service.py # Integrasi Gemini Flash Notula Summarizer
│   ├── main.py           # Endpoint FastAPI (/api/process, /api/transcribe-only, dll.)
│   └── requirements.txt
│
└── finetuning/           # Pipeline Pelatihan LoRA Whistle
    ├── prepare_dataset.py # Konverter dataset Mozilla Common Voice / Custom Audio ke JSONL
    ├── finetune_whistle.py# Script otomasi LoRA fine-tuning & build .cact
    └── README.md          # Panduan lengkap fine-tuning Bahasa Indonesia
```

---

## 1. Menjalankan Frontend (Web App)

```bash
cd frontend
npm install
npm run dev
```

Buka browser di `http://localhost:5173`.
*Fitur frontend:*
- **Upload File Audio/Video** (MP3, WAV, M4A, OGG, dll.).
- **Rekam Suara Langsung** dari mikrofon browser dengan visualisasi timer.
- **Demo Cepat 1-Klik**: Mencoba UI seketika tanpa perlu upload audio.
- **Interactive Karaoke Sync**: Klik kata manapun pada teks untuk memutar audio tepat di detik tersebut.
- **Export & Salin**: Ekspor notula ke Markdown (`.md`), teks, atau salin untuk Notion.
- **Keyword Biasing**: Mendukung pengenalan nama orang & istilah teknis via Aho-Corasick automaton.

---

## 2. Menjalankan Backend (FastAPI)

```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

Atur API Key di file `.env` (atau salin dari `.env.example`):
```env
GEMINI_API_KEY=AIzaSy...
WHISTLE_MODEL_PATH=whistle_multilingual.cact
```

Jalankan server:
```bash
python main.py
```
Backend akan aktif di `http://localhost:8000` dengan dokumentasi interaktif Swagger di `http://localhost:8000/docs`.

---

## 3. Melakukan Fine-Tuning Whistle untuk Bahasa Indonesia

1. Masuk ke direktori `finetuning/`:
   ```bash
   cd finetuning
   pip install "cactus-needle[train]"
   ```
2. Siapkan dataset audio berformat 16 kHz WAV mono berpasangan dengan teks di `train_id.jsonl`.
3. Jalankan fine-tuning LoRA:
   ```bash
   python finetune_whistle.py --data train_id.jsonl --epochs 10 --out-cact whistle_multilingual.cact
   ```
4. Pindahkan file hasil kompilasi `whistle_multilingual.cact` (~16.9 MB) ke folder `backend/`. Backend akan langsung menggunakannya secara otomatis!

---

## 4. Keunggulan Unit Economics untuk SaaS Anda

- **Biaya Server Sangat Rendah:** Model Whistle hanya 16.9 MB dan berjalan di CPU standar tanpa memerlukan GPU cloud mahal ($0.01 vs $0.0001 per jam).
- **Latensi Instan:** Pemrosesan audio dimulai dalam 11 ms, dengan kecepatan dekode mencapai 1.300+ token per detik.
- **Privasi Tinggi:** Audio diproses secara on-device/lokal, hanya teks ringkas yang dikirim ke LLM summarizer.

