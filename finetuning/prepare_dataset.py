"""
Script untuk menyiapkan dan memformat dataset audio untuk Fine-Tuning Whistle.
Format target: JSON Lines (.jsonl) dengan schema:
{"audio": "path/to/clip.wav", "text": "transkripsi teks", "language": "id"}
"""

import os
import json
import csv
import argparse
from pathlib import Path

def prepare_common_voice_id(tsv_path: str, clips_dir: str, output_jsonl: str, language_code: str = "id"):
    """
    Mengonversi file TSV dari Mozilla Common Voice (misal: train.tsv) ke JSONL Whistle.
    """
    print(f"Membaca {tsv_path}...")
    records = []
    
    with open(tsv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f, delimiter="\t")
        for row in reader:
            filename = row.get("path")
            sentence = row.get("sentence", "").strip()
            
            if not filename or not sentence:
                continue

            # Path lengkap file audio
            audio_path = os.path.join(clips_dir, filename)
            
            records.append({
                "audio": audio_path,
                "text": sentence,
                "language": language_code
            })

    print(f"Menyimpan {len(records)} baris data ke {output_jsonl}...")
    with open(output_jsonl, "w", encoding="utf-8") as out:
        for r in records:
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
            
    print("Selesai! Dataset siap digunakan untuk 'needle finetune'.")

def prepare_custom_folder(audio_folder: str, metadata_file: str, output_jsonl: str, language_code: str = "id"):
    """
    Mengonversi folder rekaman audio kustom dengan file metadata sederhana (format: filename.wav|teks).
    """
    records = []
    with open(metadata_file, "r", encoding="utf-8") as f:
        for line in f:
            parts = line.strip().split("|")
            if len(parts) >= 2:
                file_name = parts[0].strip()
                text = parts[1].strip()
                audio_path = os.path.join(audio_folder, file_name)
                records.append({
                    "audio": audio_path,
                    "text": text,
                    "language": language_code
                })

    with open(output_jsonl, "w", encoding="utf-8") as out:
        for r in records:
            out.write(json.dumps(r, ensure_ascii=False) + "\n")
    print(f"Berhasil membuat {len(records)} baris di {output_jsonl}.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Siapkan dataset untuk Fine-Tuning Whistle")
    parser.add_argument("--type", choices=["commonvoice", "custom"], default="commonvoice", help="Tipe format data sumber")
    parser.add_argument("--meta", required=False, help="Path ke file TSV (Common Voice) atau metadata.txt")
    parser.add_argument("--clips", required=False, help="Folder berisi file audio")
    parser.add_argument("--out", default="train_id.jsonl", help="File output .jsonl")
    parser.add_argument("--lang", default="id", help="Kode bahasa (contoh: id untuk Indonesia)")
    
    args = parser.parse_args()
    if args.meta and args.clips:
        if args.type == "commonvoice":
            prepare_common_voice_id(args.meta, args.clips, args.out, args.lang)
        else:
            prepare_custom_folder(args.clips, args.meta, args.out, args.lang)
    else:
        print("Gunakan argumen --meta dan --clips. Contoh:")
        print("python prepare_dataset.py --type commonvoice --meta train.tsv --clips clips/ --out train_id.jsonl")

