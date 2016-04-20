#!usr/bin/python
# -*- coding:utf-8 -*-

from ast import literal_eval
from django.conf import settings
from django.core.cache import cache
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer
from main.serializers import UserSerializer, ComparisonTargetSerializer, SurveySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer, VoiceOfCustomerSerializer
from utils import utilities
import numpy


def set_comparison_target_list_cache(survey_obj):
    """
    Set comparison target list cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    comparison_targets = ComparisonTarget.objects.select_related('user').select_related('survey').filter(survey=survey_obj)
    serializer = ComparisonTargetSerializer(comparison_targets, many=True)
    cache_value = serializer.data
    cache.set('survey:' + str(survey_obj.id) + ':comparison_targets:list', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_survey_data_of_comparison_targets_cache(survey_obj):
    """
    Set survey data of comparison targets cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    comparison_targets = ComparisonTarget.objects.select_related('user').filter(survey=survey_obj, user__in=survey_obj.participants.all())

    comparison_targets_data = []
    comparison_targets_updated_at = []

    for comparison_target in comparison_targets:
        raw_data = utilities.get_survey_data_of_user(comparison_target.user, survey_obj)
        comparison_target_data = {'name': comparison_target.name, 
                'economic_score': comparison_target.user.economic_score,
                'color': comparison_target.color, 
                'is_reliable': comparison_target.is_reliable,
                'factor_list': raw_data['factor_list']}
        comparison_targets_data.append(comparison_target_data)
        comparison_targets_updated_at.append(raw_data['updated_at'])

    cache_value = {'data': comparison_targets_data, 'updated_at': comparison_targets_updated_at}
    cache.set('survey:' + str(survey_obj.id) + ':comparison_targets:data', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_records_of_comparison_targets_cache(survey_obj):
    """
    Set records of comparison targets cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    cache_value = []
    comparison_targets = ComparisonTarget.objects.select_related('user').filter(survey=survey_obj, user__in=survey_obj.participants.all())

    for comparison_target in comparison_targets:
        choice_list = {}
        answers = comparison_target.user.user_chosen_answers.select_related('choice__question').all().order_by('choice__question')
        
        for answer in answers:
            choice_list[str(answer.choice.question.id)] = answer.choice.id
        
        cache_value.append({'name': comparison_target.name, 'color': comparison_target.color, 'records': choice_list})

    cache.set('survey:' + str(survey_obj.id) + ':comparison_targets:records', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_questions_cache(survey_obj):
    """
    Set questions cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    questions = Question.objects.prefetch_related('choices').filter(survey=survey_obj)
    serializer = QuestionSerializer(questions, many=True)
    cache_value = serializer.data
    cache.set('survey:' + str(survey_obj.id) + ':questions', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_questions_count_cache(survey_obj):
    """
    Set questions count cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    cache_value = Question.objects.filter(survey=survey_obj).count()
    cache.set('survey:' + str(survey_obj.id) + ':questions:count', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value


def set_rotation_matrix_cache(survey_obj):
    """
    Set rotation matrix cache
    """
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    rotation_matrix = RotationMatrix.objects.filter(survey=survey_obj, is_deployed=True).latest('id')
    cache_value = {'matrix': numpy.array(literal_eval(rotation_matrix.matrix)), 
            'x_axis_name': rotation_matrix.x_axis_name,
            'y_axis_name': rotation_matrix.y_axis_name,
            'updated_at': rotation_matrix.updated_at}
    cache.set('survey:' + str(survey_obj.id) + ':rotation_matrix', cache_value, timeout=getattr(settings, 'CACHE_TTL'))
    return cache_value
