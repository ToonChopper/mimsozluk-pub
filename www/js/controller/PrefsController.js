angular.module('app')

.controller('PrefsController'
				, ['$scope'
					, '$rootScope'
					, function($scope 
					, $rootScope
					)
				{

	var that = this;


	var enablePrefs = false;

	this.reset = function() {
		console.log("PrefsController.reset");
		$rootScope.prefs = jQuery.extend(true, {}, $rootScope.defaultPrefs);
	}

	this.test = function() {
		console.log("test");
	};
}]);
