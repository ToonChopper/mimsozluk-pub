angular.module('app')

.controller('MainController', ['$scope'
							, '$window'
							, 'PrefsService'
							, function($scope
								, $window
								, PrefsService) {

	console.log('-- init main controller');

	$scope.onExit = function() {
		console.log ('app exit');
		if (!$rootScope.disableSaveOnExit) {
			PrefsService.save();
		}
	};

	$window.onbeforeunload = $scope.onExit;

	$scope.$on('onShowPage', function(event, entry) {
		// console.log('-- onShowPage');
		setTimeout($scope.notifyPage, 300 , entry);
	});

	$scope.$on('onRemoteError', function(event, infoObj) {
		// console.log('-- onRemoteError');
		ons.notification.toast(infoObj.msg, { timeout: 2000 });
	});

	$scope.$on('onCheckDictUpdate', function(event, entry) {
		// console.log('-- onCheckDictUpdate');
		$scope.$broadcast('doDictionaryUpdate', entry);
	});

	$scope.$on('onCheckVersionUpdate', function(event, entry) {
		// console.log('-- onCheckVersionUpdate');
		$scope.$broadcast('doVersionUpdate', entry);
	});

	$scope.$on('onDictUpdateDoneRemote', function(event, entry) {
		// console.log('-- onDictUpdateDoneRemote');
		// $scope.$broadcast('doDictUpdateDoneRemote', entry);
	});

	$scope.$on('onDictUpdateDone', function(event, entry) {
		// console.log('-- onDictUpdateDone');
		$scope.$broadcast('doDictUpdateDone', entry);
	});

	$scope.notifyPage = function (entry) {
		//console.log('-- notifyPage');
		$scope.$broadcast('myShowPage', entry);
	}
}]);
