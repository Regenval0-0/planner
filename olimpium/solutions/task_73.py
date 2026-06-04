import re

text = "Напишите нам на email@example.com или support@site.ru"
emails = re.findall(r'[\w.+-]+@[\w-]+\.[\w.-]+', text)
print(emails)
