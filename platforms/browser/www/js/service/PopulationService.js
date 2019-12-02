// This is a JavaScript file

angular.module('app')

.service('Population', ['$http', function($http) {
  this.get = function(country, year) {
    return $http.jsonp('http://api.population.io:80/1.0/population/' + year + '/' + country + '/?format=jsonp&callback=JSON_CALLBACK')
      .then(
        function(response) {
          return response.data;
        }
      );
  };
}]);