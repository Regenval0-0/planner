import tkinter as tk

def reverse():
    text = entry.get()
    label.config(text=text[::-1])

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
label = tk.Label(root, text="")
label.pack()
tk.Button(root, text="Перевернуть", command=reverse).pack()
root.mainloop()
