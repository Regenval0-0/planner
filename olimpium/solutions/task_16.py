import sys

for i, arg in enumerate(sys.argv[1:], 1):
    print(f"{i}. {arg}")
