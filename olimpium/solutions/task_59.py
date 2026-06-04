import tkinter as tk

def check():
    try:
        n = int(entry.get())
        if n > 10:
            label.config(text="Больше 10", fg="green")
        else:
            label.config(text="10 или меньше", fg="blue")
    except ValueError:
        label.config(text="Ошибка")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Проверить", command=check).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
