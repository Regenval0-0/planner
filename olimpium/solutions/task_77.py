import os

with open("объединено.txt", 'w', encoding='utf-8') as fout:
    for item in os.listdir("."):
        if item.endswith(".txt"):
            with open(item, 'r', encoding='utf-8') as fin:
                fout.write(f"--- {item} ---
")
                fout.write(fin.read())
                fout.write("
")
