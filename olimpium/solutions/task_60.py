import tkinter as tk

def show():
    name = entry1.get()
    age = entry2.get()
    label.config(text=f"Здравствуйте, {name}! Вам {age} лет.")

root = tk.Tk()
tk.Label(root, text="Имя").pack()
entry1 = tk.Entry(root)
entry1.pack()
tk.Label(root, text="Возраст").pack()
entry2 = tk.Entry(root)
entry2.pack()
tk.Button(root, text="Показать", command=show).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
