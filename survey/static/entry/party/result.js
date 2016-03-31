'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var surveyID = 2;
var resultID = pathName.match(/result\/(\d+)/)[1];
var rows;

// Fill out report card row
$(document).on('show.bs.collapse', '#answer-table .panel-collapse', function() {
  $('#loading-icon').removeClass('hidden');

  var $answerTableRow = $(this);
  $answerTableRow.find('.choice-voters').html('');

  // Set authentication token at HTTP header
  setAuthToken();

  $.ajax({
    url: '/api/records/' + parseInt($answerTableRow.attr('data-question-id'))  + '/',
    type: 'GET',
  }).done(function(data) {
    data.forEach(function(record, index) {
      $('.choice-voters[data-choice-id="' + record.choice_id + '"]').append('<span class="label" ' +
        'style="background-color: ' + record.color + ';">' + record.name + '</span>');
    });
  }).always(function() {
    $('#loading-icon').addClass('hidden');
  });
});

// Update result to public 
$(document).on('click', '.share-btn', function() {
  var formData = new FormData();
  formData.append('is_public', true);

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'PATCH',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
  });
});

$(document).on('click', '.voice-of-customer__submit-btn', function() {
  if ($('#voice-of-customer textarea').val() != '') {
    $('.voice-of-customer__alert-message').addClass('hidden');
    
    var $submitBtn = $(this);
    $submitBtn.button('loading');
    
    // Set authentication and CSRF tokens at HTTP header
    setAuthToken();
    setCSRFToken();
    
    var formData = new FormData();
    formData.append('survey_id', surveyID);
    formData.append('context', $('#voice-of-customer textarea').val());
    
    $.ajax({
      url: '/api/voice_of_customers/',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false
    }).done(function(data) {
      $('#voice-of-customer textarea').val('');
      $('.voice-of-customer__alert-message').removeClass('hidden');
    }).always(function() {
      $submitBtn.button('reset');
    });
  }
});

// Load user data when DOM ready to boost up
$(document).ready(function() {

  if (localStorage.getItem('token') != null || localStorage.getItem('user_id') != null) {
    // Set authentication token at HTTP header
    setAuthToken();
  }

  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {
    
    // / When user is not an owner of result
    if (data.user != localStorage.getItem('user_id')) $('#go-to-survey-landding-page-btn').text('나도 해보기');
    
    // Parse record as JSON format 
    rows = JSON.parse(data.record.replace(/'/g, '"'));
    
    // Reordering in descending order
    rows = _.orderBy(rows, 'similarity', 'desc');
    
    // Fiil out result chart
    rows.forEach(function(row, index) {
      $('.result__chart').append('<div class="progress">' +
            '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: ' +
              row.similarity + '%; background-color: ' + row.color + ';"><strong>' + row.name +
              '</strong> <small>(' + row.similarity + '%' + ')</small></div></div>');
    });
    
    // Fill out result summary
    $('.result__summary').text('1등 : ' + rows[0].name + ' / ' + 
      '2등 : ' + rows[1].name + ' / ' + 
      '뒤에서 2등 : ' + rows[rows.length - 2].name + ' / ' + 
      '뒤에서 1등 : ' + rows[rows.length - 1].name);
  }).fail(function() {
    // When result is not exist or updated to non-public
    $('.result__alert-message').removeClass('hidden');
  });
});

$(window).load(function() {

  // Fill out answer table
  $.ajax({
    url: '/api/questions/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {
    
    data.forEach(function(question, index) {
      var questionIndex = index + 1;
      var $answerTableRow = $('#answer-table__virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $answerTableRow.find('.panel-heading').attr('href', '#Q' + questionIndex).
          html('#' + questionIndex + ' ' +  question.title);
      $answerTableRow.find('.panel-collapse').attr({
        'id': 'Q' + questionIndex, 
        'data-question-id': question.id
      });
      
      var choices = question.choices;
      choices.forEach(function(choice, index) {
        $answerTableRow.find('.panel-body').append('<p>' + choice.context +
          ' : <span class="choice-voters" data-choice-id="' + choice.id + '"></span></p>');
      });
      
      $('#answer-table').append($answerTableRow);
    });
     
    $('#answer-table__virtual-dom').remove();
  });
});
