'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');
var drawBubbleChart = require('../../module/drawBubbleChart.js');

// Global variables
var pathName = window.location.pathname;
var surveyID = 2;
var resultID = pathName.match(/result\/(\d+)/)[1];
var bubbleChartSelector = '.result__chart[data-tab-id="3"] .chart__container';

var colorList = {
  '새누리당': '#F23B39', 
  '더민주당': '#04AEBD', 
  '국민의당': '#88C340', 
  '정의당': '#FFCA08', 
  '기독자유당': '#007EBF', 
  '개혁신당': '#0062B4', 
  '공화당': '#EC5E26', 
  '불교당': '#EC5E26', 
  '노동당': '#CD2F3E', 
  '녹색당': '#52AD3B', 
  '민중연합당': '#F7892F', 
  '한국국민당': '#D3010E', 
  '한나라당': '#59B5E0',
  '나': '#000000'
};

var scores = [
  {
    'category': '사회/언론', 
    'data': {
      '새누리당': '7:13',
      '더민주당': '-13:-7',
      '국민의당': '-3', 
      '정의당': '-9', 
      '기독자유당': '5',
      '개혁신당': '-7',
      '공화당': '7', 
      '불교당': '-5', 
      '노동당': '-9', 
      '녹색당': '-9', 
      '민중연합당': '-9', 
      '한국국민당': '-1', 
      '한나라당': '1'
    }
  },
  {
    'category': '생태/다양성', 
    'data': {
      '새누리당': '-5:13',
      '더민주당': '-9:9',
      '국민의당': '-9:-3',
      '정의당': '-9', 
      '기독자유당': '-3',
      '개혁신당': '1',
      '공화당': '-3', 
      '불교당': '1:7',
      '노동당': '-9', 
      '녹색당': '-9', 
      '민중연합당': '-9', 
      '한국국민당': '-7', 
      '한나라당': '-3'
    }
  },
  {
    'category': '경제/노동', 
    'data': {
      '새누리당': '3', 
      '더민주당': '-1', 
      '국민의당': '-5', 
      '정의당': '-5', 
      '기독자유당': '7',
      '개혁신당': '-1',
      '공화당': '5', 
      '불교당': '7', 
      '노동당': '-7', 
      '녹색당': '-3', 
      '민중연합당': '-3', 
      '한국국민당': '-13', 
      '한나라당': '3'
    }
  },
  {
    'category': '외교/안보', 
    'data': {
      '새누리당': '9', 
      '더민주당': '-11', 
      '국민의당': '-5', 
      '정의당': '-5', 
      '기독자유당': '7',
      '개혁신당': '-5',
      '공화당': '13', 
      '불교당': '-11:-5',
      '노동당': '-15', 
      '녹색당': '-15', 
      '민중연합당': '-15', 
      '한국국민당': '-9', 
      '한나라당': '-5'
    }
  }
];

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
  factorSum = factorSum.toString();
  if (factorSum.indexOf(':') > -1) {
    var rawFactorSum = factorSum.split(':');
    factorSum = parseInt(rawFactorSum[2]);
    var unanwarenessAnswersCount = parseInt(rawFactorSum[3]);
    if (unanwarenessAnswersCount >= 3) return '추정 불가';
  } else {
    factorSum = parseInt(factorSum);
  }

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

