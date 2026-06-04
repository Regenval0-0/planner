import sys

nums = [int(x) for x in sys.argv[1:]]
evens = [str(x) for x in nums if x % 2 == 0]
print(" ".join(evens))
