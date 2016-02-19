'use strict';

// Load bootstrap with custom configuration
require('bootstrap-webpack!./bootstrap.config.js');

// Embed CSS files of node modules
require('fullpage.js/jquery.fullPage.css');
require('rangeslider.js/dist/rangeslider.css');

// Embed stylesheet
require('./styles.scss');

// Load modules
var attachFastClick = require('fastclick');
var setCSRFToken = require('./module/setCSRFToken.js');
var setAuthToken = require('./module/setAuthToken.js');
var clearAuthToken = require('./module/clearAuthToken.js');
var getCaptcha = require('./module/getCaptcha.js');
var activateSlotMachine = require('./module/activateSlotMachine.js');
var loadResultPage = require('./module/loadResultPage.js');
var drawTwoDimensionalChart = require('./module/drawTwoDimensionalChart.js');
var showQuestionValidationMessage = require('./module/showQuestionValidationMessage.js');
var updateGhostVisibility = require('./module/updateGhostVisibility.js');

// Global variables
var pathname = window.location.pathname;

// Voice of customer
$(document).on('click', '#voice-of-customer-submit-btn', function() {
  // Set CSRF tokens at HTTP header
  setCSRFToken();
  if (localStorage.getItem('token') != null && localStorage.getItem('user_id') != null) setAuthToken();
  
  if ($('#voice-of-customer textarea').val() == '') return false;
  else $('#voice-of-customer-submit-btn').button('loading');

  var formData = new FormData();
  formData.append('context', $('#voice-of-customer textarea').val());

  $.ajax({
    url: '/api/vocs/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    $('#voice-of-customer textarea').val('');
    $('#voice-of-customer-alert-message').removeClass('hidden');
    setTimeout(function() {
      $('#voice-of-customer-alert-message').addClass('hidden');
    }, 2500);
  }).always(function() {
    $('#voice-of-customer-submit-btn').button('reset');
  }); 
});
 
// Toggle off voice of customer when user clicked background
$(document).on('click', '#voice-of-customer-curtain', function() {
  $('#voice-of-customer').collapse('hide');
});

// Synchronize voice of customer form with curtain
$('#voice-of-customer').on('show.bs.collapse', function () {
  $('#voice-of-customer-curtain').removeClass('hidden');
});
$('#voice-of-customer').on('hide.bs.collapse', function () {
  $('#voice-of-customer-curtain').addClass('hidden');
});

// Decide to use captcha validation or not
if ($('#use-captcha').val() == 'True') var useCaptcha = true;
else var useCaptcha = false;

$(document).on('click', '#refresh-captcha', getCaptcha);

// Validate captcha input and create user
$(document).on('submit', '#create-user-form', function(event) {
  event.preventDefault();

  // Clear alert message and hide it
  if (useCaptcha) $('#create-user-form-alert-message').html('').addClass('hidden');
  $('#create-user-submit-btn').button('loading');

  var formData = new FormData();
  if (useCaptcha) {
    formData.append('captcha_key', $('#captcha-key').val());
    formData.append('captcha_value', $('#captcha-value').val());
  }

  // Clear authentication and set CSRF tokens at HTTP header
  clearAuthToken();
  setCSRFToken();

  $.ajax({
    url: '/api/users/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // When captcha input is not valid
    if (data.state == false && useCaptcha == true) {
      $('#create-user-form-alert-message').html('일치하지 않습니다').removeClass('hidden');
    } else {
      // Save user's token and ID
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
      
      // Clear captcha input form
      if (useCaptcha) $('#captcha-key, #captcha-value').val('');
      
      // Clear original survey data
      $('.question-choice, input[name="sex"]').attr('checked', false); 
      $('.answer-id, .original-choice-id, #year-of-birth, #supporting-party').val('');
      
      // Hide buttons for participated user
      $('#continue-survey-btn, #edit-survey-btn, #move-to-result-page-btn').addClass('hidden');
      
      // Set authentication token at HTTP header
      setAuthToken();
      
      // Move to 1st question page
      $.fn.fullpage.moveSectionDown();
    }
  }).always(function() {
    $('#create-user-submit-btn').button('reset');
  }); 
});