// Get formalized data-set to draw bubble chart
function getFormalizedDatasetForBubbleChart() {
  var xCoordinates = _.find(scores, {'category': $('#x-axis-value').val()})['data'];
  var yCoordinates = _.find(scores, {'category': $('#y-axis-value').val()})['data'];
  var coordinates = [];

  _.forEach(xCoordinates, function(value, key) {
    coordinates.push({'name': key, 'x좌표': value, 'y좌표': yCoordinates[key], '크기': 1, 'color': colorList[key]});
  });

  return coordinates;
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
    
    // Draw bubble chart
    drawBubbleChart(bubbleChartSelector, $('.result__container').width() - 20, getFormalizedDatasetForBubbleChart(), $('#x-axis-value').val(), $('#y-axis-value').val(), -16, 16);
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

  // Convert svg to canvas and canvas to png file
  /*
  $(bubbleChartSelector).find('svg').attr({
    'version': 1.1, 
    'xmlns': 'http://www.w3.org/2000/svg'
  });
  var svgSource = $(bubbleChartSelector).find('svg').parent().html();
  var imageSource = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgSource)));

  $(bubbleChartSelector).find('canvas').attr({
    'width': $('.result__container').width() - 20, 
    'height': $('.result__container').width() - 20
  });
  var canvas = $(bubbleChartSelector).find('canvas')[0];
  var context = canvas.getContext('2d');
  
  var image = new Image;
  image.src = imageSource;
  image.onload = function() {
    context.drawImage(image, 0, 0);
    $(bubbleChartSelector).find('img').attr('src', canvas.toDataURL('image/png'));
  };
  */
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

// Re-draw bubble chart when axis changed
$(document).on('change', '.chart__legend--bubble', function() {
  drawBubbleChart(bubbleChartSelector, $('.result__container').width() - 20, getFormalizedDatasetForBubbleChart(), $('#x-axis-value').val(), $('#y-axis-value').val(), -16, 16);
});

// Load user data when DOM ready to boost up
$(document).ready(function() {

  $('#loading-icon').removeClass('hidden');

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
        $summaryBlock.append('<strong>' + category + '</strong> 성향은 <strong>' + translateFactorSum(factorSumMine[category]) + '</strong> 입니다.<div class="space"></div>');
        scores[index - 1]['data']['나'] = factorSumMine[category].toString();
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
          var expectedTarget = _.find(result, {'category': 'all', 'name': data.expected_target});
          if (expectedTarget === undefined) $summaryBlock.prepend('선택하신 <strong>' + data.expected_target + '</strong>의 데이터가 없습니다.');
          else $summaryBlock.prepend('지지를 표명하신 <strong><span style="color: ' + expectedTarget.color + ';">' + 
              data.expected_target + '</span></strong>과의 거리는 <strong>' + translateSimilarity(expectedTarget.similarity) + '</strong>입니다.');
        }
        
        // Deal with tie score
        var highestSimilarity = rows[0].similarity;
        var lowestSimilarity = rows[rows.length - 1].similarity;
        
        if (highestSimilarity == 0) { 
          $summaryBlock.prepend('가까운 정당이 없습니다.');
        } else {
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
        }
      } else {
        var $summaryBlock = $('.result__summary[data-tab-id="2"]');
        
        // Deal with tie score
        var highestSimilarity = rows[0].similarity;
        
        if (highestSimilarity == 0) { 
          $summaryBlock.prepend('<strong>' + category + '</strong> 성향은 가까운 정당이 없습니다.<div class="space"></div>');
        } else {
          var bestMatchingTargets = _.filter(rows, {'similarity': highestSimilarity});
          var bestMatchingText = '<strong>' + category + '</strong> 성향은 ';
          bestMatchingTargets.forEach(function(bestMatchingTarget, index) {
            bestMatchingText += '<strong><span style="color: ' + bestMatchingTarget.color + ';">' + bestMatchingTarget.name + '</span></strong> ';
          });
          bestMatchingText += '과 가깝습니다.<div class="space"></div>';
          
          $summaryBlock.append(bestMatchingText);
        }
      }
    });
    
    $('#bar-chart__virtual-dom').remove();
  }).fail(function() {
    // When result is not exist or updated to non-public
    $('.result__alert-message').removeClass('hidden');
  }).always(function() {
    $('#loading-icon').addClass('hidden');
  });
});

// Re-draw bubble chart when width of bubble chart container resized
$(window).resize(function() {

  if (localStorage.getItem('chart_width') === null || localStorage.getItem('chart_width') != $(window).width()) {
    localStorage.setItem('chart_width', $(window).width());
    drawBubbleChart(bubbleChartSelector, $('.result__container').width() - 20, getFormalizedDatasetForBubbleChart(), $('#x-axis-value').val(), $('#y-axis-value').val(), -16, 16);
  }
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

  // Activate 3rd tab directly when user came from facebook
  var ref = document.referrer;
  if (ref.indexOf('facebook') > -1) {
    $('.navbar__btn').removeAttr('disabled');
    $('.navbar__btn--3rd').attr('disabled', 'disabled');
    
    $('[data-tab-id="1"]').addClass('hidden');
    $('[data-tab-id="2"]').addClass('hidden');
    $('[data-tab-id="3"]').removeClass('hidden');
    
    // Draw bubble chart
    drawBubbleChart(bubbleChartSelector, $('.result__container').width() - 20, getFormalizedDatasetForBubbleChart(), $('#x-axis-value').val(), $('#y-axis-value').val(), -16, 16);
  }
});
