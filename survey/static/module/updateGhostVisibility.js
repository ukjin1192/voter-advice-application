'use strict';

// Load modules
var $ = require('jquery');

module.exports = function updateGhostVisibility() {
  
  // Prevent from execution before window is loaded
  if ($('#section-slider-container').css('display') == 'none') return;

  var $rangeSliderHandle = $('#section-slider-container .rangeslider__handle');
  var handlePosition = $rangeSliderHandle.offset().left + $rangeSliderHandle.width();

  if ($('.ghost-pink').offset().left < handlePosition) $('.ghost-pink').css('visibility', 'hidden');
  else $('.ghost-pink').css('visibility', 'visible');

  if ($('.ghost-blue').offset().left < handlePosition) $('.ghost-blue').css('visibility', 'hidden');
  else $('.ghost-blue').css('visibility', 'visible'); 

  if ($('.ghost-orange').offset().left < handlePosition) $('.ghost-orange').css('visibility', 'hidden');
  else $('.ghost-orange').css('visibility', 'visible'); 

  if ($('.ghost-red').offset().left < handlePosition) $('.ghost-red').css('visibility', 'hidden');
  else $('.ghost-red').css('visibility', 'visible'); 

  return;
}
