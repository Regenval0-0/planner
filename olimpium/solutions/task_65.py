import re

text = "В 2024 году было 5 новых проектов и 12 задач."
result = re.sub(r'\d', '#', text)
print(result)
