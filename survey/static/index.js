'use strict';

// Load bootstrap with custom configuration
require('bootstrap-webpack!./bootstrap.config.js');
require('./styles.scss');

var dimple = require('dimple-js');

// Load modules
var setCSRFToken = require('./module/setCSRFToken.js');
var setAuthToken = require('./module/setAuthToken.js');
var clearAuthToken = require('./module/clearAuthToken.js');
var getCaptcha = require('./module/getCaptcha.js');
var activateSlotMachine = require('./module/activateSlotMachine.js');

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

  // Clear authentication and CSRF tokens at HTTP header
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
  }).fail(function(data) {
    console.log('Failed to create user: ' + data);
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
    $leavingSection.find('.duration-alert-message').addClass('hidden');
    $('#move-to-unanswered-question-btn').addClass('hidden');
  }
  // Too short duration to choose choice 
  else {
    $leavingSection.find('.duration-alert-message').removeClass('hidden');
    return false;
  }
});

$(document).on('submit', '#update-user-form', function(event) {
  event.preventDefault();

  if ($('input[name="sex"]:checked').val() != undefined ||
    $('#year-of-birth').val() != '' || $('#supporting-party').val() != '') {
    
    $('#submit-survey-btn').button('loading');
    
    // Save additional info
    var formData = new FormData();
    if ($('input[name="sex"]:checked').val() != undefined) formData.append('sex', $('input[name="sex"]:checked').val());
    if ($('#year-of-birth').val() != '') formData.append('year_of_birth', $('#year-of-birth').val());
    if ($('#supporting-party').val() != '') formData.append('supporting_party', $('#supporting-party').val());
    
    setAuthToken();
    setCSRFToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'PATCH',
      data: formData,
      contentType: false,
      processData: false
    }).done(function(data) {
      console.log('Succeed to update user: ' + data);
    }).fail(function(data) {
      console.log('Failed to update user: ' + data);
    }).always(function() {
      $('#submit-survey-btn').button('reset');
    });
  }
  
  // Check user chose all questions
  var firstUnaswerdQuestionOrder = parseInt($('.answer-id[value=""]').closest('.question').find('.question-order').val());

  // When user does not completed survey 
  if (isNaN(firstUnaswerdQuestionOrder) == false) {
    $('#move-to-unanswered-question-btn').attr('href', '#Q' + firstUnaswerdQuestionOrder).removeClass('hidden');
  }
  // Move to result page when user completed survey
  else {
    $('#submit-survey-btn').button('loading');
    
    var formData = new FormData();
    formData.append('category', 'party_1d');
    
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
      location.href = '/result/' + data.id + '/';
    }).fail(function(data) {
      console.log('Failed to get result ID: ' + data);
    }).always(function() {
      $('#submit-survey-btn').button('reset');
    }); 
  }
});

$(document).on('click', '#move-to-result-page-btn', function() {
  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  var formData = new FormData();
  formData.append('category', 'party_1d');

  $('#move-to-result-page-btn').button('loading');

  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // Move to result page
    location.href = '/result/' + data.id + '/';
  }).fail(function(data) {
    console.log('Failed to get result ID: ' + data);
  }).always(function() {
    $('#move-to-result-page-btn').button('reset');
  }); 
});

