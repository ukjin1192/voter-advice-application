#!usr/bin/python
# -*- coding: utf-8 -*-

from django.db.models.signals import post_save
from django.dispatch import receiver
from main.models import User, Party, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer
from utils import redis, utilities


@receiver(post_save, sender=RotationMatrix)
def update_cache_when_rotation_matrix_deployed(sender, instance, created, **kwargs):
    """
    Update cache when rotation matrix deployed
    """
    if created == False and instance.is_deployed == True:
        redis.set_rotation_matrix_cache()
