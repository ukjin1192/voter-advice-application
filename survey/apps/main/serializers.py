#!usr/bin/python
# -*- coding: utf-8 -*-

from main.models import User, Survey, Question, Choice, Answer, Result 
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ('url', 'id', 'sex', 'year_of_birth', 'supporty_party')


class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('url', 'id', 'survey', 'explanation', 'category', 'learn_more')

    def get_choices(self, obj):
        """
        Get all choices in specific question
        """
        choices = Choices.objects.filter(question=obj)
        serializer = ChoiceSerializer(choices, many=True, context={'request': self.context['request']})
        return serializer.data


class ChoiceSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Choice
        fields = ('url', 'id', 'question', 'context', 'factor')


class AnswerSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Answer
        fields = ('url', 'id', 'user', 'choice', 'duration', 'weight', 'updated_at')


class ResultSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = Result
        fields = ('url', 'id', 'user', 'category', 'record', 'updated_at')
