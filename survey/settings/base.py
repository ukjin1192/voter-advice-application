#!usr/bin/python
# -*- coding:utf-8 -*-

import djcelery
import os
import sys
from ConfigParser import ConfigParser
from datetime import datetime, timedelta
from django.conf.global_settings import TEMPLATE_CONTEXT_PROCESSORS

PROJECT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
PROJECT_NAME = os.path.basename(PROJECT_DIR)
ROOT_DIR = os.path.dirname(PROJECT_DIR)
APPS_DIR = os.path.join(PROJECT_DIR, 'apps')

sys.path.insert(0, ROOT_DIR)
sys.path.insert(0, PROJECT_DIR)
sys.path.insert(0, APPS_DIR)

# Get sensitive configuration
config = ConfigParser()
config.read(ROOT_DIR + '/conf/sensitive/configuration.ini')

# Send bug reports on production mode
ADMINS = (
    ('Developer', config.get('gmail:developer', 'email_address')),
)

# Send email through SMTP
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_HOST_USER = config.get('gmail:smtp', 'email_address')
EMAIL_HOST_PASSWORD = config.get('gmail:smtp', 'password')
EMAIL_PORT = 587
EMAIL_USE_TLS = True

# Internationalization
LANGUAGE_CODE = 'ko'
ugettext = lambda s: s
LANGUAGES = (
    ('ko', 'Korean'),
    ('en', 'English'),
    ('jp', 'Japanese'),
    ('cn', 'Chinese'),
)
LOCALE_PATHS = (
    ROOT_DIR + '/locale/',
)
USE_I18N = True
USE_L10N = True
TIME_ZONE = 'UTC'
USE_TZ = True
DEFAULT_CHARSET = 'utf-8'

def ABS_PATH(*args):
    return os.path.join(PROJECT_DIR, *args)

# Static files
STATIC_ROOT = ABS_PATH('..', 'static')
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    ABS_PATH('static'),
)
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)

# Template files
TEMPLATE_DIRS = (
    ABS_PATH('templates'),
)
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
)

# Application configuration
ROOT_URLCONF = PROJECT_NAME + '.urls'
WSGI_APPLICATION = PROJECT_NAME + '.wsgi.application'
SECRET_KEY = config.get('django', 'secret_key')

# Defualt applications
INSTALLED_APPS = (
    # Suit is custom admin interface
    # Suit should come before 'django.contrib.admin'
    'suit',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
)

# Django-suit settings
TEMPLATE_CONTEXT_PROCESSORS = TEMPLATE_CONTEXT_PROCESSORS + (
    'django.core.context_processors.request',
    'django.core.context_processors.i18n',
)

# Custom applications
INSTALLED_APPS += (
    'main',
    'utils',
)   

# Middlewares
MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    # LocaleMiddleware should come after SessionMiddleware & CacheMiddleware
    # LocaleMiddleware should come before CommonMiddleware
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    # Uncomment the next line to deactivate clickjacking protection
    # It would not allow to show site via iframe tag
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

# 3rd-party applications
INSTALLED_APPS += (
    'captcha',
    'compressor',
    'djcelery',
    'django_extensions',
    'redisboard',
    'rest_framework',
)

# User class settings
AUTH_USER_MODEL = 'main.User'   # Extend default user class
TEMPORARY_PASSWORD = config.get('django', 'temporary_password')
LOGIN_URL = '/'
LOGOUT_URL = '/logout/'

# REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 5,
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
    )
}

# Django REST framework JWT settings
def jwt_response_payload_handler(token, user=None, request=None):
    return {
        'token': token,
        'user_id': user.id
    }

JWT_AUTH = {
    'JWT_RESPONSE_PAYLOAD_HANDLER': jwt_response_payload_handler,
    'JWT_EXPIRATION_DELTA': timedelta(days=100)
}

# Celery settings for async tasks
djcelery.setup_loader()
BROKER_URL = 'amqp://guest:guest@localhost:5672/'       # Use RabbitMQ as broker

# Celery beat settings for cron tasks
CELERY_IMPORTS = ('utils.cron',)
CELERYBEAT_SCHEDULER = "djcelery.schedulers.DatabaseScheduler"

# Compressor settings
COMPRESS_URL = STATIC_URL
COMPRESS_ROOT = STATIC_ROOT
COMPRESS_OUTPUT_DIR = 'CACHE'
STATICFILES_FINDERS += (
    'compressor.finders.CompressorFinder',
)

# Variables in `models.py`
MIN_YEAR_OF_BIRTH = 1910
MAX_YEAR_OF_BIRTH = 2010
MIN_FACTOR_VALUE = -2
MAX_FACTOR_VALUE = 2
SEX_CHOICES = (
    ('male', 'Male'),
    ('female', 'Female')
)
RESULT_CATEGORY_CHOICES = (
    ('comparison_1d', 'One dimensional comparison'),
    ('comparison_2d', 'Two dimentsional comparison')
)

# Captcha for humanvalidation
USE_CAPTCHA = False

# Time-to-live for cache
CACHE_TTL = 60 * 60 * 24 * 7    # 7 days

# Domain name
DOMAIN_NAME = config.get('django', 'domain_name')

# CDN URL
CDN_URL = config.get('aws', 'cloudfront_url')

# Cloudinary to upload and  share images
CLOUDINARY_API_KEY = config.get('cloudinary', 'api_key')
CLOUDINARY_API_SECRET = config.get('cloudinary', 'api_secret')
CLOUDINARY_CLOUD_NAME = config.get('cloudinary', 'cloud_name')
MAX_IMAGE_SIZE = 10485760           # Maximum size for uploadable image : 10 MB
