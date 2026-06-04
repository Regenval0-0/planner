import tkinter as tk

def change_bg():
    root.configure(bg="yellow")

root = tk.Tk()
tk.Button(root, text="Изменить фон", command=change_bg).pack()
root.mainloop()
