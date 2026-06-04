import tkinter as tk

def greet():
    name = entry1.get()
    age = entry2.get()
    print(f"Здравствуйте, {name}! Вам {age} лет.")

root = tk.Tk()
tk.Label(root, text="Имя").pack()
entry1 = tk.Entry(root)
entry1.pack()
tk.Label(root, text="Возраст").pack()
entry2 = tk.Entry(root)
entry2.pack()
tk.Button(root, text="Приветствие", command=greet).pack()
root.mainloop()
