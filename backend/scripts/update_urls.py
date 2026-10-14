import sys

file_path = 'yinga_project/urls.py'
with open(file_path, 'r') as f:
    content = f.read()

content = content.replace("path('api/', include('apps.progress.urls')),", "path('api/', include('apps.progress.urls')),\n    path('api/instructor/', include('apps.instructors.urls')),")

with open(file_path, 'w') as f:
    f.write(content)

print("Updated URLs")
