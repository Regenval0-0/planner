import sys

letter = input()
result = [w for w in sys.argv[1:] if w.startswith(letter)]
print(" ".join(result))
