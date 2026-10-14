import os

os.environ.setdefault('DJANGO_DEBUG', 'True')

from .settings import *

if not DEBUG:
    raise RuntimeError('settings_dev requires DJANGO_DEBUG=True.')