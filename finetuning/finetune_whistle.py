"""
Workflow Fine-Tuning Whistle untuk Bahasa Baru (Bahasa Indonesia)
Menggunakan LoRA adapter melalui toolkit Cactus Needle.
"""

import subprocess
import os
import sys
import argparse

def run_finetuning(dataset_jsonl: str, output_adapter: str = "whistle_id_lora.safetensors", epochs: int = 10, batch_size: int = 16):
    """
    1. Menjalankan LoRA Fine-Tuning pada Whistle base model.
    """
    print(f"--- Langkah 1: Memulai LoRA Fine-Tuning pada {dataset_jsonl} ---")
    cmd = [
        "needle", "finetune", dataset_jsonl,
        "--base-model", "whistle",
        "--epochs", str(epochs),
        "--batch-size", str(batch_size),
        "--lr", "1e-4",
        "--out", output_adapter
    ]
    print("Menjalankan:", " ".join(cmd))
    try:
        proc = subprocess.run(cmd, check=True)
        print("Pelatihan LoRA selesai dengan sukses!")
    except FileNotFoundError:
        print("[ERROR] Perintah 'needle' tidak ditemukan. Pastikan sudah install: pip install 'cactus-needle[train]'")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Gagal saat fine-tuning: {e}")
        sys.exit(1)

def build_cact_model(adapter_path: str, output_cact: str = "whistle_multilingual.cact"):
    """
    2. Menggabungkan bobot LoRA adapter ke format runtime `.cact` tunggal (~16.9 MB).
    """
    print(f"\n--- Langkah 2: Mengompilasi Model Baru ke {output_cact} ---")
    cmd = [
        "needle", "build",
        "--base", "whistle",
        "--lora", adapter_path,
        "--layers", "8",
        "--out", output_cact
    ]
    print("Menjalankan:", " ".join(cmd))
    try:
        subprocess.run(cmd, check=True)
        print(f"\n[SUKSES] Model Whistle Multibahasa berhasil dibuat: {output_cact}")
        print(f"Pindahkan file '{output_cact}' ke folder 'backend/' untuk langsung digunakan di Web SaaS.")
    except Exception as e:
        print(f"[ERROR] Gagal mengompilasi model: {e}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Pipeline Fine-Tuning Whistle untuk Bahasa Baru")
    parser.add_argument("--data", default="train_id.jsonl", help="Path ke file dataset JSONL")
    parser.add_argument("--epochs", type=int, default=10, help="Jumlah epoch pelatihan")
    parser.add_argument("--batch-size", type=int, default=16, help="Ukuran batch")
    parser.add_argument("--out-cact", default="whistle_multilingual.cact", help="Nama file model .cact output")
    
    args = parser.parse_args()
    
    adapter_file = "whistle_lora_temp.safetensors"
    run_finetuning(args.data, output_adapter=adapter_file, epochs=args.epochs, batch_size=args.batch_size)
    build_cact_model(adapter_file, output_cact=args.out_cact)

