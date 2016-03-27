'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var surveyID = 1;

$(document).on('click', '.landing__btn--survey', function() {
  var btn = $(this);
  btn.button('loading');

  // Create new user
  if (localStorage.getItem('token') === null || localStorage.getItem('user_id') === null) {
    localStorage.clear()
    clearAuthToken();
    
    // Set CSRF token at HTTP header
    setCSRFToken();
    
    $.ajax({
      url: '/api/users/',
      type: 'POST'
    }).done(function(data) {
      // Save user's token and ID
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
      
      // Move to survey page
      location.href = '/assembly/survey/';
    }).always(function() {
      btn.button('reset');
    }); 
  } 
  // Check user is valid
  else {
    // Set authentication token at HTTP header
    setAuthToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'GET'
    }).done(function(data) {
      // Move to survey page
      location.href = '/assembly/survey/';
    }).fail(function() {
      // When user is invalid
      localStorage.clear()
      clearAuthToken();
    
      // Redirect to landing page if user is not valid 
      location.href = '/assembly/';
    }).always(function() {
      btn.button('reset');
    });
  }
});

$(document).on('click', '.landing__btn--result', function() {
  var btn = $(this);
  btn.button('loading');
  $('#loading-icon').removeClass('hidden');

  // Set authentication token at HTTP header
  setAuthToken();

  var formData = new FormData();
  formData.append('survey_id', surveyID);
  formData.append('category', 'agreement_score');
  
  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();
  
  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // Move to result page
    location.href = '/assembly/result/' + data.id + '/';
  }).always(function() {
    btn.button('reset');
    $('#loading-icon').addClass('hidden');
  });
});

$(window).on('resize', function() {
  $('.landing__image').attr('height', $(window).height());
});

$(window).load(function() {
  $('.landing__image').attr('height', $(window).height());

  if (localStorage.getItem('token') != null && localStorage.getItem('user_id') != null) {
    // Set authentication token at HTTP header
    setAuthToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'GET',
      data: {
        'survey_id': surveyID
      }
    }).done(function(data) {
      if (data.completed_survey) $('.landing__btn--result').removeClass('hidden');
    }).fail(function() {
      // When user is invalid
      localStorage.clear()
      clearAuthToken();
    });
  }
});
