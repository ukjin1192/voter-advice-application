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
var surveyID = 2;
var activeSlideIndex;   // Starting from 1
var questionList = [];  // Starting from 0

// Show additional information of statement
$(document).on('show.bs.modal', '#cheating-paper', function() {
  $(this).find('.modal-body').html($('.slide.active').find('.cheating-paper__content').text());
});

// Synchronize progress bar
function syncProgressBar(value) {
  $('.header__progress-bar').css('width', value + '%');
}

// Synchronize title and subtitle
function syncTitle(index) {
	$('.header__title').text((index + 1).toString() + '. ' + questionList[index].title);
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
        location.href = '/party/result/' + data.id + '/';
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
    location.href = '/party/';
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
      location.href = '/party/';
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
      
      questionList.push({
        'title': question.title,
      });
      
      var $slide = $('#slide-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $slide.attr('data-anchor', index + 1);
      $slide.find('.question__explanation').text(question.explanation);
      $slide.find('.cheating-paper__content').text(question.cheating_paper);
      
      var choices = question.choices;
      choices.forEach(function(choice, index) {
        $slide.find('.question__choices').append('<div class="question__choice" data-choice-id="' + choice.id + '" style="background-color: #414042; font-size: 1.2em; padding; 5px 0;"">' + choice.context + '</div>');
      });
      
      $('.survey__body .section').append($slide);
    });
    
    $('#slide-virtual-dom').remove();
    
    // Inititate fullpage.js with options
    $('.survey__body').fullpage({
      fixedElements: '.survey__header',
      // Padding top and bottom are required to use slimscroll with fixed elements
      paddingTop: $('.survey__header').outerHeight(),
      scrollOverflow: true, 
      loopHorizontal: false,
      
      afterRender: function() {
        // Update active slide index
        activeSlideIndex = $('.slide').index($('.slide.active')) + 1;
        
        syncProgressBar(activeSlideIndex * 100 / questionList.length);
        syncTitle(activeSlideIndex - 1);
        
        // Toggle off slide navigation arrows
        $('.fp-controlArrow').addClass('hidden');
      },
      
      afterSlideLoad: function(anchorLink, index, slideAnchor, slideIndex) {
        var $loadedSlide = $(this);
        
        // Update active slide index
        activeSlideIndex = slideIndex + 1;
        
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
