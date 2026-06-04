with open("текст.txt", 'r', encoding='utf-8') as fin, open("чистый_текст.txt", 'w', encoding='utf-8') as fout:
    for line in fin:
        if "черновик" not in line:
            fout.write(line)
