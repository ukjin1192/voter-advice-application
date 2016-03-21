'use strict';

// Load modules
require('bootstrap-webpack');
var fullpage = require('fullpage.js');
require('jquery-slimscroll');

// Load custom modules
var setCSRFToken = require('../module/setCSRFToken.js');
var setAuthToken = require('../module/setAuthToken.js');
var clearAuthToken = require('../module/clearAuthToken.js');

// Global variables
var totalSlides = 19;
var activeSlideIndex; // Starting from 1
var answerList = {};
var questionList = [];

// Initiate answer list
for (var i=1; i<=totalSlides; i++) {
  answerList[i] = null;
}

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
	$('.header__title').text(questionList[index].header_title);
	$('.header__subtitle').text(questionList[index].header_subtitle);
}

// Toggle slide navigation arrows
$(document).on('click', '.slide', function() {
  if ($('.fp-controlArrow').hasClass('hidden')) $('.fp-controlArrow').removeClass('hidden');
  else $('.fp-controlArrow').addClass('hidden');
});

// Choose choice and move to next slide
$(document).on('click', '.choice', function() {
  var $choice = $(this);

  if ($choice.hasClass('choice--agreement')) answerList[activeSlideIndex] = 1;
  else if ($choice.hasClass('choice--abtention')) answerList[activeSlideIndex] = 0;
  else if ($choice.hasClass('choice--disagreement')) answerList[activeSlideIndex] = -1;

  if (activeSlideIndex == totalSlides) {
    var queryString = '';
    
    $.each(answerList, function(key, value) { 
      queryString += '&' + key + '=' + value;
    });
    queryString = '?' + queryString.substring(1, queryString.length);
    location.href = '/assembly/result/' + queryString;
  } else {
    $.fn.fullpage.moveSlideRight();
  }
});

$(window).load(function() {

  for (var i=0; i<totalSlides; i++) {
    questionList.push({
      'header_title': '테러방지법' + i,
      'header_subtitle': '국민보호와 공공안전을 위한 테러방지법안' + i,
      'agreement_speaker_image': 'http://placehold.it/100x100',
      'agreement_speaker_name': '홍길동' + i,
      'agreement_content': '가나다라 마바사 아자차카 타파하' + i,
      'disagreement_speaker_image': 'http://placehold.it/100x100',
      'disagreement_speaker_name': '홍길동' + i,
      'disagreement_content': '가나다라 마바사 아자차카 타파하' + i,
      'cheating_paper_content': ' 컨닝페이퍼 내용' + i
    });
  }
  
  for (var i=0; i<totalSlides; i++) {
    var $slide = $('#slide-virtual-dom').clone().removeClass('hidden').removeAttr('id');
    $slide.find('.statement--agreement .statement__speaker-image').attr('src', questionList[i].agreement_speaker_image);
    $slide.find('.statement--agreement .statement__speaker-name').text(questionList[i].agreement_speaker_name);
    $slide.find('.statement--agreement .statement__content').text(questionList[i].agreement_content);
    $slide.find('.statement--disagreement .statement__speaker-image').attr('src', questionList[i].agreement_speaker_image);
    $slide.find('.statement--disagreement .statement__speaker-name').text(questionList[i].agreement_speaker_name);
    $slide.find('.statement--disagreement .statement__content').text(questionList[i].agreement_content);
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
      
      syncProgressBar(activeSlideIndex * 100 / totalSlides);
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
      
      // Choose default choice when user didn't choose anything
      if (answerList[activeSlideIndex] === null && direction == 'right') answerList[activeSlideIndex] = 0;
      
      syncProgressBar((nextSlideIndex + 1) * 100 / totalSlides);
      syncTitle(nextSlideIndex);
    },
  }); 
});
