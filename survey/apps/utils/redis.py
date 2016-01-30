#!usr/bin/python
# -*- coding:utf-8 -*-

from django.conf import settings
from django.core.cache import cache
from django.utils import timezone
from django_redis import get_redis_connection
from main.models import User, Party, Question, Choice, Answer, Result 
from main.serializers import UserSerializer, PartySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer
from utils import utilities


def set_party_list_cache():
    """
    Set whole parties cache
    """
    parties = Party.objects.select_related('user').all()
    serializer = PartySerializer(parties, many=True)
    cache.set('parties:list', serializer.data, timeout=getattr(settings, 'CACHE_TTL'))
    return serializer.data


def set_survey_data_of_parties_cache():
    """
    Set survey data of parties cache
    """
    parties = Party.objects.select_related('user').filter(user__completed_survey=True)

    parties_data = []
    parties_updated_at = []

    for party in parties:
        try:
            raw_data = utilities.get_survey_data_of_user(party.user)
            party_data = {'name': party.name, 
                    'color': party.color, 
                    'factor_list': raw_data['factor_list']}
            parties_data.append(party_data)
            parties_updated_at.append(raw_data['updated_at'])
        except:
            pass

    cache.set('parties:data', {'data': parties_data, 'updated_at': parties_updated_at}, timeout=getattr(settings, 'CACHE_TTL'))
    return {'data': parties_data, 'updated_at': parties_updated_at}


def set_questions_cache():
    """
    Set questions cache
    """
    questions = Question.objects.prefetch_related('choices').all()
    serializer = QuestionSerializer(questions, many=True)
    cache.set('questions', serializer.data, timeout=getattr(settings, 'CACHE_TTL'))
    return serializer.data


def set_questions_count_cache():
    """
    Set questions count cache
    """
    count = Question.objects.all().count()
    cache.set('questions:count', count, timeout=getattr(settings, 'CACHE_TTL'))
    return count


def set_rotation_matrix_cache():
    """
    Set rotation matrix cache
    """
    rotation_matrix = utilities.get_rotation_matrix()
    cache.set('rotation_matrix', {'matrix': rotation_matrix, 'updated_at': timezone.now()}, timeout=getattr(settings, 'CACHE_TTL'))
    return {'matrix': rotation_matrix, 'updated_at': timezone.now()}
