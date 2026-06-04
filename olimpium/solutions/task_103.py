import os
import tkinter as tk

def check():
    name = entry.get()
    if os.path.exists(name):
        label.config(text="Файл существует")
    else:
        label.config(text="Файл не найден")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Проверить", command=check).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
