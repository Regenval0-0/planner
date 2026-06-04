n = int(input())
with open("инфо.txt", 'r', encoding='utf-8') as f:
    lines = f.readlines()
    for line in lines[:n]:
        print(line.strip())
