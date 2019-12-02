// This is a JavaScript file

angular.module('app')

.controller('CountriesController', ['$scope', 'Countries', function($scope, Countries) {
  var that = this;

  Countries.get()
    .then(
      function(countries) {
        that.list = countries;
      }
    );

  this.showCountry = function(country) {
    $scope.navi.pushPage('country.html', {data: {name: country}});
  };
}]);