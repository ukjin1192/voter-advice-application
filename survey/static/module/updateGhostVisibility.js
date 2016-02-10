'use strict';

var $ = require('jquery');

module.exports = function updateGhostVisibility(progress) {

  switch (progress) {
    case 0:
      $('.ghost-pink, .ghost-blue, .ghost-orange, .ghost-red').removeClass('hidden');
      break;
    case 1:
      $('.ghost-pink').addClass('hidden');
      $('.ghost-blue, .ghost-orange, .ghost-red').removeClass('hidden');
      break;
    case 2:
      $('.ghost-pink, .ghost-blue').addClass('hidden');
      $('.ghost-orange, .ghost-red').removeClass('hidden');
      break;
    case 3:
      $('.ghost-pink, .ghost-blue, .ghost-orange').addClass('hidden');
      $('.ghost-red').removeClass('hidden');
      break;
    case 4:
      $('.ghost-pink, .ghost-blue, .ghost-orange, .ghost-red').addClass('hidden');
      break;
    default:
      break;
  }
  return;
}
