#!usr/bin/python
# -*- coding: utf-8 -*-

from django.contrib import admin
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer


class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'sex', 'year_of_birth', 'political_tendency', 'supporting_party', 'is_active', 'date_joined')
    search_fields = ('username', )
    list_filter = ('date_joined', )
    date_hierarchy = 'date_joined'
    ordering = ('-id', )


class ComparisonTargetAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'survey', 'name', 'color')
    search_fields = ('name', )
    ordering = ('-id', )


class SurveyAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
    search_fields = ('title', )
    ordering = ('-id', )


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'subtitle', 'explanation', 'cheating_paper', 'image_url', 'duration_limit')
    search_fields = ('title', 'subtitle', 'explanation', 'cheating_paper')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'context', 'factor')
    search_fields = ('context', )
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'choice', 'created_at')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class RotationMatrixAdmin(admin.ModelAdmin):
    list_display = ('id', 'survey', 'x_axis_name', 'y_axis_name', 'is_deployed', 'created_at')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'survey', 'record', 'category', 'x_axis_name', 'y_axis_name', 'is_public', 'created_at')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class VoiceOfCustomerAdmin(admin.ModelAdmin):
    list_display = ('id', 'author', 'survey', 'context', 'checked', 'created_at')
    search_fields = ('context', )
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


admin.site.register(User, UserAdmin)
admin.site.register(ComparisonTarget, ComparisonTargetAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice, ChoiceAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Result, ResultAdmin)
admin.site.register(RotationMatrix, RotationMatrixAdmin)
admin.site.register(VoiceOfCustomer, VoiceOfCustomerAdmin)
