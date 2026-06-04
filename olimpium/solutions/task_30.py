import sys

nums = [int(x) for x in sys.argv[1:]]
result = sorted([x for x in nums if x > 3], reverse=True)
print(" ".join(str(x) for x in result))
