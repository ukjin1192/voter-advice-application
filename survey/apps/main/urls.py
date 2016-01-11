# -*- coding: utf-8 -*-

from django.conf.urls import url
from main.views import UserViewSet, QuestionViewSet, AnswerViewSet, ResultViewSet


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

urlpatterns = [
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
]
