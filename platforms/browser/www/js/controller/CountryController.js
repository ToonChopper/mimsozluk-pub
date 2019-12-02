// This is a JavaScript file

angular.module('app')

.controller('CountryController', ['$scope', 'Population', function($scope, Population) {
  var that = this;
  this.name = $scope.navi.topPage.data.name;

  this.showChart = false;
  $scope.navi.on('postpush', function() {
    $scope.$evalAsync(function() {
      that.showChart = true;
    });

    $scope.navi.off('postpush');
  });

  var currentYear = (new Date()).getUTCFullYear();
  this.year = currentYear + '';

  this.years = [];
  for (var i = 1950; i <= 2100; i++) {
    this.years.push('' + i);
  }

  this.getPopulation = function() {
    Population.get(this.name, this.year)
      .then(
        function(population) {
          that.population = population;
        }
      );
  };

  $scope.$watch('country.year', function() {
    that.getPopulation();
  });
}]);