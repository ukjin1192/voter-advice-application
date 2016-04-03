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

// Translate factor sum into word
function translateFactorSum(factorSum) {
  if (factorSum >= 9) {
    return '보수';
  } else if (factorSum > 3) {
    return '중도 보수';
  } else if (factorSum >= -3) {
    return '중도';
  } else if (factorSum > -9) {
    return '중도 진보';
  } else {
    return '진보';
  }
}

// Toggle tab contents
$(document).on('click', '.navbar__btn', function() {
  var $btn = $(this);
  $btn.closest('.result__navbar').find('.navbar__btn').removeAttr('disabled');
  $btn.attr('disabled', 'disabled');
  
  if ($btn.hasClass('navbar__btn--1st')) {
    $('[data-tab-id="1"]').removeClass('hidden');
    $('[data-tab-id="2"]').addClass('hidden');
    $('[data-tab-id="3"]').addClass('hidden');
  } else if ($btn.hasClass('navbar__btn--2nd')) {
    $('[data-tab-id="1"]').addClass('hidden');
    $('[data-tab-id="2"]').removeClass('hidden');
    $('[data-tab-id="3"]').addClass('hidden');
  } else if ($btn.hasClass('navbar__btn--3rd')) {
    $('[data-tab-id="1"]').addClass('hidden');
    $('[data-tab-id="2"]').addClass('hidden');
    $('[data-tab-id="3"]').removeClass('hidden');
  }
});

// Show hidden result
$(document).on('click', '.show-hidden-result-btn', function() {
  var $btn = $(this);
  $btn.closest('.result__chart').find('.chart__container--hidden').removeClass('hidden');
  $btn.addClass('hidden');
});

// Toggle answer table
$(document).on('click', '#show-answer-table-btn', function() {
  if ($('#answer-table-container').hasClass('hidden')) {
    $('#answer-table-container').removeClass('hidden');
    $(this).find('.glyphicon-chevron-down').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
  } else {
    $('#answer-table-container').addClass('hidden');
    $(this).find('.glyphicon-chevron-up').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
  }
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
    
    var categories = ['all', '사회/언론', '생태/다양성', '경제/노동', '외교/안보'];
    
    // Parse record as JSON format 
    var record = JSON.parse(data.record.replace(/'/g, '"'));
    
    // Filter factor sum data
    var factorSumList = _.filter(record, {'classification': 'factor_sum'});
    var factorSumMine = _.find(factorSumList, {'name': 'me'});
    
    var $summaryBlock = $('.result__summary[data-tab-id="3"]');
    categories.forEach(function(category, index) {
      if (category != 'all') {
        $summaryBlock.append('<strong>' + category + '</strong> 성향은 <strong>' + translateFactorSum(factorSumMine[category]) + '</strong> 입니다.<br/>');
      }
    });
    
    /*
    factorSumList.forEach(function(factorSum, index) {
      categories.forEach(function(category, index) {
        console.log(factorSum.name + ' ' + factorSum[category]);
      });
    });
    */
    
    // Filter similarity data
    var result = _.filter(record, {'classification': 'category'});
    
    // Sort in descending order
    result = _.orderBy(result, 'similarity', 'desc');
    
    categories.forEach(function(category, index) {
      // Filter specific category
      var rows = _.filter(result, {'category': category});
      
      // Fill out result chart
      var $chartBlock = $('.result__chart[data-category="' + category + '"]');
      rows.forEach(function(row, index) {
        var $barChart = $('#bar-chart__virtual-dom').clone().removeClass('hidden').removeAttr('id');
        $barChart.find('.legend__name').text(row.name);
        $barChart.find('.legend__value').text(row.similarity + '%');
        $barChart.find('.progress-bar').css({
          'width': row.similarity + '%',
          'background-color': row.color
        });
        
        if (index < 6) $chartBlock.find('.chart__container').append($barChart);
        else $chartBlock.find('.chart__container--hidden').append($barChart);
      });
      
      // Fill out result summary
      if (category == 'all') {
        var $summaryBlock = $('.result__summary[data-tab-id="1"]');
        if (data.expected_target === null) $summaryBlock.prepend('지지정당을 선택하지 않으셨습니다.');
        else if (data.expected_target == 'none') $summaryBlock.prepend('지지정당이 없습니다.');
        else {
          var expectedTarget = _.find(result, {'name': data.expected_target});
          if (expectedTarget === undefined) $summaryBlock.prepend('선택하신 <strong>' + data.expected_target + '</strong>의 데이터가 없습니다.');
          else $summaryBlock.prepend('지지를 표명하신 <strong><span style="color: ' + expectedTarget.color + ';">' + 
              data.expected_target + '</span></strong>과의 거리는 <strong>' + translateSimilarity(expectedTarget.similarity) + '</strong>입니다.');
        }
        
        // Deal with tie score
        var highestSimilarity = rows[0].similarity;
        var lowestSimilarity = rows[rows.length - 1].similarity;
        
        var bestMatchingTargets = _.filter(rows, {'similarity': highestSimilarity});
        var bestMatchingText = '가장 가까운 정당은 ';
        bestMatchingTargets.forEach(function(bestMatchingTarget, index) {
          bestMatchingText += '<strong><span style="color: ' + bestMatchingTarget.color + ';">' + bestMatchingTarget.name + '</span></strong> ';
        });
        bestMatchingText += '이고<br/>';
        
        var worstMatchingTargets = _.filter(rows, {'similarity': lowestSimilarity});
        var worstMatchingText = '가장 먼 정당은 ';
        worstMatchingTargets.forEach(function(worstMatchingTarget, index) {
          worstMatchingText += '<strong><span style="color: ' + worstMatchingTarget.color + ';">' + worstMatchingTarget.name + '</span></strong> ';
        });
        worstMatchingText += '입니다.<div class="space"></div>';
        
        $summaryBlock.prepend(bestMatchingText  + worstMatchingText);
      } else {
        var $summaryBlock = $('.result__summary[data-tab-id="2"]');
        
        // Deal with tie score
        var highestSimilarity = rows[0].similarity;
        
        var bestMatchingTargets = _.filter(rows, {'similarity': highestSimilarity});
        var bestMatchingText = '<strong>' + category + '</strong> 성향은 ';
        bestMatchingTargets.forEach(function(bestMatchingTarget, index) {
          bestMatchingText += '<strong><span style="color: ' + bestMatchingTarget.color + ';">' + bestMatchingTarget.name + '</span></strong> ';
        });
        bestMatchingText += '과 가깝습니다.<div class="space"></div>';
        
        $summaryBlock.append(bestMatchingText);
      }
    });
    
    $('#bar-chart__virtual-dom').remove();
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
          html('#' + questionIndex + ' [' + question.subtitle + '] ' + question.title);
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
