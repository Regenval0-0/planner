import tkinter as tk

def greet():
    name = entry.get()
    label.config(text=f"Здравствуйте, {name}!")

root = tk.Tk()
label = tk.Label(root, text="Введите ваше имя")
label.pack()
entry = tk.Entry(root)
entry.pack()
tk.Button(root, text="Поздороваться", command=greet).pack()
root.mainloop()
