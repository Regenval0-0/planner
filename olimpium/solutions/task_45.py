import tkinter as tk

def check():
    try:
        n = int(entry.get())
        if n % 2 == 0:
            label.config(text="Чётное")
        else:
            label.config(text="Нечётное")
    except ValueError:
        label.config(text="Ошибка")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Проверить", command=check).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
