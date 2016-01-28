#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from celery import task
from datetime import datetime
from utils import utilities


@task()
def clear_expired_captcha():
    """
    Clear expired captcha
    """
    CaptchaStore.objects.filter(expiration__lt=datetime.utcnow()).delete()
    return None


@task()
def update_rotation_matrix():
    """
    Update rotation matrix
    """
    rotation_matrix = utilities.get_rotation_matrix()
    cache.set('rotation_matrix', {'rotation_matrix': rotation_matrix, 'updated_at': datetime.utcnow()}, timeout=7200)
    return rotation_matrix
