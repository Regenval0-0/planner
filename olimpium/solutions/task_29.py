import sys

nums = [int(x) for x in sys.argv[1:]]
print(" ".join(str(x**2) for x in nums))
