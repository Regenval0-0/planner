import os

with open("сводка.txt", 'w', encoding='utf-8') as f:
    for item in os.listdir("."):
        if item.endswith(".txt"):
            with open(item, 'r', encoding='utf-8') as fin:
                lines = len(fin.readlines())
            f.write(f"{item}: {lines} строк
")
