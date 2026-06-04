import tkinter as tk

count = 0

def click():
    global count
    count += 1
    label.config(text=f"Вы нажали: {count} раз.")

root = tk.Tk()
label = tk.Label(root, text="Вы нажали: 0 раз.")
label.pack()
tk.Button(root, text="Нажми меня", command=click).pack()
root.mainloop()
