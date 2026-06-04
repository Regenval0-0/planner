import os

if os.path.exists("временный.txt"):
    os.remove("временный.txt")
    print("Файл удалён")
else:
    print("Файл не найден")
