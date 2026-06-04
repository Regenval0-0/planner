import tkinter as tk

def show():
    label.config(text=entry.get())

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
label = tk.Label(root, text="")
label.pack()
tk.Button(root, text="Показать", command=show).pack()
root.mainloop()
