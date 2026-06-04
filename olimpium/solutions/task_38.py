import tkinter as tk

def say_hello():
    print("Привет!")

def say_bye():
    print("Пока!")

root = tk.Tk()
tk.Button(root, text="Привет", command=say_hello).pack()
tk.Button(root, text="Пока", command=say_bye).pack()
root.mainloop()
