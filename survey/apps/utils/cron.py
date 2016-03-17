#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from celery import task
from django.utils import timezone
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer
from utils import utilities


@task()
def clear_expired_captcha():
    """
    Clear expired captcha
    """
    CaptchaStore.objects.filter(expiration__lt=timezone.now()).delete()
    return None


@task()
def create_rotation_matrix():
    """
    Create rotation matrix
    """
    surveys = Survey.objects.all()
    for survey in surveys:
        rotation_matrix = utilities.get_rotation_matrix(survey)
        RotationMatrix(survey=survey,
                matrix=rotation_matrix[0], 
                eigen_pairs=rotation_matrix[1],
                cumulated_accuracy_value=rotation_matrix[2]).save()
    return None
