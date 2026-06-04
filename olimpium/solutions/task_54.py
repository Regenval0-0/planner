import tkinter as tk

def check():
    name = entry.get()
    if name in ["Анна", "Игорь", "Сергей"]:
        label.config(text="Имя найдено.")
    else:
        label.config(text="Нет такого имени.")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
label = tk.Label(root, text="")
label.pack()
tk.Button(root, text="Проверить", command=check).pack()
root.mainloop()
