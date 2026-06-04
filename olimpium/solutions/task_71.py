import os

for item in os.listdir("."):
    if item.endswith(".txt"):
        new_name = "архив_" + item
        os.rename(item, new_name)
        print(f"{item} -> {new_name}")
