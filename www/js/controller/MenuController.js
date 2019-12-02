angular.module('app')

.controller('MenuController', ['$scope', function($scope) {
	
	this.load = function(page) {
		let pages = $scope.navi.pages;

		console.log("-- MenuController.load: " + page);
		if (page != null) {
			if (page == "main.html") {
				// remove intermediate pages to enable single page pop animation
				for (let i = 0; i < pages.length - 2; i++) {
					$scope.navi.pages[1].remove();
				}
				$scope.navi.popPage();
			} else {
				$scope.navi.replacePage(page, { data: null });
			}
		}
	};

	this.gotoHomePage = function() {
		this.load('main.html');
	};

	this.setPlatform = function(p) {
		console.log('setPlatform: ' + p);
		ons.forcePlatformStyling(p);
	};

}]);