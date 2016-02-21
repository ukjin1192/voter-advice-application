#!usr/bin/python
# -*- coding:utf-8 -*-

from ast import literal_eval
from django.conf import settings
from django.core.cache import cache
from main.models import User, Party, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer 
from main.serializers import UserSerializer, PartySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer
from utils import utilities
import numpy


def set_party_list_cache():
    """
    Set whole parties cache
    """
    parties = Party.objects.select_related('user').all()
    serializer = PartySerializer(parties, many=True)
    cache_value = serializer.data
    cache.set('parties:list', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


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

    cache_value = {'data': parties_data, 'updated_at': parties_updated_at}
    cache.set('parties:data', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_questions_cache():
    """
    Set questions cache
    """
    questions = Question.objects.prefetch_related('choices').all()
    serializer = QuestionSerializer(questions, many=True)
    cache_value = serializer.data
    cache.set('questions', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_questions_count_cache():
    """
    Set questions count cache
    """
    cache_value = Question.objects.all().count()
    cache.set('questions:count', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_rotation_matrix_cache():
    """
    Set rotation matrix cache
    """
    rotation_matrix = RotationMatrix.objects.filter(is_deployed=True).latest('id')
    cache_value = {'matrix': numpy.array(literal_eval(rotation_matrix.matrix)), 
            'x_axis_name': rotation_matrix.x_axis_name,
            'y_axis_name': rotation_matrix.y_axis_name,
            'updated_at': rotation_matrix.updated_at}
    cache.set('rotation_matrix', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value
