with open("вход.txt", 'r', encoding='utf-8') as fin, open("выход.txt", 'w', encoding='utf-8') as fout:
    text = fin.read()
    fout.write(text.replace(" ", "_"))
