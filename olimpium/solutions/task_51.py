import tkinter as tk

def change():
    label.config(fg="red")

root = tk.Tk()
label = tk.Label(root, text="Пример текста")
label.pack()
tk.Button(root, text="Изменить цвет", command=change).pack()
root.mainloop()
