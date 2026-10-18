# Panduan Fine-Tuning Whistle (Bahasa Indonesia & Multibahasa)

Panduan ini menjelaskan cara melatih dan menambahkan dukungan bahasa baru (seperti **Bahasa Indonesia**) ke model **Whistle (16.9 MB)** menggunakan framework Cactus Needle.

---

## 1. Persiapan Lingkungan

Instal toolkit `cactus-needle` dengan dukungan pelatihan:

```bash
pip install "cactus-needle[train]"
```

*Catatan: Modul training membutuhkan GPU (NVIDIA CUDA atau Apple Silicon) atau CPU dengan RAM yang cukup.*

---

## 2. Siapkan Dataset Audio

Format dataset yang dibutuhkan adalah **JSON Lines (`.jsonl`)**:

```json
{"audio": "clips/audio_001.wav", "text": "selamat pagi kita mulai rapat hari ini", "language": "id"}
{"audio": "clips/audio_002.wav", "text": "target penjualan kuartal ini tercapai", "language": "id"}
```

### Menggunakan Mozilla Common Voice (Indonesian)
1. Unduh dataset Bahasa Indonesia dari [Mozilla Common Voice](https://commonvoice.mozilla.org/id/datasets).
2. Ekstrak file `train.tsv` dan folder `clips/`.
3. Jalankan script konverter:
   ```bash
   python prepare_dataset.py --type commonvoice --meta path/to/train.tsv --clips path/to/clips/ --out train_id.jsonl
   ```

---

## 3. Jalankan Fine-Tuning (LoRA)

Jalankan perintah berikut untuk melatih adapter LoRA pada lapisan atensi Whistle:

```bash
needle finetune train_id.jsonl \
  --base-model whistle \
  --epochs 10 \
  --batch-size 16 \
  --lr 1e-4 \
  --out whistle_id_adapter.safetensors
```

---

## 4. Build Model Akhir (`.cact`)

Satukan bobot base model Whistle dengan adapter LoRA bahasa baru menjadi format biner terpadu:

```bash
needle build \
  --base whistle \
  --lora whistle_id_adapter.safetensors \
  --layers 8 \
  --out whistle_multilingual.cact
```

File hasil build **`whistle_multilingual.cact`** tetap berukuran super ringan (~16.9 MB).

---

## 5. Hubungkan ke Web SaaS

Salin file `whistle_multilingual.cact` ke dalam folder `backend/`:

```bash
cp whistle_multilingual.cact ../backend/
```

Backend FastAPI secara otomatis akan mendeteksi file model tersebut dan menggunakannya untuk transkripsi audio.

