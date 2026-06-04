import tkinter as tk

def clear_all():
    for widget in root.winfo_children():
        widget.destroy()

root = tk.Tk()
tk.Label(root, text="Пример").pack()
tk.Button(root, text="Очистить окно", command=clear_all).pack()
root.mainloop()
