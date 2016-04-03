#!usr/bin/python
# -*- coding:utf-8 -*-

import base64
import cloudinary
import cloudinary.uploader
import math
import numpy
from django.conf import settings
from django.core.cache import cache
from main.models import User, ComparisonTarget, Survey, Question, Choice, Answer, Result, RotationMatrix, VoiceOfCustomer

# Cloudinary configuration
cloudinary.config( 
    cloud_name = getattr(settings, 'CLOUDINARY_CLOUD_NAME'),
    api_key = getattr(settings, 'CLOUDINARY_API_KEY'),
    api_secret = getattr(settings, 'CLOUDINARY_API_SECRET')
)


def get_survey_data_of_user(user_obj, survey_obj):
    """
    Get factor list and last updated datetime of user's survey data from all answers
    """
    if isinstance(user_obj, User) == False:
        raise ValueError('Invalid variable')

    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    answers = Answer.objects.select_related('choice').\
        filter(user=user_obj, choice__question__survey=survey_obj).order_by('choice__id')
    factor_list = []
    updated_at_list = []

    questions = cache.get('survey:' + str(survey_obj.id) + ':questions')
    if questions is None:
        return {}

    for answer, question in zip(answers, questions):
        if question.factor_reversed:
            factor_list.append(answer.choice.factor * -1)
        else:
            factor_list.append(answer.choice.factor)
        updated_at_list.append(answer.updated_at)

    return {'economic_score': user_obj.economic_score, 'factor_list': factor_list, 'updated_at': max(updated_at_list)}


def get_agreement_score_result(user_data, *target_data):
    """
    Get agreement score algorithm result which compares target data with user’s data
    For example,
    [Data]
        User's survey data
            factor_list = [0, -2, 2]
        User A(1st comparison target)'s survey data
            factor_list = [1, 1, 1]
        User B(2nd comparison target)'s survey data
            factor_list = [2, 2, 2]
    [Input]
        user_data = {
            'name': '나', 
            'economic_score': 5, 
            'factor_list': [0, -2, 2]
        }
        target_data = [{
            'name': 'User A', 
            'economic_score': 7, 
            'factor_list': [1, 1, 1]
        },
        {
            'name': 'User B', 
            'economic_score': 3, 
            'factor_list': [2, 2, 2]
        }]
    [Output]
        [{
            'name': '나',
            'economic_score': 5, 
            'similarity': 100 
        },
        {
            'name': 'User A',
            'economic_score': 7,
            'similarity': 62 
        }, 
        {
            'name': 'User B', 
            'economic_score': 3,
            'similarity': 54
        }]
    """
    user_array = numpy.array(user_data['factor_list'])
    record = []

    # Add own data
    record.append("{'name': '" + user_data['name'] + "'," \
            + "'economic_score': " + str(user_data['economic_score']) + "," \
            + "'similarity': 100}")

    for single_target_data in target_data:
        origin = user_array
        target_array = numpy.array(single_target_data['factor_list'])
        question_count = len(target_array[target_array != 7])
        agreement = numpy.sum(numpy.array(origin) == target_array)
        max_agreement = question_count
        similarity = math.ceil(10000 * (agreement / float(max_agreement))) / 100
        record.append("{'name': '" + single_target_data['name'] + "'," \
                + "'economic_score': " + str(single_target_data['economic_score']) + "," \
                + "'similarity': " + str(similarity) + "}")

    return '[' + ', '.join(record) + ']'


