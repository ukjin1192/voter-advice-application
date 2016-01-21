#!usr/bin/python
# -*- coding: utf-8 -*-

from datetime import timedelta
from django.conf import settings
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.translation import ugettext_lazy as _


class MyUserManager(BaseUserManager):

    def create_user(self, username, password):
        """
        Creates and saves a user
        """
        user = self.model(
            username = username
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password):
        """
        Creates and saves a superuser
        """
        user = self.create_user(
            username = username,
            password = password
        )
        user.is_admin = True
        user.save(using=self._db)
        return user


class User(AbstractBaseUser):
    """
    User profile which extends AbstractBaseUser class
    AbstractBaseUser contains basic fields like password and last_login
    """
    # UUIDField is not JSON serializable
    username = models.CharField(
        verbose_name = _('Username'),
        max_length = 255,
        unique = True,
        null = True
    )
    # DRF JWT package requires email field in User class
    email = models.CharField(
        verbose_name = _('Email'),
        max_length = 255,
        blank = True,
        null = True
    )
    sex = models.CharField(
        verbose_name = _('Sex'),
        choices = getattr(settings, 'SEX_CHOICES'),
        max_length = 255,
        blank = True,
        null = True
    )
    year_of_birth = models.PositiveSmallIntegerField(
        verbose_name = _('Year of birth'),
        validators = [MaxValueValidator(getattr(settings, 'MAX_YEAR_OF_BIRTH')), 
            MinValueValidator(getattr(settings, 'MIN_YEAR_OF_BIRTH'))],
        blank = True,
        null = True
    )
    supporting_party = models.CharField(
        verbose_name = _('Supporting party'),
        choices = getattr(settings, 'PARTY_CHOICES'),
        max_length = 255,
        blank = True,
        null = True
    )
    category = models.CharField(
        verbose_name = _('Category'),
        choices = getattr(settings, 'USER_CATEGORY_CHOICES'),
        max_length = 255,
        blank = True,
        null = True
    )
    caption = models.CharField(
        verbose_name = _('Caption'),
        max_length = 255,
        blank = True,
        null = True
    )
    is_active = models.BooleanField(
        verbose_name = _('Active'),
        default = True
    )
    is_admin = models.BooleanField(
        verbose_name = _('Admin'),
        default = False
    )
    date_joined = models.DateTimeField(
        verbose_name = _('Joined datetime'),
        auto_now_add = True,
        editable = False
    )

    objects = MyUserManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-id']   

    def __unicode__(self):
        return unicode(self.id) or u''

    def get_full_name(self):
        return self.username

    def get_short_name(self):
        return self.username

    def has_perm(self, perm, obj=None):
        return True

    def has_module_perms(self, app_label):
        return True

    @property
    def is_staff(self):
        return self.is_admin


class Survey(models.Model):
    """
    Survey information
    """
    participants = models.ManyToManyField(
        'User',
        related_name='participated_survey',
        blank = True
    )
    title = models.CharField(
        verbose_name = _('Title'),
        max_length = 255
    )
    created_at = models.DateTimeField(
        verbose_name = _('Created datetime'),
        auto_now_add = True,
        editable = False
    )
    updated_at = models.DateTimeField(
        verbose_name = _('Updated datetime'),
        auto_now = True
    )

    class Meta:
        verbose_name = _('Survey')
        verbose_name_plural = _('Surveys')
        ordering = ['-id']

    def __unicode__(self):
        return unicode(self.title) or u''


class Question(models.Model):
    """
    Question under specific survey
    """
    survey = models.ForeignKey(
        'Survey',
        related_name = 'questions'
    )
    explanation = models.CharField(
        verbose_name = _('Explanation'),
        max_length = 255
    )
    category = models.CharField(
        verbose_name = _('Category'),
        choices = getattr(settings, 'QUESTION_CATEGORY_CHOICES'),
        max_length = 255,
        blank = True,
        null = True
    )
    image_url = models.CharField(
        verbose_name = _('Image URL'),
        max_length = 255,
        blank = True,
        null = True
    )
    created_at = models.DateTimeField(
        verbose_name = _('Created datetime'),
        auto_now_add = True,
        editable = False
    )
    updated_at = models.DateTimeField(
        verbose_name = _('Updated datetime'),
        auto_now = True
    )

    class Meta:
        verbose_name = _('Question')
        verbose_name_plural = _('Questions')
        ordering = ['id']

    def __unicode__(self):
        return unicode(self.id) or u''


class Choice(models.Model):
    """
    Choice under specific question
    """
    question = models.ForeignKey(
        'Question',
        related_name = 'choices'
    )
    context = models.CharField(
        verbose_name = _('Context'),
        max_length = 255
    )
    factor = models.SmallIntegerField(
        verbose_name = _('Factor'),
        validators = [MaxValueValidator(getattr(settings, 'MAX_FACTOR_VALUE')), 
            MinValueValidator(getattr(settings, 'MIN_FACTOR_VALUE'))]
    )
    created_at = models.DateTimeField(
        verbose_name = _('Created datetime'),
        auto_now_add = True,
        editable = False
    )
    updated_at = models.DateTimeField(
        verbose_name = _('Updated datetime'),
        auto_now = True
    )

    class Meta:
        verbose_name = _('Choice')
        verbose_name_plural = _('Choices')
        ordering = ['id']

    def __unicode__(self):
        return unicode(self.id) or u''


class Answer(models.Model):
    """
    Answer under specific choice
    """
    user = models.ForeignKey(
        'User',
        related_name = 'user_chosen_answers'
    )
    choice = models.ForeignKey(
        'Choice',
        related_name = 'answers'
    )
    duration = models.DurationField(
        verbose_name = _('Duration'),
        validators = [MinValueValidator(timedelta(seconds=getattr(settings, 'MIN_DURATION_IN_SECONDS'))), ]
    )
    weight = models.PositiveSmallIntegerField(
        verbose_name = _('Weight'),
        validators = [MaxValueValidator(getattr(settings, 'MAX_WEIGHT_VALUE')), 
            MinValueValidator(getattr(settings, 'MIN_WEIGHT_VALUE'))],
        default = getattr(settings, 'MIN_WEIGHT_VALUE')
    )
    created_at = models.DateTimeField(
        verbose_name = _('Created datetime'),
        auto_now_add = True,
        editable = False
    )
    updated_at = models.DateTimeField(
        verbose_name = _('Updated datetime'),
        auto_now = True
    )

    class Meta:
        verbose_name = _('Answer')
        verbose_name_plural = _('Answers')
        ordering = ['-id']

    def __unicode__(self):
        return unicode(self.id) or u''


class Result(models.Model):
    """
    Result of user's survey
    """
    user = models.ForeignKey(
        'User',
        related_name = 'results'
    )
    survey = models.ForeignKey(
        'Survey',
        related_name = 'whole_results_of_survey'
    )
    category = models.CharField(
        verbose_name = _('Category'),
        choices = getattr(settings, 'RESULT_CATEGORY_CHOICES'),
        max_length = 255,
    )
    record = models.TextField(
        verbose_name = _('Record'),
    ) 
    is_public = models.BooleanField(
        verbose_name = _('Public'),
        default = False
    )
    created_at = models.DateTimeField(
        verbose_name = _('Created datetime'),
        auto_now_add = True,
        editable = False
    )
    updated_at = models.DateTimeField(
        verbose_name = _('Updated datetime'),
        auto_now = True
    )

    class Meta:
        verbose_name = _('Result')
        verbose_name_plural = _('Results')
        ordering = ['-id']

    def __unicode__(self):
        return unicode(self.id) or u''
