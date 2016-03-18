# -*- coding: utf-8 -*-

from django.conf import settings
from django.conf.urls import include, url
from django.contrib import admin
from django.views.generic import RedirectView, TemplateView


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
        r'^survey/$', 
        RedirectView.as_view(url='/', permanent=False)
    ),
    url(
        r'^survey/(?P<pk>[0-9]+)/$', 
        TemplateView.as_view(template_name='survey.html')
    ),
    url(
        r'^result/$', 
        RedirectView.as_view(url='/', permanent=False)
    ),
    url(
        r'^result/(?P<pk>[0-9]+)/$', 
        TemplateView.as_view(template_name='result.html')
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
