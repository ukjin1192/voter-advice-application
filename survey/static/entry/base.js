'use strict';

// Embed stylesheet (Project stylesheet should be placed at the end)
require('fullpage.js/jquery.fullPage.css');
require('rangeslider.js/dist/rangeslider.css');
require('../styles.scss');

// Load modules
var attachFastClick = require('fastclick');

// Global variables
var pathName = window.location.pathname;
var domainName = $('#domain-name').val();
// Support for optimizely editor
if (RegExp(domainName).test(pathName)) pathName = pathName.split(domainName)[1];

// Voice of customer
$(document).on('click', '#voice-of-customer-submit-btn', function() {
  // Set CSRF token at HTTP header
  setCSRFToken();
  if (localStorage.getItem('token') != null && localStorage.getItem('user_id') != null) setAuthToken();
  
  if ($('#voice-of-customer textarea').val() == '') return false;
  else $('#voice-of-customer-submit-btn').button('loading');

  var formData = new FormData();
  formData.append('context', $('#voice-of-customer textarea').val());
  if (/survey\/(\d+)/.test(pathName)) formData.append('survey_id', pathName.match(/survey\/(\d+)/)[1]);

  $.ajax({
    url: '/api/voice_of_customers/',
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

// Alert that line and kakaotalk messenger sharing is only available at mobile
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

$(window).load(function() {

  // Hide loading icon
  $('#loading-icon').addClass('hidden');

  // Ease effect when body DOM loads
  $('#main-container').animate({ opacity: 1 }, 700);

  // Attach fast-click to boost up touch reaction
  attachFastClick.attach(document.body);

  var userAgent = window.navigator.userAgent;
  var msie = userAgent.indexOf('MSIE ');

  // Warn user who uses Internet Explorer lower than version 10
  if (msie > 0 && parseInt(userAgent.substring(msie + 5, userAgent.indexOf(".", msie))) < 10) {
    $('#browser-support-alert-message').html('Internet Explorer 9 이하는 지원하지 않습니다').removeClass('hidden');
  }
  /* TODO Enable in-app browser check
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
  */

  // Kakaotalk sharing
  if ($('#kakaotalk-share').length > 0) {
    Kakao.init('65f84ff7df81228e95f0924b27986935');
    Kakao.Link.createTalkLinkButton({
      container: '#kakaotalk-share',
      label: $('#kakaotalk-share__label').val(),
      image: {
        src: $('#kakaotalk-share__image-src').val(),
        width: $('#kakaotalk-share__image-width').val(),
        height: $('#kakaotalk-share__image-height').val()
      },
      webButton: {
        text: $('#kakaotalk-share__btn-text').val(),
        url: $('#kakaotalk-share__url').val()
      }
    });
  }
});
