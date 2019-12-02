// This is a JavaScript file

angular.module('app')

.service('Countries', ['$http', function($http) {
  this.get = function() {
    return $http.get('countries.json')
      .then(
        function(response) {
          return response.data.countries;
        }
      );
  };
}]);
