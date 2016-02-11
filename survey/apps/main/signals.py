#!usr/bin/python
# -*- coding: utf-8 -*-

from django.conf import settings
from django.core.mail import send_mail
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


@receiver(post_save, sender=VoiceOfCustomer)
def send_mail_when_voice_of_customer_created(sender, instance, created, **kwargs):
    """
    Send mail when voice of customer created
    """
    if created == True:
        smtp_address = getattr(settings, 'EMAIL_HOST_USER')
        send_mail('[VOC] VOC created', 
                instance.context, 
                smtp_address, 
                [smtp_address, ], 
                fail_silently=False)
