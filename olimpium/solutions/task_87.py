import re

with open("данные.txt", 'r', encoding='utf-8') as fin, open("с_цифрами.txt", 'w', encoding='utf-8') as fout:
    for line in fin:
        if re.search(r'\d', line):
            fout.write(line)
