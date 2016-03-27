'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var pathName = window.location.pathname;
var surveyID = 1;
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
      if (record.name == $('.search__target').text() || record.name == '나') {
        $('.choice-voters[data-choice-id="' + record.choice_id + '"]').append('<span class="label" ' +
          'style="background-color: ' + record.color + ';">' + record.name + '</span>');
      }
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

$(document).on('submit', '.search__form', function() {
  event.preventDefault();

  // Initialize search result
  $('.search__target, .search__position, .search__similarity').text('');
  $('.search__warning-message, .search__danger-message').addClass('hidden');

  // Find target
  var targetName = $('#target-name').val();
  var matchingRow = _.find(rows, {'name': targetName});

  // When searching target does not exist
  if (matchingRow === undefined) $('.search__danger-message').removeClass('hidden');
  else {
    $('.search__target').text(targetName);
    $('.search__position').text('중도 우파');
    
    var similarity = matchingRow.similarity;
    
    if (similarity >= 80) {
      $('.search__similarity').text('매우 가까운 편');
    } else if (similarity >= 60) {
      $('.search__similarity').text('가까운 편');
    } else if (similarity >= 40) {
      $('.search__similarity').text('가깝지도 멀지도 않은 편');
    } else if (similarity >= 20) {
      $('.search__similarity').text('먼 편');
    } else {
      $('.search__similarity').text('매우 먼 편');
    }
    
    if (matchingRow.completed === false) $('.search__warning-message').removeClass('hidden');
  }
});

$(window).load(function() {

  // Set authentication token at HTTP header
  setAuthToken();

  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {
    
    // / When user is owner of result
    if (data.user != localStorage.getItem('user_id')) $('#go-to-survey-landding-page-btn').text('나도 해보기');
    
    // Parse record as JSON format 
    rows = JSON.parse(data.record.replace(/'/g, '"'));
    
    // Reordering in descending order
    rows = _.orderBy(rows, 'similarity', 'desc');
    
    // Get best and worst matching targets except for mine
    var bestMatchingTarget = rows[1];
    var worstMatchingTarget = rows[rows.length - 1];
    
    // Fill out result summary
    $('.summary__best-matching-target').text(bestMatchingTarget.name);
    $('.summary__worst-matching-target').text(worstMatchingTarget.name);
  }).fail(function() {
    // When result is not exist or updated to non-public
    $('.result__alert-message').removeClass('hidden');
    
    clearAuthToken();
  });

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
        html('#' + questionIndex + ' ' +  question.subtitle);
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
