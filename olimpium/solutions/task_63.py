import os

for item in os.listdir("."):
    if item.endswith(".txt"):
        with open(item, 'r', encoding='utf-8') as f:
            lines = f.readlines()
        print(f"{item}: {len(lines)} строк")
