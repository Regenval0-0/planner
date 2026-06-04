import sys

a = float(sys.argv[1])
b = float(sys.argv[2])
op = sys.argv[3]
if op == "+":
    print(a + b)
elif op == "-":
    print(a - b)
elif op == "*":
    print(a * b)
elif op == "/":
    if b == 0:
        print("Ошибка: деление на ноль")
    else:
        print(a / b)
else:
    print("Ошибка: неизвестная операция")
