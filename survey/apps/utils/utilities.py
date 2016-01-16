#!usr/bin/python
# -*- coding:utf-8 -*-

import base64
import hashlib
import hmac
import numpy
import json
from datetime import datetime
from django.conf import settings
from main.models import User, Survey, Question, Choice, Answer, Result 

# Variable from settings.py
FACEBOOK_SECRET_CODE = getattr(settings, 'FACEBOOK_SECRET_CODE')


def get_survey_data_of_user(user_obj):
    """
    Get weighted factor list and last updated datetime of user's survey data from all answers
    """
    if isinstance(user_obj, User) == False:
        raise ValueError('Invalid variable')

    if not Survey.objects.filter(participants=user_obj).exists():
        raise ValueError('User does not completed survey')

    answers = Answer.objects.select_related('choice').filter(user=user_obj).order_by('choice__id')
    weighted_factor_list = []
    updated_at = answers.latest('updated_at').updated_at

    for answer in answers:
        weighted_factor = answer.choice.factor * answer.weight
        weighted_factor_list.append(weighted_factor)

    return {'weighted_factor_list': weighted_factor_list, 'updated_at': updated_at}


def get_one_dimensional_result(user_data, *target_data):
    """
    Get one dimensional result which compares target data with user’s data
    For example,
    [Data]
        User's survey data
            factor_list = [0, -2, 2]
            weight_list = [1, 2, 1]
            weighted_factor_list = [0, -4, 2]
        User A(1st comparison target)'s survey data
            factor_list = [1, 1, 1]
            weight_list = [1, 2, 1]
            weighted_factor_list = [1, 2, 1]
        User B(2nd comparision target)'s survey data
            factor_list = [2, 2, 2]
            weight_list = [2, 1, 2]
            weighted_factor_list = [4, 2, 4]
    [Input]
        user_data = [0, -4, 2]
        target_data = [{'name': 'User A', 'weighted_factor_list': [1, 2, 1]},
                       {'name': 'User B', 'weighted_factor_list': [4, 2, 4]}]
    [Output]
        [('User A', 0.66), ('User B', 0.5)]
    """
    question_count = len(user_data)
    similarity = []

    for single_target_data in target_data:
        target_name = single_target_data['name']
        target_weighted_factor_list = single_target_data['weighted_factor_list']
        disagreement = sum(numpy.absolute(numpy.subtract(user_data, target_weighted_factor_list)))
        factor_max_distance = (getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')) * \
                getattr(settings, 'MAX_WEIGHT_VALUE')
        max_disagreement = float(question_count * factor_max_distance)
        agreement_score = 1 - (disagreement / max_disagreement)
        similarity.append((target_name, agreement_score))

    return similarity


def base64_url_decode(raw_url):
    """
    Decode URL by base64
    Parameter: raw URL
    """
    padding_factor = (4 - len(raw_url) % 4) % 4
    raw_url += "="*padding_factor

    return base64.b64decode(unicode(raw_url).translate(dict(zip(map(ord, u'-_'), u'+/'))))


def parse_facebook_signed_request(signed_request):
    """
    Parse facebook signed request and recognize user ID
    Parameter: signed request
    """
    temp = signed_request.split('.', 2)
    encoded_sig = temp[0]
    payload = temp[1]

    sig = base64_url_decode(encoded_sig)
    data = json.loads(base64_url_decode(payload))

    # Unknown algorithm
    if data.get('algorithm').upper() != 'HMAC-SHA256':
        return None
    else:
        expected_sig = hmac.new(FACEBOOK_SECRET_CODE, msg=payload, digestmod=hashlib.sha256).digest()

    if sig != expected_sig:
        return None
    else:
        return data
