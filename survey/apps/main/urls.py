# -*- coding: utf-8 -*-

from django.conf.urls import url
from main.views import UserList, UserDetail, QuestionList, AnswerList, AnswerDetail, ResultList, ResultDetail 


urlpatterns = [
    url(
        r'^users/$',
        UserList.as_view()
    ),
    url(
        r'^users/(?P<pk>[0-9]+)/$',
        UserDetail.as_view()
    ),
    url(
        r'^questions/$',
        QuestionList.as_view()
    ),
    url(
        r'^answers/$',
        AnswerList.as_view()
    ),
    url(
        r'answers/(?P<pk>[0-9]+)/$',
        AnswerDetail.as_view()
    ),
    url(
        r'^results/$',
        ResultList.as_view()
    ),
    url(
        r'^results/(?P<pk>[0-9]+)/$',
        ResultDetail.as_view()
    ),
]
