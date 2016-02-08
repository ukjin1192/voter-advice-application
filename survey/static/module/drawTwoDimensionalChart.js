'use strict';

var $ = require('jquery');
var dimple = require('dimple-js');

module.exports = function drawTwoDimensionalChart(rows, xAxisName, yAxisName) {
  var chartWidth = $('#two-dimensional-result').width();
  var svgBlock = dimple.newSvg('#two-dimensional-result', chartWidth, chartWidth);
  var chart = new dimple.chart(svgBlock, rows);
  
  var xAxis = chart.addMeasureAxis('x', 'x_coordinate');
  var yAxis = chart.addMeasureAxis('y', 'y_coordinate');
  var zAxis = chart.addMeasureAxis('z', 'radius');
  
  xAxis.title = xAxisName;
  xAxis.fontSize = 12;
  
  yAxis.title = yAxisName;
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

  // Debug axis names are cut or not shown
  if (chartWidth < 480) $('#two-dimensional-result > svg').attr({'width': chartWidth + 10, 'height': chartWidth + 20});
  $('#two-dimensional-result > svg').css({'padding-left': '30px', 'margin-left': '-20px'});

  return;
}
