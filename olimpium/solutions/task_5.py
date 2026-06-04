import sys

if len(sys.argv) < 3:
    print("Ошибка: нужно передать минимум два аргумента")
else:
    print(f"Аргументов: {len(sys.argv) - 1}")