$(document).on('click', '.question-choice', function() {
  var $leavingSection = $(this).closest('.section');
  var duration = new Date().getTime() / 1000 - localStorage.getItem('duration');

  // When user think enough or already answered question
  if (duration > parseInt($leavingSection.find('.question-duration-limit').val()) || 
    $leavingSection.find('.answer-id').val() != '') {
    // Auto scrolling
    $.fn.fullpage.moveSectionDown();
    $('#move-to-unanswered-question-btn').addClass('hidden');
  }
  // Too short duration to choose choice 
  else {
    showQuestionValidationMessage('조금만 더 생각해주세요');
    $leavingSection.find('.question-choice:checked').attr('checked', false); 
    return false;
  }
});

$(document).on('submit', '#update-user-form', function(event) {
  event.preventDefault();

  $('#submit-survey-btn').button('loading');

  if ($('input[name="sex"]:checked').val() != undefined ||
    $('#year-of-birth').val() != '' || $('#supporting-party').val() != '') {
    
    // Save additional info
    var formData = new FormData();
    if ($('input[name="sex"]:checked').val() != undefined) formData.append('sex', $('input[name="sex"]:checked').val());
    if ($('#year-of-birth').val() != '') formData.append('year_of_birth', $('#year-of-birth').val());
    if ($('#supporting-party').val() != '') formData.append('supporting_party', $('#supporting-party').val());
    
    // Set authentication and CSRF tokens at HTTP header
    setAuthToken();
    setCSRFToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'PATCH',
      data: formData,
      contentType: false,
      processData: false
    });
  }

  // Check user chose all questions
  var firstUnaswerdQuestionOrder = parseInt($('.answer-id[value=""]').closest('.question').find('.question-order').val());

  // When user does not completed survey 
  if (isNaN(firstUnaswerdQuestionOrder) == false) {
    $('#move-to-unanswered-question-btn').attr('href', '#Q' + firstUnaswerdQuestionOrder).removeClass('hidden');
    $('#submit-survey-btn').button('reset');
  }
  // Move to result page when user completed survey
  else {
    loadResultPage('party_2d');
  }
});

$(document).on('click', '#move-to-result-page-btn', function() {
  $('#move-to-result-page-btn').button('loading');
  loadResultPage('party_2d');
});

$(document).on('click', '#move-to-one-dimensional-result-page-btn', function() {
  $('#move-to-one-dimensional-result-page-btn').button('loading');
  loadResultPage('party_1d');
});

$(document).on('click', '#move-to-two-dimensional-result-page-btn', function() {
  $('#move-to-two-dimensional-result-page-btn').button('loading');
  loadResultPage('party_2d');
});

// Update result to public 
$(document).on('click', '.share-btn', function() {
  var resultID = pathname.match(/result\/(\d+)/)[1]
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
    $('#update-public-field-btn').removeClass('hidden');
    $('#update-public-field-alert-message').addClass('hidden');
  }); 
});

// Update result to non-public
$(document).on('click', '#update-public-field-btn', function() {
  $('#update-public-field-btn').button('loading');

  var resultID = pathname.match(/result\/(\d+)/)[1]
  var formData = new FormData();
  formData.append('is_public', false);
  
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
    $('#update-public-field-btn').addClass('hidden');
    $('#update-public-field-alert-message').removeClass('hidden');
  }); 

  $('#update-public-field-btn').button('reset');
});

// Alert that kakaotalk and line messenger sharing is only available at mobile
$(document).on('click', '#line-share, #kakaotalk-share', function() {
  // Detect desktop browser
  if (!('ontouchstart' in window)) {
    alert("모바일에서만 가능합니다");
    return false;
  }
});

