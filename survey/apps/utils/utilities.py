#!usr/bin/python
# -*- coding:utf-8 -*-

import base64
import hashlib
import hmac
import json
from datetime import datetime
from django.conf import settings
from main.models import User, Survey, Question, Choice, Answer, Result 

# Variable from settings.py
FACEBOOK_SECRET_CODE = getattr(settings, 'FACEBOOK_SECRET_CODE')


def get_survey_data_of_user(user_obj):
    """
    Get factor list, weight list and last updated datetime of user's survey data from all answers
    """
    if isinstance(user_obj, User) == False:
        raise ValueError('Invalid variable')

    return {'factor_list': [], 'weight_list': [], 'updated_at': datetime.utcnow()}


def get_record_of_result(factor_list, weight_list, *target_data):
    """
    Get record of result, which compares target data with user’s data
    """
    return [('party_a', 65), ('party_b', 32)]


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
