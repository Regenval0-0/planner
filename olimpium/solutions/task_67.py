import os

if os.path.exists("данные.csv"):
    print("Файл существует")
else:
    print("Файл не найден")
