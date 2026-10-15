import os
from pathlib import Path
from urllib.parse import unquote, urlparse
from dotenv import load_dotenv

load_dotenv()

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/

def env_bool(name, default):
    return os.getenv(name, str(default)).lower() in {"true", "1", "yes"}


def env_list(name, default=""):
    return [item.strip() for item in os.getenv(name, default).split(",") if item.strip()]


DEBUG = env_bool("DJANGO_DEBUG", True)
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY")
if not SECRET_KEY:
    if not DEBUG:
        raise RuntimeError("DJANGO_SECRET_KEY must be configured when DEBUG is disabled.")
    SECRET_KEY = "django-insecure-local-development-only"

ALLOWED_HOSTS = env_list("DJANGO_ALLOWED_HOSTS", "localhost,127.0.0.1,backend")
if not DEBUG and not os.getenv("DJANGO_ALLOWED_HOSTS"):
    raise RuntimeError("DJANGO_ALLOWED_HOSTS must be configured when DEBUG is disabled.")


# Application definition

INSTALLED_APPS = [
    'unfold',
    'unfold.contrib.filters',
    'unfold.contrib.forms',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'apps.yinga_app',
    'apps.accounts',
    'apps.courses',
    'apps.progress',
    'apps.students',
    'apps.instructors',
    'apps.payments',
    'rest_framework.authtoken',
    'allauth',
    'allauth.account',
    'allauth.socialaccount',
    'allauth.socialaccount.providers.google',
    'allauth.socialaccount.providers.facebook',
    'dj_rest_auth',
    'dj_rest_auth.registration',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
]

ROOT_URLCONF = 'yinga_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'yinga_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/6.1/ref/settings/#databases

database_url = os.getenv("DATABASE_URL")
if database_url:
    parsed_database_url = urlparse(database_url)
    if parsed_database_url.scheme not in {"postgres", "postgresql"}:
        raise RuntimeError("DATABASE_URL must use the postgres or postgresql scheme.")
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": unquote(parsed_database_url.path.lstrip("/")),
            "USER": unquote(parsed_database_url.username or ""),
            "PASSWORD": unquote(parsed_database_url.password or ""),
            "HOST": parsed_database_url.hostname or "",
            "PORT": parsed_database_url.port or "",
            "CONN_MAX_AGE": int(os.getenv("DB_CONN_MAX_AGE", "60")),
        }
    }
elif DEBUG:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
else:
    raise RuntimeError("DATABASE_URL must be configured when DEBUG is disabled.")


# Password validation
# https://docs.djangoproject.com/en/6.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/6.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/6.1/howto/static-files/

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
] if (BASE_DIR / 'static').exists() else []

CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    INSTALLED_APPS += [
        'cloudinary_storage',
        'cloudinary',
    ]
    CLOUDINARY_STORAGE = {
        'CLOUD_NAME': CLOUDINARY_CLOUD_NAME,
        'API_KEY': CLOUDINARY_API_KEY,
        'API_SECRET': CLOUDINARY_API_SECRET,
    }
    STORAGES = {
        "default": {
            "BACKEND": "cloudinary_storage.storage.MediaCloudinaryStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }
else:
    STORAGES = {
        "default": {
            "BACKEND": "django.core.files.storage.FileSystemStorage",
        },
        "staticfiles": {
            "BACKEND": "whitenoise.storage.CompressedStaticFilesStorage",
        },
    }

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# Email
EMAIL_BACKEND = os.getenv(
    "DJANGO_EMAIL_BACKEND",
    "django.core.mail.backends.console.EmailBackend" if DEBUG else "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.getenv("EMAIL_HOST", "")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", True)
EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")
DEFAULT_FROM_EMAIL = os.getenv("DEFAULT_FROM_EMAIL", "Yinga Academia <noreply@yingaacademia.com>")
SERVER_EMAIL = DEFAULT_FROM_EMAIL
if not DEBUG and EMAIL_BACKEND == "django.core.mail.backends.smtp.EmailBackend" and not EMAIL_HOST:
    raise RuntimeError("EMAIL_HOST must be configured for production SMTP email.")

AUTH_USER_MODEL = 'accounts.User'

REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'apps.accounts.serializers.UserSerializer'
}

UNFOLD = {
    'SITE_TITLE': 'Yinga Academia Admin',
    'SITE_HEADER': 'Yinga Academia',
    'SITE_URL': '/',
    'SITE_LOGO': '/static/yinga/logo-sidebar-expanded.png',
    'SITE_ICON': '/static/yinga/logo-yinga-icon.png',
    'SITE_FAVICONS': [
        {
            'rel': 'icon',
            'href': '/static/yinga/logo-yinga-icon.png',
            'type': 'image/png',
        },
    ],
    'COLORS': {
        'base': {
            '50': '#fcfcfd',
            '100': '#f9fafb',
            '200': '#f2f4f7',
            '300': '#e4e7ec',
            '400': '#d0d5dd',
            '500': '#98a2b3',
            '600': '#667085',
            '700': '#475467',
            '800': '#344054',
            '900': '#101828',
            '950': '#0c111d',
        },
        'primary': {
            '50': '#eff6ff',
            '100': '#dbeafe',
            '200': '#bfdbfe',
            '300': '#93c5fd',
            '400': '#60a5fa',
            '500': '#2563eb',
            '600': '#1d4ed8',
            '700': '#1e40af',
            '800': '#1e3a8a',
            '900': '#172554',
            '950': '#0f172a',
        },
    },
    'SHOW_HISTORY': True,
    'SHOW_LANGUAGES': False,
    'DASHBOARD_CALLBACK': 'yinga_project.dashboard.dashboard_callback',
    'SIDEBAR': {
        'show_search': True,
        'show_all_applications': False,
        'navigation': [
            {
                'title': 'Learning',
                'separator': True,
                'items': [
                    {'title': 'Courses', 'icon': 'school', 'link': '/admin/courses/course/'},
                    {'title': 'Lessons', 'icon': 'menu_book', 'link': '/admin/courses/lesson/'},
                    {'title': 'Progress', 'icon': 'insights', 'link': '/admin/progress/progress/'},
                ],
            },
            {
                'title': 'Community',
                'items': [
                    {'title': 'Users', 'icon': 'group', 'link': '/admin/accounts/user/'},
                    {'title': 'Enrollments', 'icon': 'how_to_reg', 'link': '/admin/students/enrollment/'},
                    {'title': 'Payments', 'icon': 'payments', 'link': '/admin/students/payment/'},
                ],
            },
        ],
    },
}

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'login': '5/minute',
        'registration': '3/hour',
        'password_reset': '3/hour',
        'mpesa_initiation': '3/minute',
    },
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'AUTH_HEADER_TYPES': ('Bearer',),
}

CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS", "http://localhost:3000")
CSRF_TRUSTED_ORIGINS = env_list("CSRF_TRUSTED_ORIGINS", "http://localhost:3000")
CORS_ALLOW_ALL_ORIGINS = DEBUG and env_bool("CORS_ALLOW_ALL_ORIGINS", False)
if not DEBUG and not CORS_ALLOWED_ORIGINS:
    raise RuntimeError("CORS_ALLOWED_ORIGINS must be configured when DEBUG is disabled.")

if DEBUG:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'yinga-development-cache',
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.db.DatabaseCache',
            'LOCATION': os.getenv('DJANGO_CACHE_TABLE', 'django_cache'),
        }
    }

SESSION_COOKIE_SECURE = not DEBUG
CSRF_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = env_bool("DJANGO_SECURE_SSL_REDIRECT", not DEBUG)
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
if not DEBUG and not SECURE_SSL_REDIRECT:
    raise RuntimeError("DJANGO_SECURE_SSL_REDIRECT must be enabled when DEBUG is disabled.")

SITE_ID = 1

AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
    'allauth.account.auth_backends.AuthenticationBackend',
]

REST_AUTH = {
    'USE_JWT': True,
    'JWT_AUTH_COOKIE': 'my-app-auth',
    'JWT_AUTH_REFRESH_COOKIE': 'my-refresh-token',
    'USER_DETAILS_SERIALIZER': 'apps.accounts.serializers.UserSerializer',
}

ACCOUNT_LOGIN_METHODS = {'email'}
ACCOUNT_SIGNUP_FIELDS = ['email*', 'password1*', 'password2*']
ACCOUNT_EMAIL_VERIFICATION = 'none'

SOCIALACCOUNT_PROVIDERS = {
    'google': {
        'APP': {
            'client_id': os.getenv('GOOGLE_CLIENT_ID', ''),
            'secret': os.getenv('GOOGLE_SECRET', ''),
            'key': ''
        },
        'SCOPE': [
            'profile',
            'email',
        ],
        'AUTH_PARAMS': {
            'access_type': 'online',
        }
    },
    'facebook': {
        'APP': {
            'client_id': os.getenv('FACEBOOK_CLIENT_ID', ''),
            'secret': os.getenv('FACEBOOK_SECRET', ''),
            'key': ''
        },
        'SCOPE': ['email', 'public_profile'],
        'METHOD': 'oauth2',
        'VERIFIED_EMAIL': False,
    }
}

