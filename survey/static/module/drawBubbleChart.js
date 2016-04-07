'use strict';

// Load modules
var $ = require('jquery');
var dimple = require('dimple-js');

module.exports = function drawBubbleChart(selector, width, records, xAxisName, yAxisName, minValue, maxValue) {

  // Empty chart container
  $(selector).empty();

  var staticRecords = [];
  var dynamicRecords = [];

  records.forEach(function(record, index) {
    if (record['x_coord'].indexOf(':') > -1 ||
      record['y_coord'].indexOf(':') > -1 ||
      record['name'] == '나') dynamicRecords.push(record);
    else staticRecords.push(record);
  });

  // Initiate chart with specific size
  var svgBlock = dimple.newSvg(selector, width, width);
  var chart = new dimple.chart(svgBlock, staticRecords);
  chart.setBounds('0px', '0px', width + 'px', width + 'px');

  // Matching with data-set
  var xAxis= chart.addMeasureAxis('x', 'x_coord');
  var yAxis = chart.addMeasureAxis('y', 'y_coord');
  var zAxis = chart.addMeasureAxis('z', 'z_coord');

  // X axis configuration
  xAxis.title = xAxisName;
  xAxis.fontSize = 10;
  xAxis.overrideMin = minValue;
  xAxis.overrideMax = maxValue;
  xAxis.ticks = 10;

  // Y axis configuration
  yAxis.title = yAxisName;
  yAxis.fontSize = 10;
  yAxis.overrideMin = minValue;
  yAxis.overrideMax = maxValue;
  yAxis.ticks = 10;

  // Set bubble radius size
  var chartSeries = chart.addSeries('name', dimple.plot.bubble);
  chartSeries.radius = 10;

  // Assign color for each record
  staticRecords.forEach(function(record, index) {
    chart.assignColor(record.name, record.color);
  });

  // Add text to each bubble
  chartSeries.afterDraw = function (shp, d, i) {
    
    var sameRecords = _.filter(staticRecords, {'x_coord': staticRecords[i].x_coord, 'y_coord': staticRecords[i].y_coord});
    var thisIndex = 0;
    
    if (sameRecords.length > 1) {
      var thisIndex = _.findIndex(sameRecords, {'name': staticRecords[i].name});
    }

    var shape = d3.select(shp);
    var bubble = svgBlock.append('text')
        .attr('x', parseFloat(shape.attr('cx')))
        .attr('y', parseFloat(shape.attr('cy') - 15 * thisIndex))
        .style('text-anchor', 'middle')         // Horizontal alignment
        .style('alignment-baseline', 'middle')  // Vertical alignment
        .style('font-size', '0.9em')
        .style('font-weight', '500')
        .style('fill', 'black')
        .text(staticRecords[i].name);
  };

  // Draw chart
  chart.draw(1000);

  // Draw dynamic records
  setTimeout(function () {
    dynamicRecords.forEach(function(record, index) {
      if (record['x_coord'].indexOf(':') > -1) {
        var rawX = record['x_coord'].split(':');
        var xCoordinateMin = parseInt(rawX[0]);
        var xCoordinateMax = parseInt(rawX[1]);
      } else {
        var xCoordinateMin = parseInt(record['x_coord']);
        var xCoordinateMax = parseInt(record['x_coord']);
      }
      
      if (record['y_coord'].indexOf(':') > -1) {
        var rawY = record['y_coord'].split(':');
        var yCoordinateMin = parseInt(rawY[0]);
        var yCoordinateMax = parseInt(rawY[1]);
      } else {
        var yCoordinateMin = parseInt(record['y_coord']);
        var yCoordinateMax = parseInt(record['y_coord']);
      }
      
      if (record['name'] == '나') {
        var bubble = svgBlock.append('circle')
            .attr('cx', xAxis._scale(xCoordinateMax))
            .attr('cy', yAxis._scale(yCoordinateMax))
            .attr('r', 16)
            .style('fill', record['color']);
        
        var bubbleText = svgBlock.append('text')
            .attr('x', xAxis._scale(xCoordinateMax))
            .attr('y', yAxis._scale(yCoordinateMax))
            .style('text-anchor', 'middle')         // Horizontal alignment
            .style('alignment-baseline', 'middle')  // Vertical alignment
            .style('font-size', '1.3em')
            .style('font-weight', '500')
            .style('fill', 'white')
            .text(record['name']);
      } else {
        var bubble = svgBlock.append('circle')
            .attr('cx', xAxis._scale(xCoordinateMax))
            .attr('cy', yAxis._scale(yCoordinateMax))
            .attr('r', 10)
            .style('fill', record['color']);
        
        var bubbleText = svgBlock.append('text')
            .attr('x', xAxis._scale(xCoordinateMax))
            .attr('y', yAxis._scale(yCoordinateMax))
            .style('text-anchor', 'middle')         // Horizontal alignment
            .style('alignment-baseline', 'middle')  // Vertical alignment
            .style('font-size', '0.9em')
            .style('font-weight', '500')
            .style('fill', 'black')
            .text(record['name']);
      }
      
      // Patrol bubble
      patrolObject(bubble, 'bubble', 
        xAxis._scale(xCoordinateMax), 
        xAxis._scale(xCoordinateMax) - xAxis._scale(xCoordinateMin), 
        yAxis._scale(yCoordinateMax), 
        yAxis._scale(yCoordinateMax) - yAxis._scale(yCoordinateMin));
      
      // Patrol bubble text
      patrolObject(bubbleText, 'text',
        xAxis._scale(xCoordinateMax), 
        xAxis._scale(xCoordinateMax) - xAxis._scale(xCoordinateMin), 
        yAxis._scale(yCoordinateMax), 
        yAxis._scale(yCoordinateMax) - yAxis._scale(yCoordinateMin));
    });
  }, 1000);

  var durationOfTrasition = 2500;

  function moveObject(object, type, originX, xDelta, originY, yDelta, direction) {
    if (type == 'text') {
      var xAttr = 'x';
      var yAttr = 'y';
    } else {
      var xAttr = 'cx';
      var yAttr = 'cy';
    }
    
    if (direction == 'x') {
      object.
        transition().
        duration(durationOfTrasition).
        attr(xAttr, originX - xDelta).
        transition().
        duration(durationOfTrasition).
        attr(xAttr, originX);
    } else if (direction == 'y') {
      object.
        transition().
        duration(durationOfTrasition).
        attr(yAttr, originY - yDelta).
        transition().
        duration(durationOfTrasition).
        attr(yAttr, originY);
    } else {
      object.
        transition().
        duration(durationOfTrasition).
        attr(xAttr, originX - xDelta).
        transition().
        duration(durationOfTrasition).
        attr(yAttr, originY - yDelta).
        transition().
        duration(durationOfTrasition).
        attr(xAttr, originX).
        transition().
        duration(durationOfTrasition).
        attr(yAttr, originY);
    }
  }

  // Patrol object
  function patrolObject(object, type, originX, xDelta, originY, yDelta) {
    if (type == 'text') {
      var xAttr = 'x';
      var yAttr = 'y';
    } else {
      var xAttr = 'cx';
      var yAttr = 'cy';
    }
    var counter = 0;
    
    if (xDelta != 0 && yDelta != 0) {
      moveObject(object, type, originX, xDelta, originY, yDelta, 'xy');
      var timer = setInterval(function() {
        moveObject(object, type, originX, xDelta, originY, yDelta, 'xy');
        if (counter >= 1) {
          object.
            transition().
            duration(durationOfTrasition).
            attr(xAttr, originX - xDelta / 2).
            transition().
            duration(durationOfTrasition).
            attr(yAttr, originY - yDelta / 2);
          clearInterval(timer);
        }
        else counter++;
      }, 4 * durationOfTrasition);
    } else if (xDelta != 0) {
      moveObject(object, type, originX, xDelta, originY, yDelta, 'x');
      var timer = setInterval(function() {
        moveObject(object, type, originX, xDelta, originY, yDelta, 'x');
        if (counter >= 3) {
          object.
            transition().
            duration(durationOfTrasition).
            attr(xAttr, originX - xDelta / 2);
          clearInterval(timer);
        }
        else counter++;
      }, 2 * durationOfTrasition);
    } else if (yDelta != 0) {
      moveObject(object, type, originX, xDelta, originY, yDelta, 'y');
      var timer = setInterval(function() {
        moveObject(object, type, originX, xDelta, originY, yDelta, 'y');
        if (counter >= 3) {
          object.
            transition().
            duration(durationOfTrasition).
            attr(yAttr, originY - yDelta / 2);
          clearInterval(timer);
        }
        else counter++;
      }, 2 * durationOfTrasition);
    }
  }

  return;
}
