import sys

a = int(sys.argv[1])
b = int(sys.argv[2])
if a % b == 0:
    print(f"{a} делится на {b}")
else:
    print(f"Остаток: {a % b}")
