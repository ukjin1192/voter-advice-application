#!usr/bin/python
# -*- coding:utf-8 -*-

import math
import numpy
from django.conf import settings
from main.models import User, Party, Question, Choice, Answer, Result, VoiceOfCustomer 


def get_survey_data_of_user(user_obj):
    """
    Get factor list and last updated datetime of user's survey data from all answers
    """
    if isinstance(user_obj, User) == False:
        raise ValueError('Invalid variable')

    if user_obj.completed_survey == False:
        raise ValueError('User does not completed survey')

    answers = Answer.objects.select_related('choice').filter(user=user_obj).order_by('choice__id')
    factor_list = []
    updated_at = answers.latest('updated_at').updated_at

    for answer in answers:
        factor_list.append(answer.choice.factor)

    return {'factor_list': factor_list, 'updated_at': updated_at}


def get_one_dimensional_result(user_data, *target_data):
    """
    Get one dimensional result which compares target data with user’s data
    For example,
    [Data]
        User's survey data
            factor_list = [0, -2, 2]
        User A(1st comparison target)'s survey data
            factor_list = [1, 1, 1]
        User B(2nd comparision target)'s survey data
            factor_list = [2, 2, 2]
    [Input]
        user_data = [0, -2, 2]
        target_data = [{'name': 'User A', 'color': '#AEAEAE', 'factor_list': [1, 1, 1]},
                       {'name': 'User B', 'color': '#EEEEEE', 'factor_list': [2, 2, 2]}]
    [Output]
        [{
            'name': 'User A', 
            'similarity': 62, 
            'color': '#AEAEAE'
        }, 
        {
            'name': 'User B', 
            'similarity': 54, 
            'color': '#EEEEEE'
        }]
    """
    question_count = len(user_data)
    record = []

    for single_target_data in target_data:
        target_factor_list = single_target_data['factor_list']
        disagreement = sum(numpy.absolute(numpy.subtract(user_data, target_factor_list)))
        factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
        max_disagreement = float(question_count * factor_max_distance)
        agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
        record.append("{'name': '" + single_target_data['name'] + "'," \
                + "'similarity': " + str(agreement_score) + "," \
                +  "'color': '" + single_target_data['color'] + "'}")

    return '[' + ', '.join(record) + ']'


def get_rotation_matrix():
    """
    Get rotation matrix with whole data
    Rotation matrix will be used for PCA method
    [Output example for 3 questions]
        numpy.array([
            [-0.01098383,  0.91666209],
            [-0.07372826,  0.39770633],
            [ 0.99721788,  0.03950055]])
    """
    all_list = []
    completed_users = User.objects.filter(completed_survey=True)

    for completed_user in completed_users:
        all_list.append(get_survey_data_of_user(completed_user)['factor_list'])

    all_list = numpy.array(all_list)
    weighted_list = all_list.astype(float)
    qnum = all_list.shape[1]
    mean_vec = numpy.mean(weighted_list, axis=0)
    cov_mat = (weighted_list - mean_vec).T.dot((weighted_list - mean_vec)) / (weighted_list.shape[0]-1)
    eig_vals, eig_vecs = numpy.linalg.eigh(cov_mat)

    for ev in eig_vecs:
        numpy.testing.assert_array_almost_equal(1.0, numpy.linalg.norm(ev))
    
    # make a list of (eigenvalue, eigenvector) tuples
    eig_pairs = [(numpy.abs(eig_vals[i]), eig_vecs[:,i]) for i in range(len(eig_vals))]
    
    # sort the tuples from high to low 
    eig_pairs.sort()
    eig_pairs.reverse()
    tot = sum(eig_vals)
    sorted(eig_vals, reverse=True)
    
    # SCREE PLOT (Examine Heuristically)
    # var_exp = [(i/tot)*100 for i in sorted(eig_vals, reverse=True)]
    
    # Changes with Desired Dimensions (d = 2 for the moment)
    rotation_matrix = numpy.hstack((eig_pairs[0][1].reshape(qnum,1), eig_pairs[1][1].reshape(qnum,1)))

    return rotation_matrix


def get_two_dimensional_result(rotation_matrix, *target_data):
    """
    Get two dimensional result which multiply target data(including user data) by rotation matrix
    [Input]
        rotation_matrix = numpy.array([
            [-0.01098383,  0.91666209],
            [-0.07372826,  0.39770633],
            [ 0.99721788,  0.03950055]])
        target_data = [
            {'name': 'User A', 'factor_list': [-1, 1, 2], 'color': '#AEAEAE'}, 
            {'name': 'User B', 'factor_list': [-2, 0, -2], 'color': '#EEEEEE'}]
    [Output]
        [{
            'name': 'User A', 
            'x_coordinate': 1.9316913344094013, 
            'y_coordinate': -0.43995466242180009, 
            'radius': 20, 
            'color': '#AEAEAE'
        }, 
        {
            'name': 'User B', 
            'x_coordinate': -1.972468097093643, 
            'y_coordinate': -1.9123252796738086, 
            'radius': 20,
            'color': '#EEEEEE'
        }]
    """
    record = []

    for single_target_data in target_data:
        factor_list = numpy.array(single_target_data['factor_list'])
        coordinates = tuple(factor_list.dot(rotation_matrix))
        record.append("{'name': '" + single_target_data['name'] + "'," \
                + "'x_coordinate': " + str(coordinates[0]) + "," \
                + "'y_coordinate': " + str(coordinates[1]) + "," \
                + "'radius': 20," \
                +  "'color': '" + single_target_data['color'] + "'}")

    return '[' + ', '.join(record) + ']'
