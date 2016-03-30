'use strict';

// Load modules
require('bootstrap-webpack');
var fullpage = require('fullpage.js');
require('jquery-slimscroll');

// Load custom modules
var setCSRFToken = require('../../module/setCSRFToken.js');
var setAuthToken = require('../../module/setAuthToken.js');
var clearAuthToken = require('../../module/clearAuthToken.js');

// Global variables
var surveyID = 1;
var activeSlideIndex;   // Starting from 1
var answerList = {};
var questionList = [];  // Starting from 0

// Show additional information of statement
$(document).on('show.bs.modal', '#cheating-paper', function() {
  $(this).find('.modal-body').html($('.slide.active').find('.cheating-paper__content').text());
});

// Synchronize progress bar
function syncProgressBar(value) {
  $('.header__progress-bar').css('width', value + '%');
}

// Synchronize choice with record
function syncChoice(value) {
  $('.choice').removeClass('choice--active');

  if (value === 1) $('.choice--agreement').addClass('choice--active');
  else if (value === 0) $('.choice--abtention').addClass('choice--active');
  else if (value === -1) $('.choice--disagreement').addClass('choice--active');
}

// Synchronize title and subtitle
function syncTitle(index) {
	$('.header__title').text((index + 1).toString() + '. ' + questionList[index].header_title);
	$('.header__subtitle').text(questionList[index].header_subtitle);
}

// Save choice
function saveChoice(choiceID) {
  // When user completed survey
  if (activeSlideIndex == questionList.length) var completed = true; 
  else var completed = false;

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  var formData = new FormData();
  formData.append('choice_id', choiceID);

  $.ajax({
    url: '/api/answers/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // When user completed survey
    if (completed) {
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
      });
    }
  });
}

// Toggle slide navigation arrows
$(document).on('click', '.slide', function() {
  if ($('.fp-controlArrow').hasClass('hidden')) $('.fp-controlArrow').removeClass('hidden');
  else $('.fp-controlArrow').addClass('hidden');
});

// Choose choice and move to next slide
$(document).on('click', '.choice', function() {
  var $choice = $(this);

  if ($choice.hasClass('choice--agreement')) {
    answerList[activeSlideIndex] = 1;
    saveChoice(questionList[activeSlideIndex - 1].agreement_choice_id);
  } else if ($choice.hasClass('choice--abtention')) {
    answerList[activeSlideIndex] = 0;
    saveChoice(questionList[activeSlideIndex - 1].abtention_choice_id);
  } else if ($choice.hasClass('choice--disagreement')) {
    answerList[activeSlideIndex] = -1;
    saveChoice(questionList[activeSlideIndex - 1].disagreement_choice_id);
  }

  // Move to next slide
  $.fn.fullpage.moveSlideRight();
});

$(window).load(function() {

  // Check user is valid
  if (localStorage.getItem('token') === null || localStorage.getItem('user_id') === null) {
    localStorage.removeItem('token');
    localStorage.removeItem('user_id');
    clearAuthToken();
    
    // Redirect to landing page if user is not valid 
    location.href = '/assembly/';
  } else {
    // Set authentication token at HTTP header
    setAuthToken();
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'GET'
    }).fail(function() {
      // When user is invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user_id');
      clearAuthToken();
      
      // Redirect to landing page if user is not valid 
      location.href = '/assembly/';
    });
  }

  $.ajax({
    url: '/api/questions/',
    type: 'GET',
    data: {
      'survey_id': surveyID
    }
  }).done(function(data) {
    
    data.forEach(function(question, index) {
      var questionTemporaryExplanation = question.explanation.split('|');
      var choices = question.choices;
      var agreementChoiceID, abtentionChoiceID, disagreementChoiceID;
      choices.forEach(function(choice) {
        switch (choice.factor) {
          case 1:
            agreementChoiceID = choice.id;
            break;
          case 0:
            abtentionChoiceID = choice.id;
            break;
          case -1:
            disagreementChoiceID = choice.id;
            break;
          default:
            break;
        }
      });
      
      questionList.push({
        'header_title': question.title,
        'header_subtitle': question.subtitle,
        'agreement_content': questionTemporaryExplanation[0],
        'disagreement_content': questionTemporaryExplanation[1],
        'agreement_choice_id': agreementChoiceID,
        'abtention_choice_id': abtentionChoiceID,
        'disagreement_choice_id': disagreementChoiceID,
        'cheating_paper_content': question.cheating_paper
      });
      
      // Initiate answer list
      answerList[index + 1] = null;
    });
       
    for (var i=0; i<questionList.length; i++) {
      var $slide = $('#slide-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $slide.attr('data-anchor', i + 1);
      $slide.find('.statement--agreement .statement__content').text(questionList[i].agreement_content);
      $slide.find('.statement--disagreement .statement__content').text(questionList[i].disagreement_content);
      $slide.find('.cheating-paper__content').text(questionList[i].cheating_paper_content);
      $('.survey__body .section').append($slide);
    }
    
    $('#slide-virtual-dom').remove();
    
    // Inititate fullpage.js with options
    $('.survey__body').fullpage({
      fixedElements: '.survey__header, .survey__footer',
      // Padding top and bottom are required to use slimscroll with fixed elements
      paddingTop: $('.survey__header').outerHeight(),
      paddingBottom: $('.survey__footer').outerHeight(),
      scrollOverflow: true, 
      loopHorizontal: false,
      
      afterRender: function() {
        // Update active slide index
        activeSlideIndex = $('.slide').index($('.slide.active')) + 1;
        
        syncProgressBar(activeSlideIndex * 100 / questionList.length);
        syncChoice(answerList[activeSlideIndex]);
        syncTitle(activeSlideIndex - 1);
        
        // Toggle off slide navigation arrows
        $('.fp-controlArrow').addClass('hidden');
      },
      
      afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) {
        var $loadedSlide = $(this);
        
        // Update active slide index
        activeSlideIndex = slideIndex + 1;
        
        syncChoice(answerList[activeSlideIndex]);
        
        // Toggle off slide navigation arrows
        $('.fp-controlArrow').addClass('hidden');
      },
      
      onSlideLeave: function(anchorLink, index, slideIndex, direction, nextSlideIndex) {
        var $leavingSlide = $(this);
        
        syncProgressBar((nextSlideIndex + 1) * 100 / questionList.length);
        syncTitle(nextSlideIndex);
      },
    }); 
  });
});
