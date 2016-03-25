#!usr/bin/python
# -*- coding:utf-8 -*-

from django.conf import settings
from django.template import Library
import random

register = Library()


@register.filter
def get_settings_variable(variable_name):
    """
    Get settings variable
    Parameter: variable name
    """
    return getattr(settings, variable_name, None)


@register.filter
def get_random_choices(string):
    """
    Get random choices
    Parameter: string
    """
    sample_list = []
    for character in string:
        sample_list.append(character)
    return random.sample(sample_list, 2)
