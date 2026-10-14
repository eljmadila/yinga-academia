import os

os.environ.setdefault('DJANGO_DEBUG', 'False')

from .settings import *

if DEBUG:
    raise RuntimeError('settings_prod requires DJANGO_DEBUG=False.')