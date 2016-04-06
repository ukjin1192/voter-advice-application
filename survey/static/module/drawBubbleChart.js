'use strict';

// Load modules
var $ = require('jquery');
var dimple = require('dimple-js');

module.exports = function drawBubbleChart(selector, width, records, xAxisName, yAxisName) {

  // Empty chart container
  $(selector).empty();

  // Initiate chart with specific size
  var svgBlock = dimple.newSvg(selector, width, width);
  var chart = new dimple.chart(svgBlock, records);
  chart.setBounds('0px', '0px', width + 'px', width + 'px');

  // Matching with data-set
  var xAxis= chart.addMeasureAxis('x', 'x_coord');
  var yAxis = chart.addMeasureAxis('y', 'y_coord');
  var zAxis = chart.addMeasureAxis('z', 'z_coord');

  // X axis configuration
  xAxis.title = xAxisName;
  xAxis.fontSize = 10;
  xAxis.overrideMin = -20;
  xAxis.overrideMax = 20;
  xAxis.ticks = 10;

  // Y axis configuration
  yAxis.title = yAxisName;
  yAxis.fontSize = 10;
  yAxis.overrideMin = -20;
  yAxis.overrideMax = 20;
  yAxis.ticks = 10;

  // Set bubble radius size
  var chartSeries = chart.addSeries('name', dimple.plot.bubble);
  chartSeries.radius = 10;

  // Assign color for each record
  records.forEach(function(record, index) {
    chart.assignColor(record.name, record.color);
  });

  // Add text to each bubble
  chartSeries.afterDraw = function (shp, d, i) {
    var shape = d3.select(shp);
    svgBlock.append('text')
        .attr('x', parseFloat(shape.attr('cx')))
        .attr('y', parseFloat(shape.attr('cy')) - 5)  // Slightly upper side
        .style('text-anchor', 'middle')         // Horizontally center
        .style('alignment-baseline', 'middle')  // Vertically center
        .style('font-size', '0.9em')
        .style('font-weight', '500')
        .style('fill', 'black')
        .text(records[i].name);
  };
  chart.draw(1000);

  // xAxis.gridlineShapes.selectAll('line').attr('stroke', 'black');
  // yAxis.gridlineShapes.selectAll('line').attr('stroke', 'black');
  
  return;
}
