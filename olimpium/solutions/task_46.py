import tkinter as tk

def add():
    try:
        a = float(entry1.get())
        b = float(entry2.get())
        label.config(text=f"Сумма: {a + b}")
    except ValueError:
        label.config(text="Ошибка: введите числа")

root = tk.Tk()
entry1 = tk.Entry(root)
entry1.pack()
entry2 = tk.Entry(root)
entry2.pack()
tk.Button(root, text="Сложить", command=add).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
