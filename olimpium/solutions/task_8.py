import sys

phrase = sys.argv[1]
count = int(sys.argv[2])
for i in range(1, count + 1):
    print(f"{i}. {phrase}")
