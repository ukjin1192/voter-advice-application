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

// Translate similarity into word
function translateSimilarity(similarity) {
  if (similarity >= 80) {
    return '매우 가까운 편';
  } else if (similarity >= 60) {
    return '가까운 편';
  } else if (similarity >= 40) {
    return '가깝지도 멀지도 않은 편';
  } else if (similarity >= 20) {
    return '먼 편';
  } else {
    return '매우 먼 편';
  }
}

// Show hidden result
$(document).on('click', '#show-hidden-result-btn', function() {
  $('.chart__container--hidden').removeClass('hidden');
  $('#show-hidden-result-btn').addClass('hidden');
});

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

// Submit voice of customer
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
      var $barChart = $('#bar-chart__virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $barChart.find('.legend__name').text(row.name);
      $barChart.find('.legend__value').text(row.similarity + '%');
      $barChart.find('.progress-bar').css({
        'width': row.similarity + '%',
        'background-color': row.color
      });
      
      if (index < 6) $('.chart__container').append($barChart);
      else $('.chart__container--hidden').append($barChart);
    });
    
    $('#bar-chart__virtual-dom').remove();
    
    // Fill out result summary
    if (data.expected_target === null) {
      $('.result__summary').append('지지정당을 선택하지 않으셨군요. ');
    } else if (data.expected_target == 'none') {
      $('.result__summary').append('지지정당이 없으시군요. ');
    } else {
      var expectedTarget = _.find(rows, {'name': data.expected_target});
      if (expectedTarget === undefined) $('.result__summary').append('선택하신 <strong>' + data.expected_target + '</strong>의 데이터가 없습니다. ');
      else $('.result__summary').append('지지를 표명하신 <strong><span style="color: ' + expectedTarget.color + ';">' + 
          data.expected_target + '</span></strong>과의 거리는 <strong>' + translateSimilarity(expectedTarget.similarity) + '</strong>입니다. ');
    }
    
    $('.result__summary').append('가장 가까운 정당은 <strong><span style="color: ' + rows[0].color + ';">' + rows[0].name + '</span></strong>이고, ' +
      '가장 먼 당은 <strong><span style="color: ' + rows[rows.length - 1].color + ';">' + rows[rows.length - 1].name + '</span></strong>입니다.');
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
        $answerTableRow.find('.panel-body').append('<div class="choice-record">' + choice.context +
          ' : <span class="choice-voters" data-choice-id="' + choice.id + '"></span></div>');
      });
      
      $('#answer-table').append($answerTableRow);
    });
     
    $('#answer-table__virtual-dom').remove();
  });
});
