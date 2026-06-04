import sys

word = input()
indices = [str(i) for i, arg in enumerate(sys.argv[1:], 0) if arg == word]
if indices:
    print(" ".join(indices))
else:
    print("Не найдено")
