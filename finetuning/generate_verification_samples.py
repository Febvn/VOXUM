"""
Script untuk membuat sampel audio dan metadata verifikasi (ID & EN)
sehingga pipeline pelatihan dan pengujian dapat langsung dicoba secara lokal.
"""

import os
import wave
import math
import struct
import json

def generate_sine_wav(filepath: str, duration_sec: float = 3.0, freq: float = 440.0, sample_rate: int = 16000):
    """Membuat file WAV 16 kHz mono sintetis yang valid."""
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    num_samples = int(duration_sec * sample_rate)
    with wave.open(filepath, 'w') as wav:
        wav.setnchannels(1)        # Mono
        wav.setsampwidth(2)       # 16-bit (2 bytes per sample)
        wav.setframerate(sample_rate)
        
        for i in range(num_samples):
            # Gabungkan 2 frekuensi dengan modulasi amplitudo agar menyerupai spektrum vokal dasar
            sample = 0.4 * math.sin(2 * math.pi * freq * (i / sample_rate))
            sample += 0.2 * math.sin(2 * math.pi * (freq * 1.5) * (i / sample_rate))
            # Tambahkan envelope attack & decay
            envelope = min(1.0, i / (0.05 * sample_rate)) * min(1.0, (num_samples - i) / (0.05 * sample_rate))
            int_sample = int(sample * envelope * 32767)
            wav.writeframesraw(struct.pack('<h', int_sample))

def generate_samples(base_dir: str = "sample_data"):
    clips_dir = os.path.join(base_dir, "clips")
    os.makedirs(clips_dir, exist_ok=True)

    # 1. Buat klip audio Bahasa Indonesia
    id_samples = [
        {"file": "id_01.wav", "text": "selamat pagi rapat kuartal tiga kita mulai sekarang", "freq": 320},
        {"file": "id_02.wav", "text": "target penjualan produk baru naik lima belas persen", "freq": 380},
        {"file": "id_03.wav", "text": "budi akan menyelesaikan materi kampanye marketing hari senin", "freq": 340},
        {"file": "id_04.wav", "text": "susi bertanggung jawab untuk audit infrastruktur server dan api", "freq": 420},
        {"file": "id_05.wav", "text": "kesepakatan rapat telah disetujui oleh seluruh tim divisi", "freq": 360},
    ]

    id_jsonl = os.path.join(base_dir, "data_id.jsonl")
    with open(id_jsonl, "w", encoding="utf-8") as f:
        for s in id_samples:
            wav_path = os.path.join(clips_dir, s["file"])
            generate_sine_wav(wav_path, duration_sec=3.5, freq=s["freq"])
            f.write(json.dumps({"audio": wav_path, "text": s["text"], "language": "id"}, ensure_ascii=False) + "\n")
    print(f"[OK] Dibuat {len(id_samples)} sampel audio Bahasa Indonesia di {id_jsonl}")

    # 2. Buat klip audio Replay (English)
    en_samples = [
        {"file": "en_01.wav", "text": "welcome everyone to our quarterly business review meeting", "freq": 300},
        {"file": "en_02.wav", "text": "the new product launch is scheduled for next month", "freq": 350},
        {"file": "en_03.wav", "text": "please review the action items and confirm your deadlines", "freq": 390},
    ]

    en_jsonl = os.path.join(base_dir, "data_replay.jsonl")
    with open(en_jsonl, "w", encoding="utf-8") as f:
        for s in en_samples:
            wav_path = os.path.join(clips_dir, s["file"])
            generate_sine_wav(wav_path, duration_sec=3.0, freq=s["freq"])
            f.write(json.dumps({"audio": wav_path, "text": s["text"], "language": "en"}, ensure_ascii=False) + "\n")
    print(f"[OK] Dibuat {len(en_samples)} sampel audio Replay (English) di {en_jsonl}")

if __name__ == "__main__":
    generate_samples()

