with open("текст.txt", 'r', encoding='utf-8') as f:
    for line in f:
        if len(line.strip()) > 40:
            print(line.strip())
