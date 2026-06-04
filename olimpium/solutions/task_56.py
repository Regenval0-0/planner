import tkinter as tk

def toggle():
    if btn.cget("text") == "Включить":
        btn.config(text="Выключить")
    else:
        btn.config(text="Включить")

root = tk.Tk()
btn = tk.Button(root, text="Включить", command=toggle)
btn.pack()
root.mainloop()
