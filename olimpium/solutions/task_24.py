import sys

words = sorted(sys.argv[1:], key=lambda x: x[-1])
print(" ".join(words))
