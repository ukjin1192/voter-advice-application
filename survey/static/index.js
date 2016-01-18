'use strict';

// Load bootstrap with custom configuration
require('bootstrap-webpack!./bootstrap.config.js');
require('./styles.scss');

var setCSRFToken = require('./module/setCSRFToken');
var setAuthToken = require('./module/setAuthToken');
var clearAuthToken = require('./module/clearAuthToken');
var getCaptcha = require('./module/getCaptcha');

$(document).on('click', '#refresh-captcha', getCaptcha);

$(document).on('click', '.question-weight', function() {
  var button = $(this);
  if (button.hasClass('active')) {
    button.html('공감이 안되면 눌러주세요');
  } else {
    button.html('공감이 되면 눌러주세요');
  }
});

// Validate captcha input and create user
$(document).on('submit', '#create-user-form', function(event) {
  event.preventDefault();

  // Clear alert message and hide it
  $('#create-user-form-alert-message').html('').addClass('hidden');
  $('#create-user-submit-btn').button('loading');

  var formData = new FormData();
  formData.append('captcha_key', $('#captcha-key').val());
  formData.append('captcha_value', $('#captcha-value').val());

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
    if (data.state == false) {
      $('#create-user-form-alert-message').html('일치하지 않습니다').removeClass('hidden');
    } else {
      // Save user's token and ID
      localStorage.setItem('token', data.token);
      localStorage.setItem('user_id', data.id);
      
      // Clear captcha input form
      $('#captcha-key').val('');
      $('#captcha-value').val('');
      
      // Clear original survey data
      $('.question-choice').attr('checked', false); 
      $('.question-weight').removeClass('active').html('공감이 되면 눌러주세요');
      $('.answer-id').val('');
      $('.original-choice-id').val('');
      $('.original-weight').val('');
      $('input[name="sex"]').attr('checked', false);
      $('#year-of-birth').val('');
      $('#supporting-party').val('');
      
      // Set authentication token at HTTP header
      setAuthToken();
      
      // Move to 1st survey page
      $.fn.fullpage.moveSectionDown();
      
      // Hide buttons for participated user
      $('#continue-survey-btn').addClass('hidden');
      $('#edit-survey-btn').addClass('hidden');
      $('#move-to-result-list-btn').addClass('hidden');
    }
  }).fail(function(data) {
    console.log('Failed to create user: ' + data);
  }).always(function() {
    $('#create-user-submit-btn').button('reset');
  }); 
});

$(document).on('click', '#submit-survey-btn', function() {
  // Clear alert message
  $('#submit-survey-alert-message').addClass('hidden').html('');
  $('#submit-survey-btn').button('loading');

  // Save additional info
  var formData = new FormData();
  formData.append('sex', $('input[name="sex"]:checked').val());
  formData.append('year_of_birth', $('#year-of-birth').val());
  formData.append('supporting_party', $('#supporting-party').val());
  
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
  
  // Check user chose all questions
  var totalQuestions = $('.question').length;
  var unansweredQuestions = [];

  for (var i = 0; i < totalQuestions; i++) {
    var question = $($('.question')[i]); 
    if (question.find('.question-choice[type="radio"]:checked').length == 0 || 
        question.find('.answer-id').val() == '') {
      unansweredQuestions.push(i + 1);
    }
  }

  // When user does not completed survey 
  if (unansweredQuestions.length > 0) {
    $('#submit-survey-alert-message').
      html('다음 질문들의 답을 택해주세요 : ' + unansweredQuestions.join(', ')).removeClass('hidden');
  }
  // Move to result list page when user completed survey
  else {
    location.href = '/result/';
  }
});

$(document).on('click', '#get-party-result-btn', function() {
  // Set authentication and CSRF tokens  at HTTP header
  setAuthToken();
  setCSRFToken();

  $('#get-party-result-btn').button('loading');

  var formData = new FormData();
  formData.append('category', 'party');

  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // Move to result detail page
    location.href = '/result/' + data.id + '/';
  }).fail(function(data) {
    console.log('Failed to get result ID: ' + data);
  }).always(function() {
    $('#get-party-result-btn').button('reset');
  }); 
});

