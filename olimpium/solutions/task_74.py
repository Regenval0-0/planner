with open("замены.txt", 'r', encoding='utf-8') as fin, open("исправлено.txt", 'w', encoding='utf-8') as fout:
    text = fin.read()
    text = text.replace("ошибка", "исправление")
    fout.write(text)
