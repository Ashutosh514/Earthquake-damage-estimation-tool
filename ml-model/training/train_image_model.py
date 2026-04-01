from __future__ import annotations

import random
import shutil
from pathlib import Path

import pandas as pd
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix

layers = tf.keras.layers
models = tf.keras.models
MobileNetV2 = tf.keras.applications.MobileNetV2
ImageDataGenerator = tf.keras.preprocessing.image.ImageDataGenerator

CLASSES = [
    "No_Damage",
    "Very_Light",
    "Light",
    "Minor",
    "Moderate",
    "Moderately_Severe",
    "Severe",
    "Very_Severe",
    "Destructive",
]

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".gif", ".webp", ".tif", ".tiff"}
SEED = 42


def class_from_damage_index(value: float) -> str:
    # 9-level mapping by damage index range [0, 1].
    if value < 0.10:
        return "No_Damage"
    if value < 0.20:
        return "Very_Light"
    if value < 0.30:
        return "Light"
    if value < 0.40:
        return "Minor"
    if value < 0.50:
        return "Moderate"
    if value < 0.65:
        return "Moderately_Severe"
    if value < 0.80:
        return "Severe"
    if value < 0.90:
        return "Very_Severe"
    return "Destructive"


def ensure_structure(split_dir: Path) -> None:
    split_dir.mkdir(parents=True, exist_ok=True)
    for cls in CLASSES:
        (split_dir / cls).mkdir(parents=True, exist_ok=True)
    (split_dir / "unclassified").mkdir(parents=True, exist_ok=True)


def collect_all_images(images_root: Path) -> list[Path]:
    all_files: list[Path] = []
    for split_name in ("train", "test"):
        split_dir = images_root / split_name
        if not split_dir.exists():
            continue
        for p in split_dir.rglob("*"):
            if p.is_file() and p.suffix.lower() in IMAGE_EXTENSIONS:
                all_files.append(p)
    return all_files


def clear_split_folders(split_dir: Path) -> None:
    for cls in CLASSES:
        class_dir = split_dir / cls
        if class_dir.exists():
            for p in class_dir.iterdir():
                if p.is_file():
                    p.unlink()
    unclassified_dir = split_dir / "unclassified"
    if unclassified_dir.exists():
        for p in unclassified_dir.iterdir():
            if p.is_file():
                p.unlink()


def unique_target_path(dest_dir: Path, filename: str) -> Path:
    target = dest_dir / filename
    if not target.exists():
        return target
    stem = target.stem
    suffix = target.suffix
    i = 1
    while True:
        candidate = dest_dir / f"{stem}_{i}{suffix}"
        if not candidate.exists():
            return candidate
        i += 1


def stratified_split_and_arrange(images_root: Path, labels_df: pd.DataFrame, test_ratio: float = 0.2) -> None:
    train_dir = images_root / "train"
    test_dir = images_root / "test"
    ensure_structure(train_dir)
    ensure_structure(test_dir)

    all_images = collect_all_images(images_root)
    if not all_images:
        raise RuntimeError("No input images found under dataset/images/train or dataset/images/test")

    # Stage all images to a temp pool first so we can safely clear/rebuild split folders.
    pool_dir = images_root / "_pool"
    if pool_dir.exists():
        shutil.rmtree(pool_dir)
    pool_dir.mkdir(parents=True, exist_ok=True)

    staged_images: list[Path] = []
    for src in all_images:
        staged = unique_target_path(pool_dir, src.name)
        shutil.move(str(src), str(staged))
        staged_images.append(staged)

    # Group image files by class label from CSV + filename index.
    class_buckets: dict[str, list[Path]] = {cls: [] for cls in CLASSES}
    unclassified: list[Path] = []

    for img_path in staged_images:
        stem = img_path.stem.strip()
        if not stem.isdigit():
            unclassified.append(img_path)
            continue
        idx = int(stem)
        if idx >= len(labels_df):
            unclassified.append(img_path)
            continue
        damage_index = float(labels_df.iloc[idx]["Damage_Index"])
        cls = class_from_damage_index(damage_index)
        class_buckets[cls].append(img_path)

    clear_split_folders(train_dir)
    clear_split_folders(test_dir)

    rng = random.Random(SEED)
    for cls in CLASSES:
        files = class_buckets[cls]
        rng.shuffle(files)
        n = len(files)
        if n == 0:
            continue
        if n == 1:
            train_part, test_part = files, []
        else:
            n_test = max(1, int(round(n * test_ratio)))
            n_test = min(n_test, n - 1)
            test_part = files[:n_test]
            train_part = files[n_test:]

        for src in train_part:
            target = unique_target_path(train_dir / cls, src.name)
            shutil.move(str(src), str(target))
        for src in test_part:
            target = unique_target_path(test_dir / cls, src.name)
            shutil.move(str(src), str(target))

    for src in unclassified:
        # Put unknowns under train/unclassified for manual review.
        target = unique_target_path(train_dir / "unclassified", src.name)
        shutil.move(str(src), str(target))
        print(f"WARNING: unclassified image: {src.name}")

    # Cleanup temporary pool directory when done.
    if pool_dir.exists():
        shutil.rmtree(pool_dir)


