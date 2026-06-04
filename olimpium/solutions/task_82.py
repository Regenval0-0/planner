import re

with open("журнал.txt", 'r', encoding='utf-8') as f:
    for line in f:
        if re.search(r'\d{2}\.\d{2}\.\d{4}', line):
            print(line.strip())
