"""
Dataset Mixer untuk Multilingual Preservation (Anti-Catastrophic Forgetting)
Mencampurkan dataset Bahasa Indonesia baru dengan Replay Buffer dari bahasa asli (English, dll.)
sehingga model Whistle tidak kehilangan kemampuan bahasa sebelumnya setelah dituning.
"""

import os
import json
import random
from typing import List, Dict, Any

def mix_multilingual_datasets(
    id_jsonl_path: str,
    original_replay_jsonl_path: str,
    output_train_path: str,
    output_val_path: str,
    target_ratio_id: float = 0.75,
    val_split: float = 0.1,
    seed: int = 42
) -> Dict[str, int]:
    """
    Menggabungkan dataset target (Bahasa Indonesia) dengan data jangkar (Replay Buffer bahasa asli).
    - target_ratio_id: 0.75 artinya 75% data adalah Bahasa Indonesia, 25% data bahasa sebelumnya (EN, DE, FR, dll.)
    - val_split: 0.1 artinya 10% data disisihkan untuk validasi/evaluasi.
    """
    random.seed(seed)

    print(f"[*] Membaca dataset Bahasa Indonesia dari: {id_jsonl_path}")
    id_records: List[Dict[str, Any]] = []
    if os.path.exists(id_jsonl_path):
        with open(id_jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    item = json.loads(line)
                    item['language'] = 'id'
                    id_records.append(item)
    print(f"    Total sampel ID: {len(id_records)}")

    print(f"[*] Membaca dataset Replay bahasa asli dari: {original_replay_jsonl_path}")
    replay_records: List[Dict[str, Any]] = []
    if os.path.exists(original_replay_jsonl_path):
        with open(original_replay_jsonl_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line:
                    item = json.loads(line)
                    if 'language' not in item:
                        item['language'] = 'en'
                    replay_records.append(item)
    print(f"    Total sampel Replay (EN dsb): {len(replay_records)}")

    # Hitung jumlah sampel agar rasio seimbang
    if len(id_records) == 0:
        raise ValueError("Dataset Bahasa Indonesia tidak boleh kosong!")

    # Jika replay buffer lebih banyak, subsample sesuai rasio
    # Misal: 75% ID, 25% Replay -> replay_count = id_count * (0.25 / 0.75) = id_count / 3
    if len(replay_records) > 0:
        desired_replay_count = int(len(id_records) * ((1.0 - target_ratio_id) / target_ratio_id))
        if len(replay_records) > desired_replay_count:
            selected_replay = random.sample(replay_records, desired_replay_count)
        else:
            # Jika data replay lebih sedikit, gunakan seluruh data replay yang ada
            selected_replay = replay_records
    else:
        print("[PERINGATAN] Replay dataset tidak ditemukan. Pelatihan murni ID berisiko menurunkan akurasi bahasa lain.")
        selected_replay = []

    # Gabung dan acak
    combined = id_records + selected_replay
    random.shuffle(combined)

    # Split train dan validation
    val_size = int(len(combined) * val_split)
    val_set = combined[:val_size]
    train_set = combined[val_size:]

    # Tulis file output
    print(f"[*] Menyimpan {len(train_set)} data pelatihan ke: {output_train_path}")
    with open(output_train_path, 'w', encoding='utf-8') as f:
        for item in train_set:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    print(f"[*] Menyimpan {len(val_set)} data evaluasi ke: {output_val_path}")
    with open(output_val_path, 'w', encoding='utf-8') as f:
        for item in val_set:
            f.write(json.dumps(item, ensure_ascii=False) + '\n')

    stats = {
        "total_id": len(id_records),
        "total_replay": len(selected_replay),
        "train_count": len(train_set),
        "val_count": len(val_set)
    }
    print(f"[SUKSES] Dataset multilingual seimbang siap: {stats}")
    return stats

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(description="Campurkan dataset ID dengan data bahasa asli untuk anti-forgetting")
    parser.add_argument("--id-data", default="data_id.jsonl", help="Dataset Bahasa Indonesia")
    parser.add_argument("--replay-data", default="data_replay.jsonl", help="Dataset Replay (English / Original Languages)")
    parser.add_argument("--out-train", default="train_multilingual.jsonl", help="Output train JSONL")
    parser.add_argument("--out-val", default="val_multilingual.jsonl", help="Output val JSONL")
    parser.add_argument("--id-ratio", type=float, default=0.75, help="Rasio data ID (default: 0.75 / 75%)")
    args = parser.parse_args()

    mix_multilingual_datasets(
        id_jsonl_path=args.id_data,
        original_replay_jsonl_path=args.replay_data,
        output_train_path=args.out_train,
        output_val_path=args.out_val,
        target_ratio_id=args.id_ratio
    )

