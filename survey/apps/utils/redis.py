#!usr/bin/python
# -*- coding:utf-8 -*-

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django_redis import get_redis_connection
from main.models import User, Party, Question, Choice, Answer, Result 
from main.serializers import UserSerializer, PartySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer
from utils import utilities


def set_whole_parties_cache():
    """
    Set whole parties cache
    """
    parties = Party.objects.select_related('user').all()
    serializer = PartySerializer(parties, many=True)
    cache.set('parties:whole', serializer.data, timeout=getattr(settings, 'CACHE_TTL'))
    return serializer.data


def set_valid_parties_cache():
    """
    Set valid parties cache
    """
    parties = Party.objects.select_related('user').filter(user__completed_survey=True)
    cache.set('parties:valid', parties, timeout=getattr(settings, 'CACHE_TTL'))
    return parties


def set_questions_cache():
    """
    Set questions cache
    """
    questions = Question.objects.prefetch_related('choices').all()
    serializer = QuestionSerializer(questions, many=True)
    cache.set('questions', serializer.data, timeout=getattr(settings, 'CACHE_TTL'))
    return serializer.data


def set_rotation_matrix_cache():
    """
    Set rotation matrix cache
    """
    rotation_matrix = utilities.get_rotation_matrix()
    cache.set('rotation_matrix', {'matrix': rotation_matrix, 'updated_at': timezone.now()}, timeout=getattr(settings, 'CACHE_TTL'))
    return {'matrix': rotation_matrix, 'updated_at': timezone.now()}
