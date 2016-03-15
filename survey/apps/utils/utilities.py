#!usr/bin/python
# -*- coding:utf-8 -*-

import base64
import cloudinary
import cloudinary.uploader
import math
import numpy
from django.conf import settings
from main.models import User, Party, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer 

# Cloudinary configuration
cloudinary.config( 
    cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME'),
    api_key = getattr(settings, 'CLOUDINARY_API_KEY'),
    api_secret = getattr(settings, 'CLOUDINARY_API_SECRET')
)


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
        max_disagreement = float(sum(numpy.absolute(user_data) + 2))
        agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
        record.append("{'name': '" + single_target_data['name'] + "'," \
                + "'similarity': " + str(agreement_score) + "," \
                +  "'color': '" + single_target_data['color'] + "'}")

    return '[' + ', '.join(record) + ']'


def get_rotation_matrix():
    """
    Get rotation matrix with whole data
    Rotation matrix will be used for PCA method
    [Example of output with 3 questions]
        (
            array([[ 0.10296105,  0.95214155],
                [-0.97476398,  0.03896742],
                [ 0.19807624, -0.30316335]]),
            
            [
                (4.1271417411787281, array([ 0.10296105, -0.97476398,  0.19807624]), u'Q1'), 
                (2.229787899675975, array([ 0.95214155,  0.03896742, -0.30316335]), u'Q2'),
                (1.4077762414982362, array([ 0.28779419,  0.21981064,  0.93212541]), u'Q3')
            ],
            
            array([53.15258303, 81.8695484, 100.])
        )
    """
    all_list = []
    questions = Question.objects.all().order_by('id')
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
    
    # Make a list of (eigenvalue, eigenvector, relevant question ID) tuples
    eig_pairs = [(numpy.abs(eig_vals[i]), eig_vecs[:,i], questions[i].id) for i in range(len(eig_vals))]
    
    # Sort the tuples as descending order 
    eig_pairs.sort()
    eig_pairs.reverse()
    tot = sum(eig_vals)
    sorted(eig_vals, reverse=True)
    
    # SCREE PLOT (Examine Heuristically) - cumulated accuracy value
    var_exp = [(i/tot)*100 for i in sorted(eig_vals, reverse=True)]
    cum_var_exp = numpy.cumsum(var_exp).tolist()
    
    # Changes with Desired Dimensions (d = 2 for the moment)
    rotation_matrix = numpy.hstack((eig_pairs[0][1].reshape(qnum,1), eig_pairs[1][1].reshape(qnum,1))).tolist()

    refined_eig_pairs = []
    for eig_pair in eig_pairs:
        refined_eig_pairs.append((eig_pair[0], eig_pair[1].tolist(), eig_pair[2]))

    return rotation_matrix, refined_eig_pairs, cum_var_exp


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


def upload_base64_encoded_image_to_cloudinary(base64_encoded_image):
    """
    Upload base64 encoded image to Cloudinary
    """
    # Check maximum image size
    if len(base64_encoded_image) * 0.75 > getattr(settings, 'MAX_IMAGE_SIZE'):
        return ''

    cloudinary_obj = cloudinary.uploader.upload(base64_encoded_image)

    return cloudinary_obj['secure_url']
