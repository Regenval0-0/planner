import os
from collections import Counter

exts = []
for item in os.listdir("."):
    if os.path.isfile(item):
        _, ext = os.path.splitext(item)
        if ext:
            exts.append(ext)

for ext, count in Counter(exts).items():
    print(f"{ext} — {count} файлов")
