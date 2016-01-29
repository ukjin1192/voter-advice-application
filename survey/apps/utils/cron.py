#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from celery import task
from django.utils import timezone
from utils import redis


@task()
def clear_expired_captcha():
    """
    Clear expired captcha
    """
    CaptchaStore.objects.filter(expiration__lt=timezon.now()).delete()
    return None


@task()
def update_rotation_matrix():
    """
    Update rotation matrix
    """
    redis.set_rotation_matrix_cache()
    return None
