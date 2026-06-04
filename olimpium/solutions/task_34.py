import tkinter as tk

def greet():
    print("Здравствуйте!")

root = tk.Tk()
btn = tk.Button(root, text="Поздороваться", command=greet)
btn.pack()
root.mainloop()
