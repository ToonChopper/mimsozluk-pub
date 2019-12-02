angular.module('app')

.controller('AppController', ['$scope'
														, '$window'
														, 'PrefsService'
														, function($scope
															, $window
															, PrefsService) {

	console.log('-- init main controller');


	$scope.onExit = function() {
		console.log ('app exit');
		if (!$scope.disableSaveOnExit) {
			PrefsService.save();
		}
	};
	
	$scope.appTitle = "Mimarlık Sözlüğü";
	$scope.appVersion = "1.0.2";
	$scope.aboutTitle = "ANSİKLOPEDİK MİMARLIK SÖZLÜĞÜ";
	$scope.aboutText = "Bu uygulama ve içeriğin her hakkı saklı olup, tümü ya da bölümleri hiçbir şekilde çoğaltılamaz, farklı biçimlerde de olsa bilgisayar ortamına aktarılamaz. Bu işlemler ancak telif hakkı sahibinin yazılı onayı ile olabilir.";
	$scope.copyright1 = "Telif Hakkı © 2019 | Doğan HASOL";
	$scope.copyright2 = "Tüm Hakları Saklıdır.";
	$scope.copyright3 = "bilgi@mimarliksozlugu.net";

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
		$scope.$broadcast('doDictUpdateDoneRemote', entry);
	});

	$scope.$on('onDictUpdateDone', function(event, entry) {
		// console.log('-- onDictUpdateDone');
		$scope.$broadcast('doDictUpdateDone', entry);
	});

	$scope.notifyPage = function (item) {
		console.log('-- notifyPage - entry: ' + item.entry);
		$scope.$broadcast('myShowPage', item);
	}
}]);
