import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "yinga_project.settings")
django.setup()

from django.contrib.auth import get_user_model
from apps.courses.models import Course
from rest_framework.test import APIRequestFactory, force_authenticate
from apps.payments.views import create_checkout_session
import json

User = get_user_model()
user = User.objects.first()
course = Course.objects.first()

if not user or not course:
    print("No user or course found")
else:
    factory = APIRequestFactory()
    request = factory.post('/api/payments/create-checkout-session/', json.dumps({'course_id': str(course.id)}), content_type='application/json')
    force_authenticate(request, user=user)
    try:
        response = create_checkout_session(request)
        print("Response status:", response.status_code)
        if hasattr(response, 'render'):
            response.render()
        print("Response data:", response.content.decode('utf-8'))
    except Exception as e:
        import traceback
        traceback.print_exc()
