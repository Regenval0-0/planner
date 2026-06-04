with open("текст.txt", 'r', encoding='utf-8') as f:
    text = f.read()
    words = text.split()
    print(len(words))
