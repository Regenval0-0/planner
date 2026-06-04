with open("данные.txt", 'r', encoding='utf-8') as fin, open("отчёт.txt", 'w', encoding='utf-8') as fout:
    for line in fin:
        if "успешно" in line:
            fout.write(line)
