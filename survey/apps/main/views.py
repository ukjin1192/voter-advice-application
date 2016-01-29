#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from main.models import User, Party, Question, Choice, Answer, Result 
from main.permissions import UserPermission, PartyPermission, QuestionPermission, AnswerPermission, ResultPermission 
from main.serializers import UserSerializer, PartySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer
from rest_framework import status, viewsets
from rest_framework.response import Response
from rest_framework_jwt.settings import api_settings
from utils import redis, utilities
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
        if getattr(settings, 'USE_CAPTCHA') == True:
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
        serializer.save(username=uuid4(), password=make_password(getattr(settings, 'TEMPORARY_PASSWORD')))

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

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

    def perform_update(self, serializer):
        serializer.save()


class PartyViewSet(viewsets.ModelViewSet):
    """
    Provides `list` action for party object
    """
    queryset = Party.objects.select_related('user').all()
    serializer_class = PartySerializer
    permission_classes = (PartyPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all parties
        """
        parties = cache.get('parties:whole')
        if parties is not None:
            return Response(parties)
        else:
            parties = redis.set_whole_parties_cache()
            return Response(parties)


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
        questions = cache.get('questions')
        if questions is not None:
            return Response(questions)
        else:
            questions = redis.set_questions_cache()
            return Response(questions)


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
        if not all(x in request.data for x in ['choice_id']):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            choice = Choice.objects.get(id=int(request.data['choice_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Check if user already answered this question
        if Answer.objects.filter(user=request.user, choice__question_id=choice.question.id).exists():
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # When user completed survey
        if Answer.objects.filter(user=request.user).count() == Question.objects.all().count():
            user = request.user
            user.completed_survey = True
            user.save()
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, choice_id=int(self.request.data['choice_id']))

    def update(self, request, *args, **kwargs):
        """
        Partially update answer
        """
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not all(x in request.data for x in ['choice_id']):
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
        serializer.save(user=self.request.user, choice_id=int(self.request.data['choice_id']))


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
        if not all(x in request.data for x in ['category']) or \
                request.data['category'] not in [i[0] for i in getattr(settings, 'RESULT_CATEGORY_CHOICES')]:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        category = request.data['category']
        
        try:
            result = Result.objects.filter(category=category, user=request.user).latest('id')
        except:
            result = None
        
        # Data of comparison target
        target_data = []
        updated_at_list = []
        parties = cache.get('parties:valid')
        if parties is None:
            parties = redis.set_valid_parties_cache()
        
        for party in parties:
            try:
                party_data = utilities.get_survey_data_of_user(party.user)
                party_dict = {'name': party.name, 
                        'color': party.color, 
                        'factor_list': party_data['factor_list']}
                target_data.append(party_dict)
                updated_at_list.append(party_data['updated_at'])
            except:
                pass
        
        user_data = utilities.get_survey_data_of_user(request.user)
            
        if category == 'party_1d':
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exsit
            #   (2) User's answers are not updated after result object is created 
            #   (3) Answers of comparison targets are not updated after result object is created
            if result is not None and \
                    result.updated_at > user_data['updated_at'] and \
                    result.updated_at > max(updated_at_list):
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            record = utilities.get_one_dimensional_result(user_data['factor_list'], *target_data)
        else:
            rotation_matrix = cache.get('rotation_matrix')
            if rotation_matrix is None:
                rotation_matrix = redis.set_rotation_matrix_cache()
            
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exsit
            #   (2) User's answers are not updated after result object is created 
            #   (3) Answers of comparison targets are not updated after result object is created
            #   (4) Rotation matrix is not updated after result object is created
            if result is not None and \
                    result.updated_at > user_data['updated_at'] and \
                    result.updated_at > max(updated_at_list) and \
                    result.updated_at > rotation_matrix['updated_at']:
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            user_dict = {'name': '나',
                'color': '#9b59b6',
                'factor_list': user_data['factor_list']}
            target_data.append(user_dict)
            
            record = utilities.get_two_dimensional_result(rotation_matrix['matrix'], *target_data)
        
        data = request.data
        data['record'] = record
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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

    def perform_update(self, serializer):
        serializer.save()
