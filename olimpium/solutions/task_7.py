import sys

try:
    a = float(sys.argv[1])
    b = float(sys.argv[2])
    if b == 0:
        print("Ошибка: деление на ноль")
    else:
        print(a / b)
except (IndexError, ValueError):
    print("Ошибка: введите два числа")
