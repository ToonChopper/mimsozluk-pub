// This is a JavaScript file

angular.module('app')

.service('MainDictionary', ['$http', function($http) {

	this.get = function(sectionId) {
		let url = `db/dictionary/${sectionId}.json`;
		// url = url.replace(/{sectionId}/g,	sectionId);

		let promise = $http.get(url, {'method': 'GET', 'responseType': 'json'}).then(
				(response) => { 
					return response.data; 
				}
				, (err) => {
					console.log("MainDictionary error");
					return [];
				});

		return promise;
	};

	this.loadIndex = function() {
		let url = 'db/dictionary/index.json';

		return $http.get(url, {'method': 'GET', 'responseType': 'json'})
			.then(
				function(response) {
					return response.data;
				}
				, function(err) {
					console.log("MainDictionary error");
					return [];
				});
	};

}]);
