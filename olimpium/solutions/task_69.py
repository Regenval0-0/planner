with open("оригинал.txt", 'r', encoding='utf-8') as fin, open("копия.txt", 'w', encoding='utf-8') as fout:
    fout.write(fin.read())
