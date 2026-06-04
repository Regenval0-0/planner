import sys

nums = [int(x) for x in sys.argv[1:]]
result = [str(x) for x in nums if x > 10]
print(" ".join(result))
