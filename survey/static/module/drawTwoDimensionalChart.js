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
  var myCoordinatesX, myCoordinatesY;

  rows.forEach(function(row, index) {
    chart.assignColor(row.name, row.color);
    $('#label-list').append('<span class="label" style="background-color: ' + row.color + ';">' + row.name + '</span>');
    if (row.name == '나') {
      myCoordinatesX = row.x_coordinate;
      myCoordinatesY = row.y_coordinate;
    }
  });

  var distanceList = [];

  rows.forEach(function(row, index) {
    if (row.name != '나') {
      distanceList.push({
        'distance': Math.sqrt(Math.pow(row.x_coordinate - myCoordinatesX, 2) + Math.pow(row.y_coordinate - myCoordinatesY, 2)),
        'name': row.name
      });
    }
  });

  // Fill out result summary
  $('#most-similar-user').text(_.minBy(distanceList, 'distance').name);
  $('#most-dissimilar-user').text(_.maxBy(distanceList, 'distance').name);

  chartSeries.afterDraw = function (shp, d, i) {
    var shape = d3.select(shp);
    if (rows[i].name == '나') {
      svgBlock.append('text')
        .attr('x', parseFloat(shape.attr('cx')))
        .attr('y', parseFloat(shape.attr('cy')))
        .style('text-anchor', 'middle')         // Horizontally center
        .style('alignment-baseline', 'middle')  // Vertically center
        .style('font-size', '2.0em')
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(rows[i].name);
    }
    else {
      svgBlock.append('text')
        .attr('x', parseFloat(shape.attr('cx')))
        .attr('y', parseFloat(shape.attr('cy')))
        .style('text-anchor', 'middle')         // Horizontally center
        .style('alignment-baseline', 'middle')  // Vertically center
        .style('font-weight', 'bold')
        .style('fill', 'white')
        .text(rows[i].name);
    }
  };
  chart.draw(1000);

  // Debug axis names are cut or not shown
  if (chartWidth < 480) $('#two-dimensional-result > svg').attr({'width': chartWidth + 10, 'height': chartWidth + 20});
  $('#two-dimensional-result > svg').css({'padding-left': '30px', 'margin-left': '-20px'});

  return;
}
