count = 0
with open("текст.txt", 'r', encoding='utf-8') as f:
    for line in f:
        if "Python" in line:
            count += 1

with open("результат.txt", 'w', encoding='utf-8') as f:
    f.write(str(count))

print(count)