$(document).ready(function() {
  var pathname = window.location.pathname;

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
      
      data = _.shuffle(data);
      
      data.forEach(function(question, index) {
        var $section = $('#section-virtual-dom').clone().removeClass('hidden').removeAttr('id');
        $section.find('.progress-bar').css('width', (index + 1) / totalQuestions * 100 + '%');
        $section.find('.question-id').val(question.id);
        $section.find('.question-order').val(index + 1);
        $section.find('.question-duration-limit').val(question.duration_limit);
        $section.find('.question-image').attr('data-src', question.image_url);
        $section.find('.question-explanation').html(question.explanation);
        
        var choices = question.choices;
        choices = _.shuffle(choices);
        
        choices.forEach(function(choice) {
          $section.find('.question-choices').append('<div class="radio"><label>' + '<input type="radio" ' +
            'class="question-choice" name="question-' + question.id + '" value="' + choice.id + '" />' + 
            choice.context + '</label></div>');
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
            $('#create-user-submit-btn').html('새로 시작하기 (기존 데이터 삭제)');
          }).fail(function(data) {
            console.log('Failed to get user answers: ' + data);
            clearAuthToken();
            localStorage.clear();
          }); 
        }).fail(function(data) {
          console.log('Failed to get user profile: ' + data);
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
      $('#page-scroll-container').removeClass('hidden').fullpage({
        
        // Enable anchor and history feature
        anchors: anchorsList,
        
        // Disables featutre moving to specific section when loaded
        animateAnchor: false,
        
        onLeave: function(index, nextIndex, direction){
          var $leavingSection = $(this);
          
          if (index > 1 && index < totalSections) {
            // Reset duration
            localStorage.setItem('duration', new Date().getTime() / 1000);
            
            var choiceID = $leavingSection.find('.question-choice[type="radio"]:checked').val();
            var originalChoiceID = $leavingSection.find('.original-choice-id').val();
            var answerID = $leavingSection.find('.answer-id').val();
            
            if (choiceID != undefined) {
              // Create answer
              if (answerID == '') {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                
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
                  console.log('Failed to create answer: ' + data);
                }); 
              }
              // Update answer
              else if (originalChoiceID != choiceID) {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                
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
                  console.log('Failed to update answer: ' + data);
                }); 
              }
            }
          }
          // Start survey when user validated
          else if (index == 1) {
            if (localStorage.getItem('token') == null) return false;
          }
        }
      });
    }).fail(function(data) {
      console.log('Failed to get questions: ' + data);
    }); 
    
    // Get parties
    $.ajax({
      url: '/api/parties/',
      type: 'GET'
    }).done(function(data) {
      var wordList = [];
      
      data.forEach(function(party, index) {
        // Fill out supporting party list
        $('#supporting-party').append('<option value="' + party.name + '">' + party.name + '</option>');
        wordList.push(party.name);
      }); 
      
      // Activate slot machine with shuffled party name list
      wordList = _.shuffle(wordList);
      activateSlotMachine(wordList);
    }).fail(function(data) {
      console.log('Failed to get parties: ' + data);
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
      var updatedAt = new Date(data.updated_at);
      $('#record-updated-at').html('최종 업데이트 : ' + updatedAt.getFullYear() + '-' +
        updatedAt.getMonth() + 1 + '-' + updatedAt.getDate());
      
      var rows = JSON.parse(data.record.replace(/'/g, '"'));
      
      // Sorting as descending order
      rows = rows.sort(function(a, b){
        return a.value < b.value;
      });
      
      rows.forEach(function(row, index) {
        $('#result-chart').append('<div class="progress">' +
          '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: ' +
            row.similarity + '%; background-color: ' + row.color + ';">' + row.similarity + '%' + '</div></div>');
        $('#label-list').append('<span class="label" style="background-color: ' + row.color + ';">' + row.name + '</span>');
      });
      
      // When user is owner of result
      if (data.user == localStorage.getItem('user_id')) {
        $('#move-to-main-page-btn').html('설문 수정하기');
        $('#share-btn-group').removeClass('hidden');
        
        if (data.is_public) $('#update-public-field-btn').removeClass('hidden');
        
        // Update result to public 
        $(document).on('click', '.share-btn', function() {
          var formData = new FormData();
          formData.append('is_public', true);
          
          setAuthToken();
          setCSRFToken();
          
          $.ajax({
            url: '/api/results/' + resultID+ '/',
            type: 'PATCH',
            data: formData,
            contentType: false,
            processData: false
          }).done(function(data) {
            $('#update-public-field-btn').removeClass('hidden');
            $('#update-public-field-alert-message').addClass('hidden');
          }).fail(function(data) {
            console.log('Failed to update result to public: ' + data);
          }); 
        });
        
        // Update result to not public
        $(document).on('click', '#update-public-field-btn', function() {
          $('#update-public-field-btn').button('loading');
          
          var formData = new FormData();
          formData.append('is_public', false);
          
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
          }).fail(function(data) {
            console.log('Failed to update result to public: ' + data);
          }).always(function() {
            $('#update-public-field-btn').button('reset');
          }); 
        });
      } else {
        $('#move-to-main-page-btn').html('나도 확인해보기');
      }
    }).fail(function(data) {
      // When result is not exist or not public
      $('#forbidden-alert-message').removeClass('hidden');
      $('#move-to-main-page-btn').html('설문 참여하기');
      console.log('Failed to get result: ' + data);
    }); 
    
    // Get result object (Two dimensional analysis)
    var formData = new FormData();
    formData.append('category', 'party_2d');
     
    $.ajax({
      url: '/api/results/',
      type: 'POST',
      data: formData,
      contentType: false,
      processData: false
    }).done(function(data) {
      var rows = JSON.parse(data.record.replace(/'/g, '"'));
      var chartWidth = $('#chartContainer').width();
      var svgBlock = dimple.newSvg('#chartContainer', chartWidth, chartWidth);
      var myChart = new dimple.chart(svgBlock, rows);
      
      myChart.setBounds(10, 10, chartWidth, chartWidth);
      // myChart.setMargins(100, 100, 100, 100);
      
      var xAxis= myChart.addMeasureAxis('x', 'x_coordinate');
      var yAxis = myChart.addMeasureAxis('y', 'y_coordinate');
      var zAxis = myChart.addMeasureAxis('z', 'radius');
      
      xAxis.title = '가로축: 경제';
      xAxis.fontSize = 12;
      
      yAxis.title = '세로축: 사회';
      yAxis.fontSize = 12;
      
      var mySeries = myChart.addSeries('name', dimple.plot.bubble);
      
      rows.forEach(function(row, index) {
        myChart.assignColor(row.name, row.color);
      });
      
      mySeries.afterDraw = function (shp, d, i) {
          var shape = d3.select(shp);
          svg.append('text')
              .attr('x', parseFloat(shape.attr('cx')-20))
              .attr('y', parseFloat(shape.attr('cy')))
              .style('test-anchor','middle')
              .style('font-size', '20px')
              .style('font-family', 'sans-serif')
              .style('opacity', 0.7)
              .text(rows[i].name)
      };
      
      myChart.draw(1000);
    }).fail(function(data) {
      console.log('Failed to get two dimensional result: ' + data);
    }); 
    
    // Social media sharing feature
    /* Kakao talk sharing
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
    
    // Alert that kakaotalk and line messenger sharing is only available at mobile
    $(document).on('click', '#line-share, #kakaotalk-share', function() {
      // Detect desktop browser
      if (!('ontouchstart' in window)) {
        alert("모바일에서만 가능합니다");
      }
      return false;
    });
    
    // Alert that twitter sharing in IE(<11) is not working properly
    $(document).on('click', '#twitter-share', function() {
      // Check whether browser is IE or not
      if (window.navigator.userAgent.indexOf("MSIE ") > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        alert("IE 10 이하에서 트위터 공유는 정상적으로 작동하지 않습니다.");
        return false;
      }
    });
  }
});

$(window).load(function() {
  $('#loading-icon').addClass('hidden');
});
