'use strict';

var $ = require('jquery');
var dimple = require('dimple-js');

module.exports = function drawTwoDimensionalChart(rows) {
  var chartWidth = $('#two-dimensional-result').width();
  var svgBlock = dimple.newSvg('#two-dimensional-result', chartWidth, chartWidth);
  var chart = new dimple.chart(svgBlock, rows);
  
  var xAxis = chart.addMeasureAxis('x', 'x_coordinate');
  var yAxis = chart.addMeasureAxis('y', 'y_coordinate');
  var zAxis = chart.addMeasureAxis('z', 'radius');
  
  xAxis.title = '가로축: 경제';
  xAxis.fontSize = 12;
  
  yAxis.title = '세로축: 사회';
  yAxis.fontSize = 12;
  
  var chartSeries = chart.addSeries('name', dimple.plot.bubble);
  
  rows.forEach(function(row, index) {
    chart.assignColor(row.name, row.color);
    $('#label-list').append('<span class="label" style="background-color: ' + row.color + ';">' + row.name + '</span>');
  });
  
  chartSeries.afterDraw = function (shp, d, i) {
      var shape = d3.select(shp);
      svgBlock.append('text')
          .attr('x', parseFloat(shape.attr('cx')))
          .attr('y', parseFloat(shape.attr('cy')))
          .style('text-anchor','middle')
          .style('font-weight', 'bold')
          .style('fill', 'white')
          .text(rows[i].name);
  };
  chart.draw(1000);
  return;
}
