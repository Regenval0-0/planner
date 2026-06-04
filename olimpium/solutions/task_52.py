import tkinter as tk

def change():
    label.config(font=("Arial", 18))

root = tk.Tk()
label = tk.Label(root, text="Пример текста")
label.pack()
tk.Button(root, text="Изменить шрифт", command=change).pack()
root.mainloop()
