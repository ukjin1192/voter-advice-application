#!usr/bin/python
# -*- coding:utf-8 -*-

import math
import numpy
from django.conf import settings
from main.models import User, Party, Question, Choice, Answer, Result 


def get_survey_data_of_user(user_obj):
    """
    Get factor list and last updated datetime of user's survey data from all answers
    """
    if isinstance(user_obj, User) == False:
        raise ValueError('Invalid variable')

    if user_obj.completed_survey == False:
        raise ValueError('User does not completed survey')

    answers = Answer.objects.select_related('choice').filter(user=user_obj).order_by('choice__id')
    factor_list = []
    updated_at = answers.latest('updated_at').updated_at

    for answer in answers:
        factor_list.append(answer.choice.factor)

    return {'factor_list': factor_list, 'updated_at': updated_at}


def get_one_dimensional_result(user_data, *target_data):
    """
    Get one dimensional result which compares target data with user’s data
    For example,
    [Data]
        User's survey data
            factor_list = [0, -2, 2]
        User A(1st comparison target)'s survey data
            factor_list = [1, 1, 1]
        User B(2nd comparision target)'s survey data
            factor_list = [2, 2, 2]
    [Input]
        user_data = [0, -2, 2]
        target_data = [{'name': 'User A', 'color': '#AEAEAE', 'factor_list': [1, 1, 1]},
                       {'name': 'User B', 'color': '#EEEEEE', 'factor_list': [2, 2, 2]}]
    [Output]
        [{'key': 'User A', 'value': 62, 'color': '#AEAEAE'}, {'key': 'User B', 'value': 54, 'color': '#EEEEEE'}]
    """
    question_count = len(user_data)
    similarity = []

    for single_target_data in target_data:
        target_factor_list = single_target_data['factor_list']
        disagreement = sum(numpy.absolute(numpy.subtract(user_data, target_factor_list)))
        factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
        max_disagreement = float(question_count * factor_max_distance)
        agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
        similarity.append("{'key': '" + single_target_data['name'] + "'," \
                + "'value': " + str(agreement_score) + "," \
                +  "'color': '" + single_target_data['color'] + "'}")

    return '[' + ', '.join(similarity) + ']'
