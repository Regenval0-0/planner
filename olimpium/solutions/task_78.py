with open("черновик.txt", 'r', encoding='utf-8') as fin, open("чисто.txt", 'w', encoding='utf-8') as fout:
    for line in fin:
        if line.strip():
            fout.write(line)
