import os

for item in os.listdir("."):
    if item.endswith(".txt"):
        print(item)
