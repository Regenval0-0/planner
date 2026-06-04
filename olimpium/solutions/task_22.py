import sys

nums = sorted([int(x) for x in sys.argv[1:]], reverse=True)
print(" ".join(str(x) for x in nums))
