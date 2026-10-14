"""
URL configuration for Yinga project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include

from apps.yinga_app.views import health_check

urlpatterns = [
    path('health/', health_check, name='health-check-root'),
    path('api/health/', health_check, name='health-check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('apps.accounts.urls')),
    path('api/payments/', include('apps.payments.urls')),
    path('api/', include('apps.courses.urls')),
    path('api/', include('apps.students.urls')),
    path('api/', include('apps.progress.urls')),
    path('api/instructor/', include('apps.instructors.urls')),
]

from django.conf import settings
from django.urls import re_path
from apps.courses.media_views import serve_media_with_range

if settings.DEBUG:
    # Range-aware media serving (needed for video seeking / resume playback)
    urlpatterns += [
        re_path(r'^media/(?P<path>.*)$', serve_media_with_range, name='media'),
    ]
