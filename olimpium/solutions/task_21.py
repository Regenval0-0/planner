import sys

nums = sorted([int(x) for x in sys.argv[1:]])
print(" ".join(str(x) for x in nums))
