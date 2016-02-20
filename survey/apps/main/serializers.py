#!usr/bin/python
# -*- coding: utf-8 -*-

from main.models import User, Party, Question, Choice, Answer, Result, VoiceOfCustomer 
from rest_framework import serializers


class UserSerializer(serializers.HyperlinkedModelSerializer):

    class Meta:
        model = User
        fields = ('id', 'sex', 'year_of_birth', 'supporting_party', 'completed_survey')


class PartySerializer(serializers.HyperlinkedModelSerializer):
    completed_survey = serializers.SerializerMethodField()
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Party
        fields = ('id', 'name', 'color', 'completed_survey', 'choices')

    def get_completed_survey(self, obj):
        """
        Check whether party completed survey or not
        """
        return obj.user.completed_survey

    def get_choices(self, obj):
        """
        Get choices of party
        """
        return Answer.objects.select_related('choice').filter(user=obj.user).values_list('choice', flat=True).order_by('choice')


class QuestionSerializer(serializers.HyperlinkedModelSerializer):
    choices = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ('id', 'explanation', 'image_url', 'duration_limit', 'choices')

    def get_choices(self, obj):
        """
        Get all choices in specific question
        """
        choices = Choice.objects.filter(question=obj)
        # serializer = ChoiceSerializer(choices, many=True, context={'request': self.context['request']})
        serializer = ChoiceSerializer(choices, many=True)
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
        fields = ('id', 'user', 'choice', 'updated_at')


class ResultSerializer(serializers.HyperlinkedModelSerializer):
    user = serializers.ReadOnlyField(source='user.id')

    class Meta:
        model = Result
        fields = ('id', 'user', 'record', 'category', 'x_axis_name', 'y_axis_name', 'is_public', 'updated_at')


class VoiceOfCustomerSerializer(serializers.HyperlinkedModelSerializer):
    author = serializers.ReadOnlyField(source='author.id')

    class Meta:
        model = VoiceOfCustomer
        fields = ('id', 'author', 'context', 'checked', 'created_at')
