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

// Synchronize title
function syncTitle(index) {
	$('.header__title').text(questionList[index].title);
}

// Save choice
function saveChoice(choiceID) {

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
  });
}

// Submit survey (Update user profile and create new result)
$(document).on('click', '.survey__submit-btn', function() {

  var $submitBtn = $(this);
  $submitBtn.button('loading');

  // Update user profile
  if ($('input[name="sex"]:checked').val() != undefined || $('#year-of-birth').val() != '' || $('#political-tendency').val() != '') {
    // Set authentication and CSRF tokens at HTTP header
    setAuthToken();
    setCSRFToken();
    
    var formData = new FormData();
    if ($('input[name="sex"]:checked').val() != undefined) formData.append('sex', $('input[name="sex"]:checked').val());
    if ($('#year-of-birth').val() != '') formData.append('year_of_birth', $('#year-of-birth').val());
    if ($('#political-tendency').val() != '') formData.append('political_tendency', $('#political-tendency').val());
    
    $.ajax({
      url: '/api/users/' + localStorage.getItem('user_id') + '/',
      type: 'PATCH',
      data: formData,
      contentType: false,
      processData: false
    });
  }

  // Set authentication and CSRF tokens at HTTP header
  setAuthToken();
  setCSRFToken();

  var formData = new FormData();
  formData.append('survey_id', surveyID);
  formData.append('category', 'city_block_distance');
  
  // Create new result
  $.ajax({
    url: '/api/results/',
    type: 'POST',
    data: formData,
    contentType: false,
    processData: false
  }).done(function(data) {
    // Move to result page
    location.href = '/party/result/' + data.id + '/';
  }).always(function() {
    $submitBtn.button('reset');
  });
});

// Toggle slide navigation arrows
$(document).on('click', '.slide', function() {
  if ($('.fp-controlArrow').hasClass('hidden')) $('.fp-controlArrow').removeClass('hidden');
  else $('.fp-controlArrow').addClass('hidden');
});

// Choose choice and move to next slide
$(document).on('click', '.choice', function() {
  var $choice = $(this);

  $choice.closest('.question__choices').find('.choice').removeClass('active');
  $choice.addClass('active');

  saveChoice($choice.attr('data-choice-id'));

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
        'title': (index + 1).toString() + '. ' + question.title,
      });
      
      var $slide = $('#slide-virtual-dom').clone().removeClass('hidden').removeAttr('id');
      $slide.attr('data-anchor', index + 1);
      $slide.find('.question__explanation').text(question.explanation);
      $slide.find('.cheating-paper__content').text(question.cheating_paper);
      
      var choices = question.choices;
      choices.forEach(function(choice, index) {
        $slide.find('.question__choices').append('<div class="choice" data-choice-id="' + choice.id + '">' + choice.context + '</div>');
      });
      
      $('.survey__body .section').append($slide);
    });
    
    $('#slide-virtual-dom').remove();
    
    // Append additional info slide
    var $slide = $('#additional-info-slide').clone().removeClass('hidden').removeAttr('id');
    $('.survey__body .section').append($slide);
    questionList.push({
      'title': '사용자 설문 조사 (선택사항)',
    });
    
    $('#additional-info-slide').remove();
    
    // Inititate fullpage.js with options
    $('.survey__body').fullpage({
      fixedElements: '.survey__header',
      // Padding top and bottom are required to use slimscroll with fixed elements
      paddingTop: $('.survey__header').outerHeight(),
      scrollOverflow: true, 
      loopHorizontal: false,
      verticalCentered: false,
      
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
