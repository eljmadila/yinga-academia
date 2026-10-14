import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yinga_project.settings")
django.setup()

from django.contrib.auth import get_user_model
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.courses.views import CourseViewSet
import json

User = get_user_model()
user = User.objects.first()

factory = APIRequestFactory()
# The URL doesn't strictly matter for APIRequestFactory if we use the ViewSet directly
# But we need to use course ID aa731afb-d875-4a46-bbe6-889e420199ee
request = factory.get('/api/courses/aa731afb-d875-4a46-bbe6-889e420199ee/', HTTP_HOST='localhost:8000')
force_authenticate(request, user=user)

view = CourseViewSet.as_view({'get': 'retrieve'})
response = view(request, pk='aa731afb-d875-4a46-bbe6-889e420199ee')
response.render()

data = json.loads(response.content.decode('utf-8'))

print("Course found:", data.get('title'))
modules = data.get('modules', [])
print("Modules count:", len(modules))

for m in modules:
    print(f" Module: {m.get('title')}")
    lessons = m.get('lessons', [])
    for l in lessons:
        if str(l.get('id')) == '12b0b43a-dfc9-45dd-b741-086e519532b0':
            print(f"   Lesson [TARGET]: {l.get('title')}")
            print(f"     video_url: {l.get('video_url')}")
            print(f"     video_media: {l.get('video_media')}")
        else:
            print(f"   Lesson: {l.get('title')} (id: {l.get('id')})")

