import tkinter as tk

def divide():
    try:
        a = float(entry1.get())
        b = float(entry2.get())
        if b == 0:
            label.config(text="Деление на ноль!")
        else:
            label.config(text=f"Результат: {a / b}")
    except ValueError:
        label.config(text="Ошибка")

root = tk.Tk()
tk.Label(root, text="Делимое").pack()
entry1 = tk.Entry(root)
entry1.pack()
tk.Label(root, text="Делитель").pack()
entry2 = tk.Entry(root)
entry2.pack()
tk.Button(root, text="Разделить", command=divide).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
