lines = ["Первая строка", "Вторая строка", "Третья строка"]
with open("result.txt", 'w', encoding='utf-8') as f:
    f.writelines(lines)
