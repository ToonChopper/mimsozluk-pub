// This is a JavaScript file

angular.module('app')

.service('DictionaryUpdate', ['$http', function ($http) {
  this.get = function (country, year) {
	 return {status: "no_change", error:"", updatedWordList: []};
  };
}]);