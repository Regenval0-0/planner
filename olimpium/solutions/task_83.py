import os

files = sorted([f for f in os.listdir(".") if os.path.isfile(f)])
with open("список.txt", 'w', encoding='utf-8') as f:
    for fname in files:
        f.write(fname + "")
