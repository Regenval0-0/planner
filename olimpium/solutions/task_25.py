import sys

word = input()
if word in sys.argv[1:]:
    print("Найдено")
else:
    print("Не найдено")
