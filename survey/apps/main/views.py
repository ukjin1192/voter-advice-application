#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from datetime import timedelta
from django.conf import settings
from django.contrib.auth.hashers import make_password
from main.models import User, Survey, Question, Choice, Answer, Result 
from main.permissions import UserPermission, QuestionPermission, AnswerPermission, ResultPermission 
from main.serializers import UserSerializer, QuestionSerializer, AnswerSerializer, ResultSerializer
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings
from utils import utilities
from uuid import uuid4


class UserViewSet(viewsets.ModelViewSet):
    """
    Provides `create`, `retrieve` and `partial update` actions for user object
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (UserPermission, )

    def create(self, request, *args, **kwargs):
        """
        Create user if captcha is valid
        """
        """
        if not all(x in request.data for x in ['captcha_key', 'captcha_value']):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        captcha_key = request.data['captcha_key']
        captcha_value = request.data['captcha_value']
        
        try:
            captcha = CaptchaStore.objects.get(challenge=captcha_value, hashkey=captcha_key)
            captcha.delete()
        except:
            return Response(
                    {'state': False, 'code': 1, 'message': 'Captcha input is not correct.'},
                    status=status.HTTP_200_OK)
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Manually issue token
        jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
        jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
        
        serializer_data = serializer.data
        user = User.objects.get(id=serializer_data['id'])
        payload = jwt_payload_handler(user)
        token = jwt_encode_handler(payload)
        serializer_data['token'] = token
        return Response(serializer_data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        password = make_password(getattr(settings, 'TEMPORARY_PASSWORD'))
        serializer.save(username=uuid4(), password=password)

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve user and check user participated survey
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data
        data['user_participated'] = Survey.objects.filter(participants=request.user).exists()
        return Response(data)

    def update(self, request, *args, **kwargs):
        """
        Partially update user
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not set(request.data).issubset(set(['sex', 'year_of_birth', 'supporting_party'])):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Provides `list` action for question object
    """
    queryset = Question.objects.prefetch_related('choices').all()
    serializer_class = QuestionSerializer
    permission_classes = (QuestionPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all questions with choices
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class AnswerViewSet(viewsets.ModelViewSet):
    """
    Provides `list`, `create` and `partial update` actions for answer object
    """
    queryset = Answer.objects.all()
    serializer_class = AnswerSerializer
    permission_classes = (AnswerPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all answers of user
        """
        queryset = Answer.objects.filter(user=request.user)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create answer if same answer is not exist
        """
        if not all(x in request.data for x in ['choice_id', 'duration', 'weight']):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            choice = Choice.objects.get(id=int(request.data['choice_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Check whether user already pick choice in this question
        if Answer.objects.filter(user=request.user, choice__question_id=choice.question.id).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # When user completed survey
        if Answer.objects.filter(user=request.user).count() == Question.objects.all().count():
            survey = Survey.objects.latest('id')
            survey.participants.add(request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, 
                choice_id=int(self.request.data['choice_id']),
                duration=timedelta(seconds=int(self.request.data['duration'])),
                weight=int(self.request.data['weight']))

    def update(self, request, *args, **kwargs):
        """
        Partially update answer
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not all(x in request.data for x in ['choice_id', 'duration', 'weight']):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            choice = Choice.objects.get(id=int(request.data['choice_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent user to choose multiple choices in one question
        if instance.choice.question.id != choice.question.id:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save(choice_id=int(self.request.data['choice_id']),
                duration=timedelta(seconds=int(self.request.data['duration'])),
                weight=int(self.request.data['weight']))


class ResultViewSet(viewsets.ModelViewSet):
    """
    Provides `create`, `retrieve` and `partial update` actions for result object
    """
    queryset = Result.objects.all()
    serializer_class = ResultSerializer
    permission_classes = (ResultPermission, )

    def create(self, request, *args, **kwargs):
        """
        Create result if result is not exist or updated datetime is past than the comparison target
        Otherwise get ID of existing result
        """
        if not (all(x in request.data for x in ['category']) or \
                request.data['category'] not in getattr(settings, 'RESULT_CATEGORY_CHOICES')):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = Result.objects.filter(user=request.user).latest('id')
        except:
            result = None
        
        target_data = []
        updated_at_list = []
        if request.data['category'] == 'party':
            for party_name in getattr(settings, 'PARTY_CHOICES'):
                try:
                    party = User.objects.get(category='party', caption=party_name[0])
                    answer = utilities.get_survey_data_of_user(party)
                    party_dict = {'name': party_name[0], 
                            'weighted_factor_list': answer['weighted_factor_list']}
                    target_data.append(party_dict)
                    updated_at_list.append(answer['updated_at'])
                except:
                    pass
        
        # Only get ID of existing result
        if result is not None and result.updated_at > max(updated_at_list):
            return Response(
                    {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                    status=status.HTTP_200_OK)
        
        answer = utilities.get_survey_data_of_user(request.user)
        record = utilities.get_one_dimensional_result(answer['weighted_factor_list'], *target_data)
        
        data = request.data
        data['record'] = record
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user,
                survey=Survey.objects.latest('id'))

    def retrieve(self, request, *args, **kwargs):
        """
        Retrieve result
        """
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        """
        Partially update result
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not all(x in request.data for x in ['is_public']):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)


"""
Original source code to override methods

def list(self, request, *args, **kwargs):
    queryset = self.filter_queryset(self.get_queryset())

    page = self.paginate_queryset(queryset)
    if page is not None:
        serializer = self.get_serializer(page, many=True)
        return self.get_paginated_response(serializer.data)

    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data)

def create(self, request, *args, **kwargs):
    serializer = self.get_serializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    self.perform_create(serializer)
    headers = self.get_success_headers(serializer.data)
    return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

def perform_create(self, serializer):
    serializer.save()

def retrieve(self, request, *args, **kwargs):
    instance = self.get_object()
    serializer = self.get_serializer(instance)
    return Response(serializer.data)

def update(self, request, *args, **kwargs):
    partial = kwargs.pop('partial', False)
    instance = self.get_object()
    serializer = self.get_serializer(instance, data=request.data, partial=partial)
    serializer.is_valid(raise_exception=True)
    self.perform_update(serializer)
    return Response(serializer.data)

def perform_update(self, serializer):
    serializer.save()

def destroy(self, request, *args, **kwargs):
    instance = self.get_object()
    self.perform_destroy(instance)
    return Response(status=status.HTTP_204_NO_CONTENT)

def perform_destroy(self, instance):
    instance.delete()
"""
