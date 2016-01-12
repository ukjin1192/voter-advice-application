#!usr/bin/python
# -*- coding: utf-8 -*-

from main.models import User, Survey, Question, Choice, Answer, Result 
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'sex', 'year_of_birth', 'supporting_party')


class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'explanation', 'category', 'learn_more', 'choices')

    def get_choices(self, obj):
        """
        Get all choices in specific question
        """
        choices = Choice.objects.filter(question=obj)
        serializer = ChoiceSerializer(choices, many=True, context={'request': self.context['request']})
        return serializer.data


class ChoiceSerializer(serializers.HyperlinkedModelSerializer):
    question = serializers.ReadOnlyField(source='question.id')

    class Meta:
        model = Choice
        fields = ('id', 'question', 'context', 'factor')


class AnswerSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')
    choice = serializers.ReadOnlyField(source='choice.id')

    class Meta:
        model = Answer
        fields = ('id', 'user', 'choice', 'duration', 'weight', 'updated_at')


class ResultSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Result
        fields = ('id', 'user', 'category', 'record', 'is_public', 'updated_at')
