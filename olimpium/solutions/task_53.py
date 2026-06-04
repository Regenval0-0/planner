import tkinter as tk

def greet():
    name = entry.get()
    if name == "Алиса":
        label.config(text="Добро пожаловать, Алиса!")
    else:
        label.config(text=f"Здравствуйте, {name}!")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
label = tk.Label(root, text="")
label.pack()
tk.Button(root, text="Приветствие", command=greet).pack()
root.mainloop()
