import os

count = 0
with open("итог.txt", 'w', encoding='utf-8') as fout:
    for item in os.listdir("."):
        if item.endswith(".txt"):
            with open(item, 'r', encoding='utf-8') as fin:
                for line in fin:
                    if "результат" in line:
                        fout.write(line)
                        count += 1

print(f"Обработка завершена. Строк найдено: {count}")
