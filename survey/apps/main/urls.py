# -*- coding: utf-8 -*-

from django.conf.urls import url
from main.views import UserViewSet, ComparisonTargetViewSet, SurveyViewSet, QuestionViewSet, AnswerViewSet, ResultViewSet, VoiceOfCustomerViewSet, get_records


user_list = UserViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
user_detail = UserViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
comparison_target_list = ComparisonTargetViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
comparison_target_detail = ComparisonTargetViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
survey_list = SurveyViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
survey_detail = SurveyViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
question_list = QuestionViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
question_detail = QuestionViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
answer_list = AnswerViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
answer_detail = AnswerViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
result_list = ResultViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
result_detail = ResultViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})
voice_of_customer_list = VoiceOfCustomerViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
voice_of_customer_detail = VoiceOfCustomerViewSet.as_view({
    'get': 'retrieve',
    'put': 'update',
    'patch': 'partial_update',
    'delete': 'destroy'
})

urlpatterns = [
    # REST API
    url(
        r'^users/$',
        user_list,
        name='user-list'
    ),
    url(
        r'^users/(?P<pk>[0-9]+)/$',
        user_detail,
        name='user-detail'
    ),
    url(
        r'^comparison_targets/$',
        comparison_target_list,
        name='comparison_target-list'
    ),
    url(
        r'^comparison_targets/(?P<pk>[0-9]+)/$',
        comparison_target_detail,
        name='comparison_target-detail'
    ),
    url(
        r'^surveys/$',
        survey_list,
        name='survey-list'
    ),
    url(
        r'^surveys/(?P<pk>[0-9]+)/$',
        survey_detail,
        name='survey-detail'
    ),
    url(
        r'^questions/$',
        question_list,
        name='question-list'
    ),
    url(
        r'^questions/(?P<pk>[0-9]+)/$',
        question_detail,
        name='question-detail'
    ),
    url(
        r'^answers/$',
        answer_list,
        name='answer-list'
    ),
    url(
        r'^answers/(?P<pk>[0-9]+)/$',
        answer_detail,
        name='answer-detail'
    ),
    url(
        r'^results/$',
        result_list,
        name='result-list'
    ),
    url(
        r'^results/(?P<pk>[0-9]+)/$',
        result_detail,
        name='result-detail'
    ),
    url(
        r'^voice_of_customers/$',
        voice_of_customer_list,
        name='voice_of_customer-list'
    ),
    url(
        r'^voice_of_customers/(?P<pk>[0-9]+)/$',
        voice_of_customer_detail,
        name='voice_of_customer-detail'
    ),
    # Ad-hoc API 
    url(
        r'^records/(?P<question_id>[0-9]+)/$',
        get_records,
    ),
]
