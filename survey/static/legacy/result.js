'use strict';

// Load modules
require('bootstrap-webpack');

// Load custom modules
var setCSRFToken = require('../module/setCSRFToken.js');
var setAuthToken = require('../module/setAuthToken.js');
var clearAuthToken = require('../module/clearAuthToken.js');
var loadResultPage = require('../module/loadResultPage.js');
var drawTwoDimensionalChart = require('../module/drawTwoDimensionalChart.js');

// Global variables
var pathName = window.location.pathname;
var domainName = $('#domain-name').val();
// Support for optimizely editor
if (RegExp(domainName).test(pathName)) pathName = pathName.split(domainName)[1];
var resultID = pathName.match(/result\/(\d+)/)[1];

$(document).on('click', '#move-to-1d-result-page-btn', function() {
  $('#move-to-1d-result-page-btn').button('loading');
  loadResultPage($('#survey-id').val(), 'comparison_1d');
});

$(document).on('click', '#move-to-2d-result-page-btn', function() {
  $('#move-to-2d-result-page-btn').button('loading');
  loadResultPage($('#survey-id').val(), 'comparison_2d');
});

// Update chevron direction when collapsing state of record card is changed
$(document).on('click', '#report-card-toggle-btn', function() {
  var $toggleBtn = $('#report-card-toggle-btn').find('.glyphicon'); 
  if ($toggleBtn.hasClass('glyphicon-chevron-down')) {
    $toggleBtn.removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
  } else {
    $toggleBtn.removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
  }
});

// Fill out report card row
$(document).on('show.bs.collapse', '#report-card .panel-collapse', function() {
  $('#loading-icon').removeClass('hidden');

  var $reportCardRow = $(this);
  $reportCardRow.find('.choice-voters').html('');

  // Set authentication token at HTTP header
  setAuthToken();

  $.ajax({
    url: '/api/records/' + parseInt($reportCardRow.attr('data-question-id'))  + '/',
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
  /* TODO Upload base64 encoded image
  if ($('#result-2d-chart__img').attr('src') != '') {
    formData.append('base64_encoded_image', $('#result-2d-chart__img').attr('src'));
  }
  */ 
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

$(window).load(function() {

  // Set authentication token at HTTP header
  setAuthToken();
  
  // Get result object (One dimensional analysis)
  $.ajax({
    url: '/api/results/' + resultID + '/',
    type: 'GET'
  }).done(function(data) {
    $('#survey-id').val(data.survey);
    
    // One dimensional analysis
    if (data.category == 'comparison_1d') {
      var updatedAt = new Date(data.updated_at);
      $('#record-additional-info').html(updatedAt.getFullYear() + '년 ' +  parseInt(parseInt(updatedAt.getMonth()) + 1) + 
        '월 ' + updatedAt.getDate() + '일에 업데이트됐습니다');
      
      $('#move-to-1d-result-page-btn').removeClass('btn-default').addClass('btn-primary');
      $('#result-1d-chart').removeClass('hidden');
      
      var rows = JSON.parse(data.record.replace(/'/g, '"'));
      
      // Sorting as descending order
      rows = _.orderBy(rows, 'similarity', 'desc');
      
      rows.forEach(function(row, index) {
        $('#result-1d-chart').append('<div class="progress">' +
          '<div class="progress-bar progress-bar-striped" role="progressbar" style="width: ' +
            row.similarity + '%; background-color: ' + row.color + ';"><strong>' + row.name + 
            '</strong> <small>(' + row.similarity + '%' + ')</small></div></div>');
      });
      
      // Fill out result summary
      $('.most-similar-target').text(rows[0].name).css('background-color', rows[0].color);
      $('#result-1d-summary').removeClass('hidden');
    }
    // Two dimensional analysis
    else {
      var updatedAt = new Date(data.updated_at);
      $('#record-additional-info').html('X,Y축의 눈금 간격이 달라, 보이는 거리와 실제 거리가 다를 수 있습니다. ' + 
          updatedAt.getFullYear() + '년 ' +  parseInt(parseInt(updatedAt.getMonth()) + 1) + '월 ' + 
          updatedAt.getDate() + '일에 업데이트됐습니다');
      
      $('#move-to-2d-result-page-btn').removeClass('btn-default').addClass('btn-primary');
      $('#result-2d-chart').removeClass('hidden');
      
      var xAxisName = data.x_axis_name;
      var yAxisName = data.y_axis_name;
      
      var rows = JSON.parse(data.record.replace(/'/g, '"'));
      drawTwoDimensionalChart(rows, xAxisName, yAxisName);
      localStorage.setItem('chart_width', $('#result-2d-chart').width());
      
      // Redraw chart when window resized (Prevent from resize event fires multiple times)
      var redraw = function() {
        if (localStorage.getItem('chart_width') != $('#result-2d-chart').width()) {
          $('#result-2d-chart').empty();
          drawTwoDimensionalChart(rows, xAxisName, yAxisName);
          localStorage.setItem('chart_width', $('#result-2d-chart').width());
        }
      };
      var debouncedRedraw = _.debounce(redraw, 750);
      $(window).on('resize', debouncedRedraw);
    }
    
    // When user is owner of result
    if (data.user == localStorage.getItem('user_id')) {
      $('#move-to-main-page-btn').html('홈화면으로 이동하기');
      $('#share-btn-group').removeClass('hidden');
      if (data.is_public) $('#update-public-field-btn').removeClass('hidden');
      
      // Make report card which compares target records with user records
      $.ajax({
        url: '/api/questions/',
        type: 'GET',
        data: {
          'survey_id': $('#survey-id').val()
        }
      }).done(function(data) {
        data.forEach(function(question, index) {
          var questionIndex = index + 1;
          var $reportCardRow = $('#report-card-row-virtual-dom').clone().removeClass('hidden').removeAttr('id');
          $reportCardRow.find('.panel-heading').attr('href', '#Q' + questionIndex).
            html('#' + questionIndex + ' ' +  question.explanation);
          $reportCardRow.find('.panel-collapse').attr({'id': 'Q' + questionIndex, 'data-question-id': question.id});
          
          // Fill out name list of voters for each choice
          var choices = question.choices;
          choices.forEach(function(choice, index) {
            $reportCardRow.find('.panel-body').append('<p>' + choice.context + 
              ' : <span class="choice-voters" data-choice-id="' + choice.id + '"></span></p>');
          });
          
          $('#report-card-accordion').append($reportCardRow); 
        });
        
        $('#report-card-row-virtual-dom').remove();
      });
    }
    // When user is not authenticated
    else {
      $('#result-category').addClass('hidden');
      $('#move-to-main-page-btn').html('나도 확인해보기');
    }
  }).fail(function(data) {
    // When result is not exist or not public
    $('#result-navbar, #result-2d-summary').addClass('hidden');
    $('#forbidden-alert-message').removeClass('hidden');
    $('#move-to-main-page-btn').html('나와 어울리는 정당 찾기');
  }); 
});
