import tkinter as tk

def calc():
    try:
        n = float(entry.get())
        label.config(text=f"Квадрат числа: {n**2}")
    except ValueError:
        label.config(text="Ошибка: введите число")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Посчитать квадрат", command=calc).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
