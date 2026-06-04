import sys

words = sorted(sys.argv[1:], key=len)
print(" ".join(words))
