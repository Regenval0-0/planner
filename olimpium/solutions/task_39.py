import tkinter as tk

def change():
    label.config(text="Текст изменён!")

root = tk.Tk()
label = tk.Label(root, text="Начальный текст")
label.pack()
tk.Button(root, text="Изменить", command=change).pack()
root.mainloop()
