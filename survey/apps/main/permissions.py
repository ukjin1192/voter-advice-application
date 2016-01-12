#!usr/bin/python
# -*- coding: utf-8 -*-

from rest_framework import permissions


class UserPermission(permissions.BasePermission):
    """
    List : X
    Create : anyone
    Retrieve : self
    Update : X
    Partial update : self
    Destroy : X
    """
    def has_permission(self, request, view):
        if view.action == 'create':
            return True
        elif view.action in ['retrieve', 'partial_update']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action in ['retrieve', 'partial_update']:
            return request.user.is_authenticated() and obj == request.user
        else:
            return False


class QuestionPermission(permissions.BasePermission):
    """
    List : anyone
    Create : X
    Retrieve : X
    Update : X
    Partial update : X
    Destroy : X
    """
    def has_permission(self, request, view):
        if view.action == 'list':
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        return False


class AnswerPermission(permissions.BasePermission):
    """
    List : authenticated user
    Create : authenticated user
    Retrieve : X
    Update : X
    Partial update : self
    Destroy : X
    """
    def has_permission(self, request, view):
        if view.action in ['list', 'create']:
            return request.user.is_authenticated()
        elif view.action == 'partial_update':
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action == 'partial_update':
            return request.user.is_authenticated() and obj.user == request.user
        else:
            return False


class ResultPermission(permissions.BasePermission):
    """
    List : X
    Create : authenticated user
    Retrieve : self or result is public
    Update : X
    Partial update : self
    Destroy : X
    """
    def has_permission(self, request, view):
        if view.action == 'create':
            return request.user.is_authenticated()
        elif view.action in ['retrieve', 'partial_update']:
            return True
        else:
            return False

    def has_object_permission(self, request, view, obj):
        if view.action == 'retrieve':
            return (request.user.is_authenticated() and obj.user == request.user) or obj.is_public
        elif view.action == 'partial_update':
            return request.user.is_authenticated() and obj.user == request.user
        else:
            return False
