import tkinter as tk

def show():
    print(entry.get())

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Показать", command=show).pack()
root.mainloop()
