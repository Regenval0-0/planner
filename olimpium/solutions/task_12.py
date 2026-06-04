import sys

try:
    n = int(sys.argv[1])
    print(n)
except (IndexError, ValueError):
    print("Ошибка: введите число")
