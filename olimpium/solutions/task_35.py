import tkinter as tk

def greet():
    name = entry.get()
    print(f"Здравствуйте, {name}!")

root = tk.Tk()
entry = tk.Entry(root)
entry.pack()
btn = tk.Button(root, text="Приветствие", command=greet)
btn.pack()
root.mainloop()
