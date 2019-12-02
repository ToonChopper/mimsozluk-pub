// This is a JavaScript file

angular.module('app')

.controller('PopulationChartController', ['$scope', function($scope) {
  $scope.formatData = function() {
    if (!$scope.data) {
      return [];
    }

    var total = [],
      males = [],
      females =[];

    for (var i = 0; i < $scope.data.length; i++) {
      var data = $scope.data[i];

      total.push({x: data.age, y: data.total});
      males.push({x: data.age, y: data.males});
      females.push({x: data.age, y: data.females});
    }

    return [
      {
        key: 'Total',
        values: total
      },
      {
        key: 'Women',
        values: females
      },
      {
        key: 'Men',
        values: males
      }
    ];
  };


  $scope.$on('chartloaded', function(event) {
    event.stopPropagation();

    $scope.updateChart($scope.formatData());

    $scope.$watch('data', function() {
      if ($scope.data) {
        $scope.updateChart($scope.formatData());
      }
    });
  });
}]);