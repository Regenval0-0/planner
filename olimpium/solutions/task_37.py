import tkinter as tk

def greet():
    name = entry.get()
    print(f"Привет, {name}!")

root = tk.Tk()
tk.Label(root, text="Введите имя").pack()
entry = tk.Entry(root)
entry.pack()
btn = tk.Button(root, text="Приветствие", command=greet)
btn.pack()
root.mainloop()
