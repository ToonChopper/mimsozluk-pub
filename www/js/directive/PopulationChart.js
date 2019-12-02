// This is a JavaScript file

angular.module('app')

.factory('nv', function() {
  return nv;
})

.factory('d3', function() {
  return d3;
})

.directive('populationChart', ['nv', 'd3', function(nv, d3) {
  return {
    restrict: 'E',
    scope: {
      data: '='
    },
    controller: 'PopulationChartController',
    link: function(scope, element, attrs) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      element.append(svg);

      var chart;

      scope.updateChart = function(data) {
        d3.select(svg)
          .datum(data)
          .call(chart);
      };

      nv.addGraph(function() {
        chart = nv.models.multiBarChart()
        //.useInteractiveGuideline(true)
        .showControls(true)
		.stacked(true)
        .margin({left: 50, right: 30});

        chart.xAxis
          .tickFormat(d3.format(',r'));

        chart.yAxis
          .tickFormat(function(d) {
            if ((d / 1000000) >= 1) {
              d = Math.round(d / 100000) / 10 + 'M';
            }
            else if ((d / 1000) >= 1) {
              d = Math.round(d / 100) / 10 + 'K';
            }
            return d;
          });

        nv.utils.windowResize(function() {
          chart.update();
        });

        scope.$emit('chartloaded');

        return chart;
      });
    }
  }
}]);