MPESA_ENVIRONMENT = os.getenv('MPESA_ENVIRONMENT', 'sandbox' if DEBUG else '').lower()
MPESA_CONSUMER_KEY = os.getenv('MPESA_CONSUMER_KEY', '')
MPESA_CONSUMER_SECRET = os.getenv('MPESA_CONSUMER_SECRET', '')
MPESA_SHORTCODE = os.getenv('MPESA_SHORTCODE', '')
MPESA_PASSKEY = os.getenv('MPESA_PASSKEY', '')
BACKEND_URL = os.getenv('BACKEND_URL', '').rstrip('/')
MAX_VIDEO_UPLOAD_BYTES = int(os.getenv('MAX_VIDEO_UPLOAD_BYTES', str(1024 ** 3)))
MAX_VIDEO_CHUNK_BYTES = int(os.getenv('MAX_VIDEO_CHUNK_BYTES', str(5 * 1024 ** 2)))
MAX_COURSE_THUMBNAIL_BYTES = int(os.getenv('MAX_COURSE_THUMBNAIL_BYTES', str(5 * 1024 ** 2)))
MAX_AVATAR_UPLOAD_BYTES = int(os.getenv('MAX_AVATAR_UPLOAD_BYTES', str(2 * 1024 ** 2)))
MAX_IMAGE_DIMENSION = int(os.getenv('MAX_IMAGE_DIMENSION', '4096'))

if MPESA_ENVIRONMENT not in {'sandbox', 'production'}:
    raise RuntimeError("MPESA_ENVIRONMENT must be set to 'sandbox' or 'production'.")
if not DEBUG:
    missing_mpesa_settings = [
        name for name, value in {
            'MPESA_CONSUMER_KEY': MPESA_CONSUMER_KEY,
            'MPESA_CONSUMER_SECRET': MPESA_CONSUMER_SECRET,
            'MPESA_SHORTCODE': MPESA_SHORTCODE,
            'MPESA_PASSKEY': MPESA_PASSKEY,
            'BACKEND_URL': BACKEND_URL,
        }.items() if not value
    ]
    enforce_payment = env_bool('ENFORCE_PAYMENT_CONFIG', False)
    if missing_mpesa_settings:
        if enforce_payment:
            raise RuntimeError(
                f"Required payment settings are missing: {', '.join(missing_mpesa_settings)}."
            )
        import logging
        logging.getLogger(__name__).warning(
            f"M-Pesa payment settings are not yet fully configured: {', '.join(missing_mpesa_settings)}. "
            "Platform will run normally, but M-Pesa STK Push will return 503 until credentials are provided."
        )
    elif BACKEND_URL:
        callback_url_parts = urlparse(BACKEND_URL)
        if callback_url_parts.scheme != 'https' or not callback_url_parts.netloc:
            raise RuntimeError("BACKEND_URL must be a public HTTPS URL when DEBUG is disabled.")

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} [{name}:{lineno}] {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose' if not DEBUG else 'simple',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING' if not DEBUG else 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console'],
            'level': 'ERROR',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
    },
}

# ---------------------------------------------------------------------------
# Sentry — Error tracking and performance monitoring
# Only activated when SENTRY_DSN is configured (production / staging).
# ---------------------------------------------------------------------------
_SENTRY_DSN = os.getenv("SENTRY_DSN", "")
if _SENTRY_DSN:
    import sentry_sdk
    from sentry_sdk.integrations.django import DjangoIntegration
    from sentry_sdk.integrations.logging import LoggingIntegration
    import logging as _logging

    sentry_sdk.init(
        dsn=_SENTRY_DSN,
        integrations=[
            DjangoIntegration(
                transaction_style="url",
                middleware_spans=True,
                signals_spans=False,
                cache_spans=False,
            ),
            LoggingIntegration(
                level=_logging.INFO,        # Breadcrumbs from INFO+
                event_level=_logging.ERROR, # Send events for ERROR+
            ),
        ],
        traces_sample_rate=float(os.getenv("SENTRY_TRACES_SAMPLE_RATE", "0.1")),
        profiles_sample_rate=float(os.getenv("SENTRY_PROFILES_SAMPLE_RATE", "0.1")),
        environment="production" if not DEBUG else "development",
        send_default_pii=False,
    )
