import tkinter as tk

def clear():
    label.config(text="")

root = tk.Tk()
label = tk.Label(root, text="Пример текста")
label.pack()
tk.Button(root, text="Очистить", command=clear).pack()
root.mainloop()