$(document).ready(function() {
  var pathname = window.location.pathname;

  // Main page with survey
  if (pathname == '/') {
    // Fill out captcha form
    getCaptcha();
    
    // Get all questions without user answers
    $.ajax({
      url: '/api/questions/',
      type: 'GET'
    }).done(function(data) {
      var totalQuestions = data.length;
      var totalSections = totalQuestions + 3;
      
      data.forEach(function(question, index) {
        var sectionDOM = $('#section-virtual-dom').clone().removeClass('hidden').removeAttr('id');
        sectionDOM.find('.progress-bar').css('width', (index + 1) / (totalQuestions + 1) * 100 + '%');
        sectionDOM.find('.question-id').val(question.id);
        sectionDOM.find('.question-order').val(index + 1);
        sectionDOM.find('.question-image').attr('data-src', question.image_url);
        sectionDOM.find('.question-explanation').html(question.explanation);
        
        var choices = question.choices;
        choices.forEach(function(choice) {
          sectionDOM.find('.question-choices').append('<div class="radio"><label>' + '<input type="radio" ' +
            'class="question-choice" name="question-' + question.id + '" value="' + choice.id + '" />' + 
            choice.context + '</label></div>');
        });
        
        $('#page-scroll-container .section').last().before(sectionDOM);
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
          
          var completedSurvey = data.user_participated;
          
          // Get user answers
          $.ajax({
            url: '/api/answers/',
            type: 'GET'
          }).done(function(data) {
            // Fill out answers
            data.forEach(function(answer, index) {
              var questionBlock = $('.question-choice[type="radio"][value="' + answer.choice + '"]').
                attr('checked', true).closest('.question');
              questionBlock.find('.answer-id').val(answer.id);
              questionBlock.find('.original-choice-id').val(answer.choice);
              questionBlock.find('.original-weight').val(answer.weight);
              if (answer.weight == 2) {
                questionBlock.find('.question-weight').button('toggle');
                questionBlock.find('.question-weight').html('공감이 안되면 눌러주세요');
              }
            });
            
            if (completedSurvey) {
              $('#edit-survey-btn, #move-to-result-list-btn').removeClass('hidden');
            } else {
              var lastQuestionOrder = parseInt($('.question-choice[type="radio"]:checked').last().
                closest('section').find('.question-order').val());
              if (lastQuestionOrder >= 1 && lastQuestionOrder < totalQuestions) {
                $('#continue-survey-btn').attr('href', '#Q' + (lastQuestionOrder + 1)).removeClass('hidden');
              } else if (lastQuestionOrder == totalQuestions) {
                $('#continue-survey-btn').attr('href', '#additional').removeClass('hidden');
              } else {
                $('#continue-survey-btn').attr('href', '#tag').removeClass('hidden');
              }
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
        localStorage.clear();
      }
      
      var anchorsList = ['main', 'tag'];
      for (var i = 1; i < totalQuestions + 1; i++) {
        anchorsList.push('Q' + i);
      }
      anchorsList.push('additional');
      
      // Inititate fullpage.js with options
      $('#page-scroll-container').removeClass('hidden').fullpage({
        // Enable anchor and history feature
        anchors: anchorsList,
        paddingTop: $('#header').outerHeight(),
        // Disables featutre moving to specific section when loaded
        animateAnchor: false,
        onLeave: function(index, nextIndex, direction){
          var leavingSection = $(this);
          
          if (index > 2 && index < totalSections) {
            var choiceID = leavingSection.find('.question-choice[type="radio"]:checked').val();
            var originalChoiceID = leavingSection.find('.original-choice-id').val();
            var answerID = leavingSection.find('.answer-id').val();
            var weight = leavingSection.find('.question-weight').hasClass('active') + 1;
            var originalWeight = leavingSection.find('.original-weight').val();
            
            if (choiceID != undefined) {
              // Create answer
              if (answerID == '') {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                formData.append('weight', weight);
                formData.append('duration', 4);
                
                setAuthToken();
                setCSRFToken();
                
                $.ajax({
                  url: '/api/answers/',
                  type: 'POST',
                  data: formData,
                  contentType: false,
                  processData: false
                }).done(function(data) {
                  leavingSection.find('.answer-id').val(data.id);
                  leavingSection.find('.original-choice-id').val(choiceID);
                  leavingSection.find('.original-weight').val(weight);
                }).fail(function(data) {
                  console.log('Failed to create answer: ' + data);
                }); 
              }
              // Update answer
              else if (originalChoiceID != choiceID || originalWeight != weight) {
                var formData = new FormData();
                formData.append('choice_id', choiceID);
                formData.append('weight', weight);
                formData.append('duration', 4);
                
                setAuthToken();
                setCSRFToken();
                
                $.ajax({
                  url: '/api/answers/' + answerID + '/',
                  type: 'PATCH',
                  data: formData,
                  contentType: false,
                  processData: false
                }).done(function(data) {
                  leavingSection.find('.original-choice-id').val(choiceID);
                  leavingSection.find('.original-weight').val(weight);
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
          // TODO Save tags
          else if (index == 2) {
          }
          // Save additional info
          else if (index == totalSections) {
            var formData = new FormData();
            formData.append('sex', $('input[name="sex"]:checked').val());
            formData.append('year_of_birth', $('#year-of-birth').val());
            formData.append('supporting_party', $('#supporting-party').val());
            
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
            }); 
          }
        }
      });
    }).fail(function(data) {
      console.log('Failed to get questions: ' + data);
    }); 
  } 
  // Result list page
  else if (pathname == '/result/') {
    // Inititate fullpage.js with options
    $('#page-scroll-container').fullpage({
      paddingTop: $('#header').outerHeight(),
    });
  } 
  // Result detail page
  else if (/result\/(\d+)/.test(pathname)) {
    var resultID = pathname.match(/result\/(\d+)/)[1]
    
    // Set authentication token at HTTP header
    setAuthToken();
    
    // Get result object
    $.ajax({
      url: '/api/results/' + resultID + '/',
      type: 'GET'
    }).done(function(data) {
      switch (data.category) {
        case 'party': 
          $('#result-category').html('정당 유사도');
          break;
        default:
          break;
      }
      var updatedAt = new Date(data.updated_at);
      $('#record-updated-at').html('최종 업데이트 : ' + updatedAt.getFullYear() + '-' +
        updatedAt.getMonth() + 1 + '-' + updatedAt.getDate());
      
      var rows = JSON.parse(data.record.replace(/'/g, '"'));
      // TODO sorting
      rows.forEach(function(row, index) {
        switch (index % 4) {
          case 0:
            $('#result-chart').append('<div class="progress">' +
              '<div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" style="width: ' +
                row.value + '%">' + row.value + '%' + '</div></div>');
            $('#label-list').append('<span class="label label-success">' + row.key + '</span>');
            break;
          case 1:
            $('#result-chart').append('<div class="progress">' +
              '<div class="progress-bar progress-bar-info progress-bar-striped" role="progressbar" style="width: ' +
                row.value + '%">' + row.value + '%' + '</div></div>');
            $('#label-list').append('<span class="label label-info">' + row.key + '</span>');
            break;
          case 2:
            $('#result-chart').append('<div class="progress">' +
              '<div class="progress-bar progress-bar-warning progress-bar-striped" role="progressbar" style="width: ' +
                row.value + '%">' + row.value + '%' + '</div></div>');
            $('#label-list').append('<span class="label label-warning">' + row.key + '</span>');
            break;
          case 3:
            $('#result-chart').append('<div class="progress">' +
              '<div class="progress-bar progress-bar-danger progress-bar-striped" role="progressbar" style="width: ' +
                row.value + '%">' + row.value + '%' + '</div></div>');
            $('#label-list').append('<span class="label label-danger">' + row.key + '</span>');
            break;
          default:
            break;
        }
      });
      
      // When user is owner of result
      if (data.user == localStorage.getItem('user_id')) {
        $('#share-btn-group').removeClass('hidden');
        $('#move-to-result-list-btn').removeClass('hidden');
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
        $('#move-to-main-page-btn').removeClass('hidden');
      }
    }).fail(function(data) {
      // When result is not exist or not public
      $('#forbidden-alert-message').removeClass('hidden');
      $('#move-to-main-page-btn').removeClass('hidden');
      console.log('Failed to get result: ' + data);
    }).always(function() {
      // Inititate fullpage.js with options
      $('#page-scroll-container').fullpage({
        paddingTop: $('#header').outerHeight(),
      });
    }); 
    
    // Social media sharing feature
    /* TODO Kakao talk sharing
    Kakao.init('');
    Kakao.Link.createTalkLinkButton({
      container: '#kakaotalk-share',
      label: '[핑] 당신의 위치를 확인하세요',
      image: {
        src: 'http://res.cloudinary.com/modupen/image/upload/v1441194561/basic%20component/kakaotalk_share.png',
        width: '274',
        height: '99'
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