def get_city_block_distance_result(questions_category, user_data, *target_data):
    """
    Get city block distance algorithm result which compares target data with user’s data
    For example,
    [Data]
        User's survey data
            factor_list = [0, -2, 2]
        User A(1st comparison target)'s survey data
            factor_list = [1, 1, 1]
        User B(2nd comparison target)'s survey data
            factor_list = [2, 2, 2]
    [Input]
        questions_category = ['category_a', 'category_b', 'category_a']
        user_data = [0, -2, 2]
        target_data = [{
            'name': 'User A', 
            'color': '#AEAEAE', 
            'is_reliable': True,
            'factor_list': [1, 1, 1]
        },
        {
            'name': 'User B', 
            'color': '#EEEEEE', 
            'is_reliable': False,
            'factor_list': [2, 2, 2]
        }]
    [Output]
        [{
            'classification': 'factor_sum',
            'name': 'me', 
            'category_a': 2,
            'category_b': -2,
        },
        {
            'classification': 'factor_sum',
            'name': 'User A', 
            'category_a': 2,
            'category_b': 1,
        },
        {
            'classification': 'factor_sum',
            'name': 'User B', 
            'category_a': 4,
            'category_b': 2,
        },
        {
            'classification': 'category',
            'category': 'all',
            'name': 'User A', 
            'color': '#AEAEAE',
            'is_reliable': True,
            'similarity': 62
        }, 
        {
            'classification': 'category',
            'category': 'all',
            'name': 'User B', 
            'color': '#EEEEEE',
            'is_reliable': False,
            'similarity': 54 
        },
        {
            'classification': 'category',
            'category': 'category_a',
            'name': 'User A', 
            'color': '#AEAEAE',
            'is_reliable': True,
            'similarity': 62
        }, 
        {
            'classification': 'category',
            'category': 'category_a',
            'name': 'User B', 
            'color': '#EEEEEE',
            'is_reliable': False,
            'similarity': 54 
        },
        {
            'classification': 'category',
            'category': 'category_b',
            'name': 'User A', 
            'color': '#AEAEAE',
            'is_reliable': True,
            'similarity': 62
        }, 
        {
            'classification': 'category',
            'category': 'category_b',
            'name': 'User B', 
            'color': '#EEEEEE',
            'is_reliable': False,
            'similarity': 54 
        }]
    """
    question_count = len(user_data)
    categories = list(set(questions_category))
    record = []

    # Calculate factor sum for user
    user_factor_sum = {}
    for category in categories:
        valid_index_list = []
        for index, question_category in enumerate(questions_category):
            if question_category == category:
                valid_index_list.append(index)
        
        temp_user_data = list(user_data[i] for i in valid_index_list)
        
        # Dealing exception if user answered as 'unawareness' when calculate factor sum
        # Substitue value '7' for average value of that category
        unanwareness_answers_count = temp_user_data.count(7)
        if len(temp_user_data) == unanwareness_answers_count:
            average_value = 0
        else:
            average_value = (sum(temp_user_data) - 7 * unanwareness_answers_count) / (len(temp_user_data) - unanwareness_answers_count)
        temp_user_data = [average_value if x == 7 else x for x in temp_user_data] 
        
        user_factor_sum[category] = sum(temp_user_data)

    temp_string = ""
    for key, value in user_factor_sum.iteritems(): 
        temp_string += ",'" + key + "': " + str(value)

    record.append("{'classification': 'factor_sum', 'name': 'me'" + temp_string + "}")

    # Calculate factor sum for comparison targets
    for single_target_data in target_data:
        target_factor_sum = {}
        target_factor_list = single_target_data['factor_list']
        
        for category in categories:
            valid_index_list = []
            for index, question_category in enumerate(questions_category):
                if question_category == category:
                    valid_index_list.append(index)
            
            temp_target_factor_list = list(target_factor_list[i] for i in valid_index_list)
            
            # Dealing exception if user answered as 'unawareness' when calculate factor sum
            # Substitue value '7' for average value of that category
            unanwareness_answers_count = temp_target_factor_list.count(7)
            if len(temp_target_factor_list) == unanwareness_answers_count:
                average_value = 0
            else:
                average_value = (sum(temp_target_factor_list) - 7 * unanwareness_answers_count) / (len(temp_target_factor_list) - unanwareness_answers_count)
            temp_target_factor_list = [average_value if x == 7 else x for x in temp_target_factor_list] 
            
            target_factor_sum[category] = sum(temp_target_factor_list)
        
        temp_string = ""
        for key, value in target_factor_sum.iteritems(): 
            temp_string += ",'" + key + "': " + str(value)
        
        record.append("{'classification': 'factor_sum', 'name': '" + single_target_data['name'] + "'" + temp_string + "}")

    # Calculate similarity by comparing with all questions
    """
    for single_target_data in target_data:
        target_factor_list = single_target_data['factor_list']
        disagreement = sum(numpy.absolute(numpy.subtract(user_data, target_factor_list)))
        factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
        max_disagreement = float(sum(numpy.absolute(user_data) + 2))
        agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
        record.append("{'classification': 'category', 'category': 'all'," \
                + "'name': '" + single_target_data['name'] + "'," \
                + "'color': '" + single_target_data['color'] + "'," \
                + "'is_reliable': '" + str(single_target_data['is_reliable']) + "'," \
                + "'similarity': " + str(agreement_score) + "}")
    """

    for single_target_data in target_data:
        user_data = numpy.array(user_data)
        target_factor_list = numpy.array(single_target_data['factor_list'])
        user_data_na = user_data != 7
        target_factor_list_na = target_factor_list != 7
        na_filter = user_data_na & target_factor_list_na
        user_data = user_data[na_filter]
        target_factor_list = target_factor_list[na_filter]
        # filter user_data by na_filter and gauge question number (for use in max disagreement)
        qnum = len(user_data)
        disagreement = sum(numpy.absolute(numpy.subtract(user_data, target_factor_list)))
        factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
        max_disagreement = float(sum(numpy.absolute(user_data) + factor_max_distance / 2))
        agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
        record.append("{'classification': 'category', 'category': 'all'," \
                + "'name': '" + single_target_data['name'] + "'," \
                + "'color': '" + single_target_data['color'] + "'," \
                + "'is_reliable': '" + str(single_target_data['is_reliable']) + "'," \
                + "'similarity': " + str(agreement_score) + "}")

    """
    # Calculate similarity by comparing with specific category
    for category in categories:
        valid_index_list = []
        for index, question_category in enumerate(questions_category):
            if question_category == category:
                valid_index_list.append(index)
        
        temp_user_data = list(user_data[i] for i in valid_index_list)
        
        for single_target_data in target_data:
            target_factor_list = single_target_data['factor_list']
            temp_target_factor_list = list(target_factor_list[i] for i in valid_index_list)
            disagreement = sum(numpy.absolute(numpy.subtract(temp_user_data, temp_target_factor_list)))
            factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
            max_disagreement = float(sum(numpy.absolute(temp_user_data) + 2))
            agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
            record.append("{'classification': 'category', 'category': '" + category + "'," \
                    + "'name': '" + single_target_data['name'] + "'," \
                    + "'color': '" + single_target_data['color'] + "'," \
                    + "'is_reliable': '" + str(single_target_data['is_reliable']) + "'," \
                    + "'similarity': " + str(agreement_score) + "}")
    """

    # Calculate similarity by comparing with specific category
    for category in categories:
        valid_index_list = []
        for index, question_category in enumerate(questions_category):
            if question_category == category:
                valid_index_list.append(index)
        
        temp_user_data = list(user_data[i] for i in valid_index_list)
        
        for single_target_data in target_data:
            temp_user_data = numpy.array(temp_user_data)
            target_factor_list = numpy.array(single_target_data['factor_list'])
            temp_target_factor_list = list(target_factor_list[i] for i in valid_index_list)
            temp_user_data_na = temp_user_data != 7
            temp_target_factor_list_na = temp_target_factor_list != 7
            na_filter = temp_user_data_na & temp_target_factor_list_na
            temp_user_data = temp_user_data[na_filter]
            temp_target_factor_list = temp_target_factor_list[na_filter]
            # filter temp_user_data by na_filter and gauge question number (for use in max disagreement)
            qnum = len(temp_user_data)
            disagreement = sum(numpy.absolute(numpy.subtract(temp_user_data, temp_target_factor_list)))
            factor_max_distance = getattr(settings, 'MAX_FACTOR_VALUE') - getattr(settings, 'MIN_FACTOR_VALUE')
            max_disagreement = float(sum(numpy.absolute(temp_user_data) + factor_max_distance / 2))
            agreement_score = math.ceil(100 * (1 - (disagreement / max_disagreement)))
            record.append("{'classification': 'category', 'category': 'all'," \
                    + "'name': '" + single_target_data['name'] + "'," \
                    + "'color': '" + single_target_data['color'] + "'," \
                    + "'is_reliable': '" + str(single_target_data['is_reliable']) + "'," \
                    + "'similarity': " + str(agreement_score) + "}")

    return '[' + ', '.join(record) + ']'


def get_rotation_matrix(survey_obj):
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
    if isinstance(survey_obj, Survey) == False:
        raise ValueError('Invalid variable')

    all_list = []
    questions = Question.objects.filter(survey=survey_obj).order_by('id')
    completed_users = survey_obj.participants.all()

    for completed_user in completed_users:
        all_list.append(get_survey_data_of_user(completed_user, survey_obj)['factor_list'])

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


def get_pca_result(rotation_matrix, *target_data):
    """
    Get PCA algorithm result which multiply target data(including user data) by rotation matrix
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