// Alert that twitter sharing in IE(<11) is not working properly
$(document).on('click', '#twitter-share', function() {
  // Check whether browser is IE or not
  if (window.navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
    alert("IE 10 이하에서 트위터 공유는 정상적으로 작동하지 않습니다.");
    return false;
  }
});

$(document).ready(function() {

  // Main page with survey
  if (pathname == '/') {
    // Fill out captcha form
    if (useCaptcha) getCaptcha();
    
    // Get all questions without user answers
    $.ajax({
      url: '/api/questions/',
      type: 'GET'
    }).done(function(data) {
      var totalQuestions = data.length;
      var totalSections = totalQuestions + 2;
      
      // Initiate section slider
      $('#section-slider').attr('max', totalSections);
      var $sectionSlider = $('#section-slider');
      var $sectionSliderHandle;
      
      $sectionSlider.rangeslider({
        polyfill: false,
        onSlideEnd: function(position, value) {
          var lastAnsweredSectionIndex = parseInt($('.question-choice[type="radio"]:checked').last().closest('.question').find('.question-order').val()) + 1;
          if (isNaN(lastAnsweredSectionIndex)) lastAnsweredSectionIndex = 1; 
          
          // Sync section width slider value
          if (value <= lastAnsweredSectionIndex + 1) $.fn.fullpage.moveTo(value);
          // When user tries to skip unaswered questions
          else {
            $('#section-slider').val(lastAnsweredSectionIndex + 1).change();
            $.fn.fullpage.moveTo(lastAnsweredSectionIndex + 1);
          } 
        }
      });
      
      data.forEach(function(question, index) {
        var $section = $('#section-virtual-dom').clone().removeClass('hidden').removeAttr('id');
        $section.find('.question-id').val(question.id);
        $section.find('.question-order').val(index + 1);
        $section.find('.question-duration-limit').val(question.duration_limit);
        $section.find('.question-image').attr('data-src', question.image_url);
        $section.find('.question-explanation').html(question.explanation);
        
        var choices = question.choices;
        if (Math.random() < 0.5) choices = _.reverse(choices);
        
        choices.forEach(function(choice) {
          $section.find('.question-choices').append('<div class="radio"><input type="radio" ' +
            'class="question-choice" id="C' + choice.id  + '" name="question-' + question.id + '" value="' + 
            choice.id + '" /><label for="C' + choice.id  +'">' + choice.context + '</label></div>');
        });
        
        $('#page-scroll-container .section').last().before($section);
      });
      
      $('#section-virtual-dom').remove();
      
      // Get user profile and answers, then fill out this data into questions
      if (localStorage.getItem('token') != null && localStorage.getItem('user_id') != null) {
        $('#check-data-existence-message').removeClass('hidden');
        
        // Set authentication token at HTTP header
        setAuthToken();
        
        // Get user profile
        $.ajax({
          url: '/api/users/' + localStorage.getItem('user_id') + '/',
          type: 'GET'
        }).done(function(data) {
          // Fill out profile
          $('input[name="sex"][value="' + data.sex + '"]').attr('checked', true);
          $('#year-of-birth').val(data.year_of_birth);
          $('#supporting-party').find('option[value="' + data.supporting_party + '"]').attr('selected', true);
          
          var completedSurvey = data.completed_survey;
          
          // Get user answers
          $.ajax({
            url: '/api/answers/',
            type: 'GET'
          }).done(function(data) {
            // Fill out answers
            data.forEach(function(answer, index) {
              var $question = $('.question-choice[type="radio"][value="' + answer.choice + '"]').
                attr('checked', true).closest('.question');
              $question.find('.answer-id').val(answer.id);
              $question.find('.original-choice-id').val(answer.choice);
            });
            
            // When user completed survey
            if (completedSurvey) {
              $('#edit-survey-btn, #move-to-result-page-btn').removeClass('hidden');
            }
            // When user does not completed survey
            else {
              var firstUnaswerdQuestionOrder = parseInt($('.answer-id[value=""]').closest('.question').
                find('.question-order').val());
              $('#continue-survey-btn').attr('href', '#Q' + firstUnaswerdQuestionOrder).removeClass('hidden');
            }
            $('#create-user-submit-btn').removeClass('btn-xlg').html('새로 시작하기 (기존 데이터 삭제)');
          }).fail(function(data) {
            clearAuthToken();
            localStorage.clear();
          }); 
        }).fail(function(data) {
          clearAuthToken();
          localStorage.clear();
        }).always(function() {
          $('#check-data-existence-message').addClass('hidden');
        }); 
      } else{
        clearAuthToken();
        localStorage.clear();
      }
      
      var anchorsList = ['main', ];
      for (var i = 1; i < totalQuestions + 1; i++) {
        anchorsList.push('Q' + i);
      }
      anchorsList.push('additional');
      
      // Inititate fullpage.js with options
      $('#page-scroll-container').fullpage({
        
        // Enable anchor and history feature
        anchors: anchorsList,
        
        // Disables featutre moving to specific section when loaded
        animateAnchor: false,
        
        afterLoad: function(anchorLink, index){
          var $loadedSection = $(this);
          
          if (index == 2) {
            $('#section-slider-container').removeClass('hidden');
            
            // Update visibility of ghosts
            updateGhostVisibility();
            
            // Show tooltip message for section slider for a moment
            $('#section-slider-container').tooltip('show');
            setTimeout(function() {
              $('#section-slider-container').tooltip('hide');
            }, 3000);
          }
        },
        
        onLeave: function(index, nextIndex, direction){
          var $leavingSection = $(this);
          
          // Prevent to leave section when user tries to fold voice of customer form by clicking back button on mobile browser
          if ($('#voice-of-customer').hasClass('in')) {
            $('#voice-of-customer').collapse('hide');
            return false;
          }
          
          if (index > 1 && index < totalSections) {
            // Reset duration
            localStorage.setItem('duration', new Date().getTime() / 1000);
            
            var choiceID = $leavingSection.find('.question-choice[type="radio"]:checked').val();
            var originalChoiceID = $leavingSection.find('.original-choice-id').val();
            var answerID = $leavingSection.find('.answer-id').val();
            
            if (choiceID == undefined && direction == 'down') {
              showQuestionValidationMessage('질문에 답해주세요');
              return false;
            }
            
            if (choiceID != undefined) {
              // Create answer
              if (answerID == '') {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                
                // Set authentication and CSRF tokens at HTTP header
                setAuthToken();
                setCSRFToken();
                
                $.ajax({
                  url: '/api/answers/',
                  type: 'POST',
                  data: formData,
                  contentType: false,
                  processData: false
                }).done(function(data) {
                  $leavingSection.find('.answer-id').val(data.id);
                  $leavingSection.find('.original-choice-id').val(choiceID);
                }).fail(function(data) {
                  $leavingSection.find('.question-choice[type="radio"]:checked').attr('checked', false);
                }); 
              }
              // Update answer
              else if (originalChoiceID != choiceID) {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                
                // Set authentication and CSRF tokens at HTTP header
                setAuthToken();
                setCSRFToken();
                
                $.ajax({
                  url: '/api/answers/' + answerID + '/',
                  type: 'PATCH',
                  data: formData,
                  contentType: false,
                  processData: false
                }).done(function(data) {
                  $leavingSection.find('.original-choice-id').val(choiceID);
                }).fail(function(data) {
                  $leavingSection.find('.question-choice[type="radio"]:checked').attr('checked', false);
                  $leavingSection.find('.question-choice[value="' + originalChoiceID + '"]').attr('checked', true);
                }); 
              }
            }
          }
          // Start survey when user validated
          else if (index == 1) {
            if (localStorage.getItem('token') == null) return false;
          }
          
          // Sync slider with section index
          if (nextIndex == 1) $('#section-slider-container').addClass('hidden').tooltip('hide');
          else if (index == 1 && nextIndex == 2) $('#section-slider').val(nextIndex).change();
          else {
            $('#section-slider-container').removeClass('hidden');
            $('#section-slider').val(nextIndex).change();
          }
          
          // Update visibility of ghosts
          updateGhostVisibility();
        }
      });
    }); 
    
    // Get parties
    $.ajax({
      url: '/api/parties/',
      type: 'GET'
    }).done(function(data) {
      var wordList = [];
      
      data.forEach(function(party, index) {
        // Fill out supporting party list
        if (party.completed_survey) $('#supporting-party').append('<option value="' + party.name + '">' + party.name + '</option>');
        wordList.push(party.name);
      }); 
      
      // Activate slot machine with shuffled party name list
      wordList = _.shuffle(wordList);
      activateSlotMachine(wordList);
    }); 
    
    // Update visibility of ghosts when window resized
    $(window).on('resize', function() {
      setTimeout(function() {
        updateGhostVisibility();
      }, 1000);
    });
  } 
  // Result page
  else if (/result\/(\d+)/.test(pathname)) {
    var resultID = pathname.match(/result\/(\d+)/)[1]
    
    // Set authentication token at HTTP header
    setAuthToken();
    
    // Get result object (One dimensional analysis)
    $.ajax({
      url: '/api/results/' + resultID + '/',
      type: 'GET'
    }).done(function(data) {
      // One dimensional analysis
      if (data.category == 'party_1d') {
        var updatedAt = new Date(data.updated_at);
        $('#record-additional-info').html(updatedAt.getFullYear() + '년 ' +  parseInt(parseInt(updatedAt.getMonth()) + 1) + 
          '월 ' + updatedAt.getDate() + '일에 업데이트됐습니다');
        
        $('#move-to-one-dimensional-result-page-btn').removeClass('btn-default').addClass('btn-primary');
        $('#one-dimensional-result').removeClass('hidden');
        
        var rows = JSON.parse(data.record.replace(/'/g, '"'));
        
        // Sorting as descending order
        rows = _.orderBy(rows, 'similarity', 'desc');
        
        rows.forEach(function(row, index) {
          $('#one-dimensional-result').append('<div class="progress">' +
            '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: ' +
              row.similarity + '%; background-color: ' + row.color + ';">' + row.similarity + '%' + '</div></div>');
          $('#label-list').append('<span class="label" style="background-color: ' + row.color + ';">' + row.name + '</span>');
        });
        
        // Fill out result summary
        $('#most-similar-user').text(rows[0].name);
        $('#most-dissimilar-user').text(rows[rows.length - 1].name);
      }
      // Two dimensional analysis
      else {
        var updatedAt = new Date(data.updated_at);
        $('#record-additional-info').html('X,Y축의 눈금 간격이 달라, 보이는 거리와 실제 거리가 다를 수 있습니다. ' + 
            updatedAt.getFullYear() + '년 ' +  parseInt(parseInt(updatedAt.getMonth()) + 1) + '월 ' + 
            updatedAt.getDate() + '일에 업데이트됐습니다');
        
        $('#move-to-two-dimensional-result-page-btn').removeClass('btn-default').addClass('btn-primary');
        $('#two-dimensional-result').removeClass('hidden');
        
        var xAxisName = data.x_axis_name;
        var yAxisName = data.y_axis_name;
        
        var rows = JSON.parse(data.record.replace(/'/g, '"'));
        drawTwoDimensionalChart(rows, xAxisName, yAxisName);
        localStorage.setItem('chart_width', $('#two-dimensional-result').width());
        
        // Redraw chart when window resized (Prevent from resize event fires multiple times)
        var redraw = function() {
          if (localStorage.getItem('chart_width') != $('#two-dimensional-result').width()) {
            $('#two-dimensional-result, #label-list').empty();
            drawTwoDimensionalChart(rows, xAxisName, yAxisName);
            localStorage.setItem('chart_width', $('#two-dimensional-result').width());
          }
        };
        var debouncedRedraw = _.debounce(redraw, 750);
        $(window).on('resize', debouncedRedraw);
      }
      
      // When user is owner of result
      if (data.user == localStorage.getItem('user_id')) {
        $('#move-to-main-page-btn').html('설문 수정하기');
        $('#share-btn-group').removeClass('hidden');
        if (data.is_public) $('#update-public-field-btn').removeClass('hidden');
      }
      // When user is not authenticated
      else {
        $('#result-category').addClass('hidden');
        $('#move-to-main-page-btn').html('나도 확인해보기');
      }
    }).fail(function(data) {
      // When result is not exist or not public
      $('#result-navbar, #result-summary').addClass('hidden');
      $('#forbidden-alert-message').removeClass('hidden');
      $('#move-to-main-page-btn').html('나와 안맞는 정당 알아보기');
    }); 
  }

  /* TODO Kakao talk sharing
  Kakao.init('');
  Kakao.Link.createTalkLinkButton({
    container: '#kakaotalk-share',
    label: '[핑] 당신의 위치를 확인하세요',
    image: {
      src: '',
      width: '',
      height: ''
    },
    webButton: {
      text: '나도 확인해보기',
      url: window.location.href
    }
  });
  */

  // Attach fast-click to boost up touch reaction
  attachFastClick.attach(document.body);

  var userAgent = window.navigator.userAgent;
  var msie = userAgent.indexOf('MSIE ');

  // Warn user who uses Internet Explorer lower than version 10
  if (msie > 0 && parseInt(userAgent.substring(msie + 5, userAgent.indexOf(".", msie))) < 10) {
    $('#browser-support-alert-message').html('Internet Explorer 9 이하는 지원하지 않습니다').removeClass('hidden');
  }
  // Kakaotalk in-app browser
  else if (userAgent.indexOf('KAKAOTALK') != -1) {
    $('#browser-support-alert-message').html('<p><strong>카카오톡 브라우저</strong>에서는 설문 기록이 저장되지 않습니다</p>'
        + '<p>우측 상단 <strong><span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span></strong> '
        + '클릭 후 <strong>다른 브라우저에서 열기</strong></p>').removeClass('hidden');
  }
  // Facebook in-app browser
  else if (userAgent.indexOf('FBAV') != -1) {
    $('#browser-support-alert-message').html('<p><strong>페이스북 브라우저</strong>에서는 설문 기록이 저장되지 않습니다</p>'
        + '<p>우측 상단 <strong><span class="glyphicon glyphicon-option-vertical" aria-hidden="true"></span></strong> '
        + '클릭 후 <strong>다른 브라우저에서 열기</strong></p>').removeClass('hidden');
  }
});

$(window).load(function() {

  if (pathname == '/') {
    // Prevent from hidden elements blinking before CSS file loaded
    $('#voice-of-customer-curtain, #voice-of-customer-container, #section-slider-container, #page-scroll-container').css('visibility', '');
    
    // Update visibility of ghosts
    updateGhostVisibility();
  }
  else if (/result\/(\d+)/.test(pathname)) {
    // Prevent from hidden elements blinking before CSS file loaded
    $('#voice-of-customer-curtain, #voice-of-customer-container, #result-navbar, #result-detail-page').css('visibility', '');
    
    // Show footer
    $('#footer').removeClass('hidden');
  }
  else {
    // Show footer
    $('#footer').removeClass('hidden');
  }

  $('#loading-icon').addClass('hidden');

  // Ease effect when body DOM loads
  $("body").animate({ opacity: 1 }, 700);
});
