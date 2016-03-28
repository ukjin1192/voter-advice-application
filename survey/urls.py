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
        r'^assembly/$', 
        TemplateView.as_view(template_name='assembly/index.html')
    ),
    url(
        r'^assembly/survey/$', 
        TemplateView.as_view(template_name='assembly/survey.html')
    ),
    url(
        r'^assembly/result/$', 
        RedirectView.as_view(url='/assembly/', permanent=False)
    ),
    url(
        r'^assembly/result/(?P<pk>[0-9]+)/$', 
        TemplateView.as_view(template_name='assembly/result.html')
    ),
    url(
        r'^party/$', 
        TemplateView.as_view(template_name='party/index.html')
    ),
    url(
        r'^party/survey/$', 
        TemplateView.as_view(template_name='party/survey.html')
    ),
    url(
        r'^party/result/$', 
        RedirectView.as_view(url='/party/', permanent=False)
    ),
    url(
        r'^party/result/(?P<pk>[0-9]+)/$', 
        TemplateView.as_view(template_name='party/result.html')
    ),

    # Redirect legacy pages
    url(
        r'^result/$', 
        RedirectView.as_view(url='/', permanent=False)
    ),
    url(
        r'^result/(?P<pk>[0-9]+)/$', 
        RedirectView.as_view(url='/', permanent=False)
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
