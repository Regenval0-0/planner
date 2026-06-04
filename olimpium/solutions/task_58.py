import tkinter as tk

def show():
    name = entry1.get()
    subject = entry2.get()
    grade = entry3.get()
    label.config(text=f"{name} получил(а) по {subject} оценку {grade}.")

root = tk.Tk()
tk.Label(root, text="Имя").pack()
entry1 = tk.Entry(root)
entry1.pack()
tk.Label(root, text="Предмет").pack()
entry2 = tk.Entry(root)
entry2.pack()
tk.Label(root, text="Оценка").pack()
entry3 = tk.Entry(root)
entry3.pack()
tk.Button(root, text="Показать", command=show).pack()
label = tk.Label(root, text="")
label.pack()
root.mainloop()
