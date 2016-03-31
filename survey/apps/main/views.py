#!usr/bin/python
# -*- coding:utf-8 -*-

from captcha.models import CaptchaStore
from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.cache import cache
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer
from main.permissions import UserPermission, ComparisonTargetPermission, SurveyPermission, QuestionPermission, AnswerPermission, ResultPermission, VoiceOfCustomerPermission
from main.serializers import UserSerializer, ComparisonTargetSerializer, SurveySerializer, QuestionSerializer, AnswerSerializer, ResultSerializer, VoiceOfCustomerSerializer
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
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
        instance = request.user
        serializer = self.get_serializer(instance)
        serializer_data = serializer.data
        
        if 'survey_id' in request.GET:
            try:
                survey = Survey.objects.get(id=int(request.GET['survey_id']))
            except:
                return Response(status=status.HTTP_400_BAD_REQUEST)
            
            if request.user in survey.participants.all():
                serializer_data['completed_survey'] = True
        
        return Response(serializer_data)

    def update(self, request, *args, **kwargs):
        """
        Partially update user
        """
        partial = kwargs.pop('partial', False)
        instance = request.user
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if not set(request.data).issubset(set(['sex', 'year_of_birth', 'political_tendency', 'supporting_party'])):
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class ComparisonTargetViewSet(viewsets.ModelViewSet):
    """
    Provides `list` and `retrieve` action for comparison target object
    """
    queryset = ComparisonTarget.objects.select_related('user').select_related('survey').all()
    serializer_class = ComparisonTargetSerializer
    permission_classes = (ComparisonTargetPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all comparison targets in specific survey
        """
        try:
            survey = Survey.objects.get(id=int(request.GET['survey_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        comparison_targets = cache.get('survey:' + str(survey.id) + ':comparison_targets:list')
        if comparison_targets is not None:
            return Response(comparison_targets)
        else:
            comparison_targets = redis.set_comparison_target_list_cache(survey)
            return Response(comparison_targets)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class SurveyViewSet(viewsets.ModelViewSet):
    """
    Provides `list` and `retrieve` action for survey object
    """
    queryset = Survey.objects.all()
    serializer_class = SurveySerializer
    permission_classes = (SurveyPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all surveys
        """
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class QuestionViewSet(viewsets.ModelViewSet):
    """
    Provides `list` and `retrieve` action for question object
    """
    queryset = Question.objects.prefetch_related('choices').all()
    serializer_class = QuestionSerializer
    permission_classes = (QuestionPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all questions in specific survey with choices
        """
        try:
            survey = Survey.objects.get(id=int(request.GET['survey_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        questions = cache.get('survey:' + str(survey.id) + ':questions')
        if questions is not None:
            return Response(questions)
        else:
            questions = redis.set_questions_cache(survey)
            return Response(questions)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


class AnswerViewSet(viewsets.ModelViewSet):
    """
    Provides `list`, `create` and `partial update` actions for answer object
    """
    queryset = Answer.objects.select_related('choice').select_related('user').all()
    serializer_class = AnswerSerializer
    permission_classes = (AnswerPermission, )

    def list(self, request, *args, **kwargs):
        """
        List all answers of user
        """
        queryset = Answer.objects.select_related('choice').select_related('user').filter(user=request.user).order_by('choice')
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        """
        Create answer if same answer is not exist
        """
        try:
            choice = Choice.objects.select_related('question').get(id=int(request.data['choice_id']))
            question = choice.question
            survey = question.survey
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Get question count
        questions_count = cache.get('survey:' + str(survey.id) + 'questions:count')
        if questions_count is None:
            questions_count = redis.set_questions_count_cache(survey)
        
        # Update if user already answered this question
        if Answer.objects.filter(user=request.user, choice__question_id=question.id).exists():
            
            # Note that update() will not call save() method which means it could not update updated_at field automatically
            answer = Answer.objects.filter(user=request.user, choice__question_id=question.id)[0]
            
            # Recover and update economic score of user
            if question.is_economic_bill:
                user = request.user
                if question.factor_reversed:
                    user.economic_score += answer.choice.factor
                    user.economic_score -= choice.factor 
                    user.save()
                else:
                    user.economic_score -= answer.choice.factor 
                    user.economic_score += choice.factor 
                    user.save()
            
            # Update choice
            answer.choice = choice
            answer.save()
            
            return Response(status=status.HTTP_200_OK)
        
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
        # Update economic score of user
        if question.is_economic_bill:
            user = request.user
            if question.factor_reversed:
                user.economic_score -= choice.factor 
                user.save()
            else:
                user.economic_score += choice.factor 
                user.save()
        
        # When user completed survey
        if Answer.objects.filter(user=request.user).count() == questions_count:
            survey.participants.add(request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, choice_id=int(self.request.data['choice_id']))

    def update(self, request, pk, *args, **kwargs):
        """
        Partially update answer
        """
        partial = kwargs.pop('partial', False)
        instance = Answer.objects.select_related('choice__question').get(id=pk)
        self.check_object_permissions(request, instance)
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        try:
            choice = Choice.objects.select_related('question').get(id=int(request.data['choice_id']))
            question = choice.question
            survey = question.survey
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        # Prevent user to choose multiple choices in one question
        if instance.choice.question.id != question.id:
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
    queryset = Result.objects.select_related('user').select_related('survey').all()
    serializer_class = ResultSerializer
    permission_classes = (ResultPermission, )

    def create(self, request, *args, **kwargs):
        """
        Create result if result is not exist or updated datetime is past than the comparison target
        Otherwise get ID of existing result
        """
        try:
            category = request.data['category']
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            survey = Survey.objects.get(id=int(request.data['survey_id']))
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = Result.objects.filter(survey=survey, category=category, user=request.user).latest('id')
        except:
            result = None
        
        # Randomly fill out unaswered questions
        if request.user not in survey.participants.all():
            all_questions = cache.get('survey:' + str(survey.id) + ':questions')
            if all_questions is None:
                all_questions = redis.set_questions_cache(survey)
            all_questions_id_list = []
            for i in range(0, len(all_questions)):
                all_questions_id_list.append(all_questions[i]['id'])
            
            answered_questions_id_list = []
            answers = Answer.objects.select_related('choice').filter(user=request.user, choice__question__survey=survey)
            for answer in answers:
                answered_questions_id_list.append(answer.choice.question.id)
            
            # Extract id list of unanswered question
            unanswered_questions_id_list = list(set(all_questions_id_list) - set(answered_questions_id_list))
            
            # Random choice for unanswered question
            for unanswered_question_id in unanswered_questions_id_list:
                question = Question.objects.prefetch_related('choices').get(id=unanswered_question_id)
                Answer(user=request.user, choice=question.choices.all().order_by('?')[0]).save()
            
            # Add user to participant list of survey
            survey.participants.add(request.user)
            
        comparison_targets = cache.get('survey:'+ str(survey.id) + ':comparison_targets:data')
        if comparison_targets is None:
            comparison_targets = redis.set_survey_data_of_comparison_targets_cache(survey)
        
        # Data of comparison target
        target_data = comparison_targets['data']
        comparison_targets_updated_at = comparison_targets['updated_at']
        
        user_data = utilities.get_survey_data_of_user(request.user, survey)
            
        if category == 'factor_list':
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exist
            #   (2) User's answers are not updated after result object is created 
            if result is not None and result.updated_at > user_data['updated_at']:
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            factor_list = user_data['factor_list']
            record = ''
            
            # Get question count
            questions_count = cache.get('survey:' + str(survey.id) + 'questions:count')
            if questions_count is None:
                questions_count = redis.set_questions_count_cache(survey)
            
            for i in range(0, min(len(factor_list), questions_count)):
                record += str(i + 1) + '=' + str(factor_list[i]) + '&'
            
            record = record[:-1]
        
        elif category == 'agreement_score':
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exist
            #   (2) User's answers are not updated after result object is created 
            if result is not None and result.updated_at > user_data['updated_at']:
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            user_data['name'] = '나'
            record = utilities.get_agreement_score_result(user_data, *target_data)
        
        elif category == 'city_block_distance':
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exist
            #   (2) User's answers are not updated after result object is created 
            #   (3) Answers of comparison targets are not updated after result object is created
            if result is not None and \
                    result.updated_at > user_data['updated_at'] and \
                    result.updated_at > max(comparison_targets_updated_at):
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            record = utilities.get_city_block_distance_result(user_data['factor_list'], *target_data)
        
        elif category == 'pca':
            rotation_matrix = cache.get('survey:' + str(survey.id) + ':rotation_matrix')
            if rotation_matrix is None:
                try:
                    rotation_matrix = redis.set_rotation_matrix_cache(survey)
                except:
                    return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            # Get ID of result object(=DO NOT CREATE NEW ONE) only if 
            #   (1) Result is exist
            #   (2) User's answers are not updated after result object is created 
            #   (3) Answers of comparison targets are not updated after result object is created
            #   (4) Rotation matrix is not updated after result object is created
            if result is not None and \
                    result.updated_at > user_data['updated_at'] and \
                    result.updated_at > max(comparison_targets_updated_at) and \
                    result.updated_at > rotation_matrix['updated_at']:
                return Response(
                        {'state': True, 'id': result.id, 'message': 'Result already exist.'},
                        status=status.HTTP_200_OK)
            
            user_dict = {'name': '나',
                'color': '#9b59b6',
                'factor_list': user_data['factor_list']}
            target_data.append(user_dict)
            
            record = utilities.get_pca_result(rotation_matrix['matrix'], *target_data)
        else:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        data = request.data
        data['record'] = record
        if category == 'pca':
            data['x_axis_name'] = rotation_matrix['x_axis_name']
            data['y_axis_name'] = rotation_matrix['y_axis_name']
        
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, survey_id=int(self.request.data['survey_id']))

    def retrieve(self, request, pk, *args, **kwargs):
        """
        Retrieve result
        """
        instance = Result.objects.select_related('user').select_related('survey').get(id=pk)
        self.check_object_permissions(request, instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, pk, *args, **kwargs):
        """
        Partially update result
        """
        partial = kwargs.pop('partial', False)
        instance = Result.objects.select_related('user').get(id=pk)
        self.check_object_permissions(request, instance)
        
        if partial == False:
            return Response(status=status.HTTP_405_METHOD_NOT_ALLOWED)
        
        if 'is_public' not in request.data:
            return Response(status=status.HTTP_400_BAD_REQUEST)
        
        if 'base64_encoded_image' in request.data:
            utilities.upload_base64_encoded_image_to_cloudinary(request.data['base64_encoded_image'])
        
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()


class VoiceOfCustomerViewSet(viewsets.ModelViewSet):
    """
    Provides `create` and `retrieve` actions for voice of customer object
    """
    queryset = VoiceOfCustomer.objects.select_related('user').select_related('survey').all()
    serializer_class = VoiceOfCustomerSerializer
    permission_classes = (VoiceOfCustomerPermission, )

    def create(self, request, *args, **kwargs):
        """
        Create voice of customer
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        
    def perform_create(self, serializer):
        if self.request.user.is_authenticated() and 'survey_id' in self.request.data:
            serializer.save(author=self.request.user, survey_id=int(self.request.data['survey_id']))
        elif self.request.user.is_authenticated():
            serializer.save(author=self.request.user)
        elif 'survey_id' in self.request.data:
            serializer.save(survey_id=int(self.request.data['survey_id']))
        else:
            serializer.save()

    def retrieve(self, request, pk, *args, **kwargs):
        instance = VoiceOfCustomer.objects.get(id=pk)
        self.check_object_permissions(request, instance)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)


@api_view(['GET'])
def get_records(request, question_id):
    """
    Get records of users and comparison targets
    """
    try:
        question = Question.objects.get(id=question_id)
        survey = question.survey
    except:
        return Response(status=status.HTTP_400_BAD_REQUEST)

    comparison_targets = cache.get('survey:' + str(survey.id) + ':comparison_targets:records')
    if comparison_targets is None:
        comparison_targets = redis.set_records_of_comparison_targets_cache(survey)

    data = []

    for comparison_target in comparison_targets:
        data.append({'name': comparison_target['name'], 
            'color': comparison_target['color'], 
            'choice_id': comparison_target['records'][question_id]})

    if request.user.is_authenticated():
        answer = request.user.user_chosen_answers.select_related('choice').filter(choice__question=question)
        try:
            data.append({'name': '나', 
                'color': '#9b59b6', 
                'choice_id': answer[0].choice.id})
        # When user does not answered this question
        except:
            pass

    return Response(data)
