#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from django.http import HttpResponse
from django.utils import simplejson
from django.views.generic import View
from main.models import User, Survey, Question, Choice, Answer, Result 


class UserList(View):
    """
    Provides `create` action for user object
    """

    def post(self, request):
        """
        Create user if captcha is valid
        """
        captcha_key = self.request.data['captcha-key']
        captcha_value = self.request.data['captcha-value']
        
        try:
            captcha = CaptchaStore.objects.get(challenge=captcha_value, hashkey=captcha_key)
            captcha.delete()
        except:
            data = {'foo': 'bar'}
            return HttpResponse(
                simplejson.dumps(data),
                status=400,
                content_type='application/json')
            
        return HttpResponse()


class UserDetail(View):
    """
    Provides `retrieve` and `partial update` actions for user object
    """

    def get(self, request, pk):
        """
        Retrieve user and check user participated survey
        """
        return HttpResponse()

    def patch(self, request, pk):
        """
        Partially update user
        """
        return HttpResponse()


class QuestionList(View):
    """
    Provides `list` action for question object
    """

    def get(self, request):
        """
        List all questions with choices
        """
        questions = Question.objects.prefetch_related('choices').all()
        return HttpResponse()


class AnswerList(View):
    """
    Provides `list` and `create` actions for answer object
    """

    def get(self, request):
        """
        Retrieve whole answers of user
        """
        return HttpResponse()

    def post(self, request):
        """
        Create answer if same answer is not exist
        """
        return HttpResponse()


class AnswerDetail(View):
    """
    Provides `partial update` action for answer object
    """

    def patch(self, request, pk):
        """
        Partially update answer
        """
        return HttpResponse()


class ResultList(View):
    """
    Provides `create` action for result object
    """

    def post(self, request):
        """
        Create result if result is not exist or updated datetime is past than the comparison target
        Otherwise get ID of existing result
        """
        return HttpResponse()


class ResultDetail(View):
    """
    Provides `retrieve` and `partial update` for result object
    """

    def get(self, request, pk):
        """
        Retrieve result
        """
        return HttpResponse()

    def patch(self, request, pk):
        """
        Partially update result
        """
        return HttpResponse()
