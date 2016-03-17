# -*- coding: utf-8 -*-

from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import TemplateView


admin.autodiscover()

urlpatterns = [

    # Admin
    url(
        r'^admin/', 
        include(admin.site.urls)
    ),

    # API end points
    url(
        r'^api/', 
        include('main.urls')
    ),

    # Captcha for human validation
    url(
        r'^captcha/', 
        include('captcha.urls')
    ),

    # Front-end pages
    url(
        r'^$', 
        TemplateView.as_view(template_name='index.html')
    ),
    url(
        r'^result/$', 
        TemplateView.as_view(template_name='result_list.html')
    ),
    url(
        r'^result/(?P<pk>[0-9]+)/$', 
        TemplateView.as_view(template_name='result_detail.html')
    ),
    url(
        r'^commentary/$', 
        TemplateView.as_view(template_name='commentary.html')
    ),
    url(
        r'^faq/$', 
        TemplateView.as_view(template_name='faq.html')
    ),
    url(
        r'^story/$', 
        TemplateView.as_view(template_name='story.html')
    ),
]

if settings.RUN_SILK:
    urlpatterns += [
        # Inspection tool
        url(
            r'^silk/', 
            include('silk.urls', namespace='silk')
        ),
    ]
