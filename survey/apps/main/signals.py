#!usr/bin/python
# -*- coding: utf-8 -*-

from django.conf import settings
from django.core.mail import send_mail
from django.db.models.signals import post_save
from django.dispatch import receiver
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer
from utils import redis, utilities


@receiver(post_save, sender=Question)
def update_cache_when_question_updated(sender, instance, created, **kwargs):
    """
    Update cache when question updated
    """
    redis.set_questions_cache(instance.survey)
    redis.set_questions_count_cache(instance.survey)


@receiver(post_save, sender=Choice)
def update_cache_when_choice_updated(sender, instance, created, **kwargs):
    """
    Update cache when choice updated
    """
    redis.set_questions_cache(instance.question.survey)


@receiver(post_save, sender=ComparisonTarget)
def update_cache_when_comparison_target_updated(sender, instance, created, **kwargs):
    """
    Update cache when comparison target updated
    """
    redis.set_records_of_comparison_targets_cache(instance.survey)


@receiver(post_save, sender=ComparisonTarget)
def update_cache_when_comparison_target_updated(sender, instance, created, **kwargs):
    """
    Update cache when comparision target updated
    """
    redis.set_comparison_target_list_cache(instance.survey)
    if created == False and instance.user in instance.survey.participants.all():
        redis.set_survey_data_of_comparison_targets_cache(instance.survey)


@receiver(post_save, sender=RotationMatrix)
def update_cache_when_rotation_matrix_deployed(sender, instance, created, **kwargs):
    """
    Update cache when rotation matrix deployed
    """
    if created == False and instance.is_deployed == True:
        redis.set_rotation_matrix_cache(instance.survey)


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