def print_split_counts(split_dir: Path) -> dict[str, int]:
    counts: dict[str, int] = {}
    for cls in CLASSES:
        class_dir = split_dir / cls
        count = len([p for p in class_dir.iterdir() if p.is_file()]) if class_dir.exists() else 0
        counts[cls] = count
    unclassified_dir = split_dir / "unclassified"
    counts["unclassified"] = len([p for p in unclassified_dir.iterdir() if p.is_file()]) if unclassified_dir.exists() else 0

    print(f"\n{split_dir.name} counts:")
    for key, value in counts.items():
        print(f"- {key}: {value}")
    return counts


def build_model(num_classes: int) -> tf.keras.Model:
    # Transfer learning backbone. If ImageNet weights are unavailable, fallback to random init.
    try:
        base = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights="imagenet")
        print("Using MobileNetV2 with ImageNet weights.")
    except Exception as exc:
        print(f"WARNING: Could not load ImageNet weights ({exc}). Falling back to random initialization.")
        base = MobileNetV2(input_shape=(224, 224, 3), include_top=False, weights=None)

    base.trainable = False

    model = models.Sequential(
        [
            layers.Input(shape=(224, 224, 3)),
            base,
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation="relu"),
            layers.Dropout(0.4),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])
    return model


def compute_class_weights(train_counts: dict[str, int], used_classes: list[str]) -> dict[int, float]:
    total = sum(train_counts[cls] for cls in used_classes)
    n_classes = len(used_classes)
    weights: dict[int, float] = {}
    for idx, cls in enumerate(used_classes):
        count = train_counts[cls]
        # inverse frequency: N / (K * n_c)
        weights[idx] = (total / (n_classes * count)) if count > 0 else 1.0
    return weights


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    dataset_root = (script_dir / ".." / "dataset").resolve()
    images_root = dataset_root / "images"
    train_dir = images_root / "train"
    test_dir = images_root / "test"
    csv_path = dataset_root / "earthquake_data.csv"
    model_out = (script_dir / ".." / "models" / "image_model.h5").resolve()
    report_out = (script_dir / ".." / "models" / "image_model_classification_report.txt").resolve()
    conf_out = (script_dir / ".." / "models" / "image_model_confusion_matrix.csv").resolve()

    if not csv_path.exists():
        raise FileNotFoundError(f"CSV not found: {csv_path}")

    labels_df = pd.read_csv(csv_path)
    if "Damage_Index" not in labels_df.columns:
        raise RuntimeError("CSV must contain Damage_Index column.")

    print("Preparing dataset with stratified class split...")
    stratified_split_and_arrange(images_root, labels_df, test_ratio=0.2)

    train_counts = print_split_counts(train_dir)
    test_counts = print_split_counts(test_dir)

    if sum(train_counts[c] for c in CLASSES) == 0 or sum(test_counts[c] for c in CLASSES) == 0:
        raise RuntimeError("No classified images found in train/test after preparation.")

    # Train only on classes that have data in both train and test splits.
    used_classes = [c for c in CLASSES if train_counts[c] > 0 and test_counts[c] > 0]
    if len(used_classes) < 2:
        raise RuntimeError("Need at least 2 classes with data in both train and test.")
    print(f"\nTraining classes: {used_classes}")

    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        rotation_range=20,
        zoom_range=0.2,
        horizontal_flip=True,
    )
    test_datagen = ImageDataGenerator(rescale=1.0 / 255)

    train_data = train_datagen.flow_from_directory(
        str(train_dir),
        classes=used_classes,
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        shuffle=True,
        seed=SEED,
    )

    test_data = test_datagen.flow_from_directory(
        str(test_dir),
        classes=used_classes,
        target_size=(224, 224),
        batch_size=32,
        class_mode="categorical",
        shuffle=False,
    )

    model = build_model(num_classes=len(used_classes))
    class_weights = compute_class_weights(train_counts, used_classes)
    print(f"Class weights: {class_weights}")

    print("\nTraining image model...")
    model.fit(train_data, epochs=12, validation_data=test_data, class_weight=class_weights)

    print("\nEvaluating and generating confusion matrix...")
    y_prob = model.predict(test_data, verbose=0)
    y_pred = y_prob.argmax(axis=1)
    y_true = test_data.classes

    cm = confusion_matrix(y_true, y_pred)
    cm_df = pd.DataFrame(cm, index=used_classes, columns=used_classes)
    report = classification_report(y_true, y_pred, target_names=used_classes, digits=4, zero_division=0)

    model_out.parent.mkdir(parents=True, exist_ok=True)
    model.save(str(model_out))
    cm_df.to_csv(conf_out)
    report_out.write_text(report, encoding="utf-8")

    print(f"\nConfusion matrix saved at: {conf_out}")
    print(f"Classification report saved at: {report_out}")
    print(f"Image model trained successfully. Saved at: {model_out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())