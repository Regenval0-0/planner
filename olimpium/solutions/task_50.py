import tkinter as tk

def clear():
    entry.delete(0, tk.END)

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Очистить", command=clear).pack()
root.mainloop()
