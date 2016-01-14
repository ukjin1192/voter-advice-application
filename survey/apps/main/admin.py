#!usr/bin/python
# -*- coding: utf-8 -*-

from django.contrib import admin
from main.models import User, Survey, Question, Choice, Answer, Result


class UserAdmin(admin.ModelAdmin):
    list_display = ('id', 'username', 'sex', 'year_of_birth', 'is_active', 'date_joined')
    search_fields = ('username', )
    list_filter = ('date_joined', )
    date_hierarchy = 'date_joined'
    ordering = ('-id', )


class SurveyAdmin(admin.ModelAdmin):
    list_display = ('id', 'title')
    search_fields = ('title', )
    ordering = ('-id', )


class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'explanation', 'category')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'question', 'context', 'factor')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class AnswerAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'choice', 'duration', 'weight')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


class ResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'category', 'is_public')
    list_filter = ('created_at', )
    date_hierarchy = 'created_at'
    ordering = ('-id', )


admin.site.register(User, UserAdmin)
admin.site.register(Survey, SurveyAdmin)
admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice, ChoiceAdmin)
admin.site.register(Answer, AnswerAdmin)
admin.site.register(Result, ResultAdmin)
