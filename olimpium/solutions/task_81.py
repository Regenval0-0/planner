import os
from collections import Counter

exts = []
for item in os.listdir("."):
    if os.path.isfile(item):
        _, ext = os.path.splitext(item)
        if ext:
            exts.append(ext)

with open("отчёт_по_типам.txt", 'w', encoding='utf-8') as f:
    for ext, count in Counter(exts).items():
        f.write(f"{ext} — {count} файлов")
