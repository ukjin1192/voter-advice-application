'use strict';

var $ = require('jquery');

module.exports = function activateSlotMachine(wordList) {
  var $wordbox = $('#wordbox');

  function buildSlotItem (text) {
    return $('<div>').addClass('slot-machine__item').text(text)
  }

  function buildSlotContents ($container, wordList) {
    var $items = wordList.map(buildSlotItem);
    $container.append($items);
  }

  function popPushNItems ($container, n) {
    var $children = $container.find('.slot-machine__item');
    $children.slice(0, n).insertAfter($children.last());
    if (n === $children.length) popPushNItems($container, 1);
  }

  function rotateContents ($container, n) {
    setTimeout(function () {
      popPushNItems($container, n);
      $container.css({top: 0});
    }, 300); 
  }

  buildSlotContents($wordbox, wordList);  

  setInterval(function() { 
    var wordIndex = Math.floor(Math.random() * wordList.length);
    // Should be same with height of `slot-machine__item`
    $wordbox.animate({top: -wordIndex * 80}, 500, 'swing', function () {
      rotateContents($wordbox, wordIndex);
    });
  }, 1500);

  return;
}
