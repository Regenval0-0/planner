with open("информация.txt", 'r', encoding='utf-8') as fin, open("важное.txt", 'w', encoding='utf-8') as fout:
    for line in fin:
        if "важно" in line:
            fout.write(line)
